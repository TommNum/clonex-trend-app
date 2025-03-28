import { Request, Response } from 'express';
import { XApiService } from '../services/xApiService';
import { authMiddleware } from '../middleware/auth';
import { User, AuthResponse } from '../types';
import axios from 'axios';

const xApiService = new XApiService();

export const login = (req: Request, res: Response) => {
  // Check if user is already authenticated
  if (req.isAuthenticated) {
    return res.redirect('/dashboard');
  }

  console.log('Starting login process');
  console.log('Session before auth URL generation:', req.session);
  
  const { url, codeVerifier } = xApiService.generateAuthUrl();
  console.log('Generated code verifier:', codeVerifier);
  
  req.session.codeVerifier = codeVerifier;
  console.log('Session after setting code verifier:', req.session);
  
  res.redirect(url);
};

export const callback = async (req: Request, res: Response) => {
  try {
    console.log('Received callback with query params:', req.query);
    console.log('Current session state:', req.session);
    
    const { code, state, error } = req.query;
    const { codeVerifier } = req.session;

    if (error) {
      console.error('OAuth error:', error);
      return res.status(400).json({ error: `OAuth error: ${error}` });
    }

    if (!code || !codeVerifier) {
      console.error('Missing required parameters:', { 
        code: !!code, 
        codeVerifier: !!codeVerifier,
        sessionId: req.session.id,
        sessionExists: !!req.session
      });
      return res.status(400).json({ 
        error: 'Missing code or code verifier',
        details: {
          hasCode: !!code,
          hasCodeVerifier: !!codeVerifier,
          sessionId: req.session.id
        }
      });
    }

    console.log('Attempting to exchange code for token');
    const userInfo = await xApiService.exchangeCodeForToken(code.toString(), codeVerifier);
    console.log('Successfully exchanged code for token');

    const user: User = {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      profileImageUrl: userInfo.profileImageUrl,
      accessToken: userInfo.accessToken,
      refreshToken: userInfo.refreshToken,
      tokenExpiry: userInfo.tokenExpiry,
      role: 'user'
    };

    req.session.user = {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      profileImageUrl: userInfo.profileImageUrl,
      accessToken: userInfo.accessToken,
      refreshToken: userInfo.refreshToken,
      tokenExpiry: userInfo.tokenExpiry,
      role: 'user'
    };

    console.log('Successfully authenticated user:', userInfo.username);
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error in callback:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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