import { Request, Response } from 'express';
import { XApiService } from '../services/xApiService';
import { authMiddleware } from '../middleware/auth';
import { User, AuthResponse } from '../types';
import axios from 'axios';
import { UserService } from '../services/userService';

const xApiService = new XApiService();
const userService = new UserService();

export const login = (req: Request, res: Response) => {
  try {
    // Check if user is already authenticated
    if (req.isAuthenticated) {
      return res.redirect('/dashboard');
    }

    console.log('Starting login process');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Callback URL:', process.env.X_CALLBACK_URL);
    console.log('Session before auth URL generation:', req.session);

    const { url, codeVerifier } = xApiService.generateAuthUrl();
    console.log('Generated code verifier:', codeVerifier);
    console.log('Generated auth URL:', url);

    req.session.codeVerifier = codeVerifier;
    console.log('Session after setting code verifier:', req.session);

    res.redirect(url);
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      error: 'Failed to start login process',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const storedState = req.session.state;

  if (!code || !state || state !== storedState) {
    console.log('Invalid state or missing code');
    return res.redirect('/auth/login?error=invalid_state');
  }

  try {
    const { accessToken, refreshToken, user } = await xApiService.exchangeCodeForToken(code as string);

    // Store user in database
    const dbUser = await userService.findOrCreateUser({
      id: user.id,
      username: user.username,
      name: user.name,
      profile_image_url: user.profile_image_url,
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // Store user in session
    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      profile_image_url: user.profile_image_url,
      accessToken,
      refreshToken
    };

    console.log(`User ${user.id} logged in successfully`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error during authentication:', error);
    res.redirect('/auth/login?error=auth_failed');
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    return res.redirect('/');
  });
};

// JWT-specific login endpoint
export const jwtLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // TODO: Implement actual user authentication
    if (username === 'demo' && password === 'password') {
      const user: User = {
        id: 'demo-user',
        username,
        email: 'demo@example.com',
        profileImageUrl: 'https://example.com/avatar.jpg',
        accessToken: 'demo-token',
        refreshToken: 'demo-refresh-token',
        tokenExpiry: Math.floor(Date.now() / 1000) + 3600,
        role: 'user'
      };

      const token = authMiddleware.generateToken(user);
      const response: AuthResponse = { token, user };

      res.json({
        success: true,
        data: response
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('JWT login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get current user info
export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json(req.user);
};

export const refreshToken = async (req: Request, res: Response) => {
  if (!req.session.user?.refreshToken) {
    console.log('No refresh token found in session');
    return res.status(401).json({ error: 'No refresh token available' });
  }

  try {
    const { accessToken, refreshToken } = await xApiService.refreshAccessToken(req.session.user.refreshToken);

    // Update tokens in database
    await userService.updateUserTokens(req.session.user.id, accessToken, refreshToken);

    // Update session
    req.session.user.accessToken = accessToken;
    req.session.user.refreshToken = refreshToken;

    console.log(`Tokens refreshed for user ${req.session.user.id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
}; 