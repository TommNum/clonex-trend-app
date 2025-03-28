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
  const { code, state } = req.query;
  const codeVerifier = req.session.codeVerifier;
  
  if (!code || !codeVerifier) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request: Missing code or code verifier'
    });
  }

  try {
    // Exchange code for tokens
    const { accessToken, refreshToken, expiresIn } = await XApiService.getTokens(
      code as string,
      codeVerifier
    );

    // Get user info
    const userInfo = await XApiService.getUserInfo(accessToken);

    // Create user object
    const user: User = {
      id: userInfo.id,
      username: userInfo.username,
      accessToken,
      role: 'user'
    };

    // Generate JWT token
    const token = authMiddleware.generateToken(user);

    // Store user info and tokens in session
    req.session.user = {
      id: userInfo.id,
      username: userInfo.username,
      accessToken,
      refreshToken,
      tokenExpiry: Math.floor(Date.now() / 1000) + expiresIn
    };

    // Return both JWT token and user info
    const response: AuthResponse = {
      token,
      user
    };

    // Store response in session for client-side access
    req.session.authResponse = response;

    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const logout = (req: Request, res: Response) => {
  // Clear session
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: err.message
      });
    }

    // Clear any client-side tokens
    res.clearCookie('token');
    
    // Redirect to home page
    res.redirect('/');
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
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}; 