import { Request, Response } from 'express';
import XApiService from '../services/xApiService';
import { authMiddleware } from '../middleware/auth';
import { User, AuthResponse } from '../types';

export const login = (req: Request, res: Response) => {
  // Check if user is already authenticated
  if (req.isAuthenticated) {
    return res.redirect('/dashboard');
  }

  const { url, codeVerifier } = XApiService.generateAuthUrl();
  req.session.codeVerifier = codeVerifier;
  res.redirect(url);
};

export const callback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { codeVerifier } = req.session;

    if (!code || !codeVerifier) {
      return res.status(400).json({ error: 'Missing code or code verifier' });
    }

    const userInfo = await XApiService.exchangeCodeForToken(code.toString(), codeVerifier);

    const user: User = {
      id: userInfo.id,
      username: userInfo.username,
      accessToken: userInfo.accessToken,
      refreshToken: userInfo.refreshToken,
      tokenExpiry: userInfo.tokenExpiry,
      role: 'user'
    };

    req.session.user = {
      accessToken: userInfo.accessToken,
      refreshToken: userInfo.refreshToken,
      tokenExpiry: userInfo.tokenExpiry,
      userId: userInfo.id,
      username: userInfo.username
    };

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error in callback:', error);
    return res.status(500).json({ error: 'Authentication failed' });
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