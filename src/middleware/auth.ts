import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import XApiService from '../services/xApiService';
import { User } from '../types';
import { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      email?: string;
      profileImageUrl?: string;
      accessToken: string;
      refreshToken: string;
      tokenExpiry: number;
      role: 'user' | 'admin';
    };
    codeVerifier?: string;
    authResponse?: {
      token: string;
      user: User;
    };
  }
}

// Extend Express Request type to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      isAuthenticated(): this is AuthenticatedRequest;
    }
  }
}

interface AuthenticatedRequest extends Request {
  user: User;
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  private constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    this.JWT_SECRET = secret;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  // Main authentication middleware that handles both JWT and X auth
  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // First try JWT authentication
      const token = this.extractTokenFromHeader(req);
      
      if (token) {
        try {
          const decoded = jwt.verify(token, this.JWT_SECRET) as User;
          req.user = decoded;
          req.isAuthenticated = function(): this is AuthenticatedRequest {
            return true;
          };
          next();
          return;
        } catch (error) {
          // If JWT fails, try X authentication
          console.log('JWT verification failed, trying X authentication');
        }
      }

      // Try X authentication
      if (!req.session?.user) {
        res.redirect('/auth/login');
        return;
      }

      const user = req.session.user;
      const now = Date.now() / 1000;
      
      // Check if token needs refresh
      if (user.tokenExpiry < now) {
        try {
          const { accessToken, expiresIn } = await XApiService.refreshAccessToken(user.refreshToken);
          user.accessToken = accessToken;
          user.tokenExpiry = now + expiresIn;
          req.session.user = user;
        } catch (error) {
          console.error('Failed to refresh X token:', error);
          res.redirect('/auth/login');
          return;
        }
      }

      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        tokenExpiry: user.tokenExpiry,
        role: user.role
      };
      
      req.isAuthenticated = function(): this is AuthenticatedRequest {
        return true;
      };
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  };

  // Generate JWT token
  public generateToken = (user: User): string => {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        tokenExpiry: user.tokenExpiry,
        role: user.role
      },
      this.JWT_SECRET,
      { expiresIn: '1d' }
    );
  };

  // Verify JWT token
  public verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const decoded = jwt.verify(token, this.JWT_SECRET) as User;
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Check if user has required role
  public requireRole = (requiredRole: string): RequestHandler => {
    const handler: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      if (!req.user.role || req.user.role !== requiredRole) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
    return handler;
  };

  // Check if user is authenticated
  public isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    next();
  };

  // Check if user is not authenticated (for login/register routes)
  public isNotAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.user) {
      res.status(403).json({ error: 'Already authenticated' });
      return;
    }
    next();
  };

  // Rate limiting middleware
  public rateLimit = (limit: number, windowMs: number): RequestHandler => {
    const requests = new Map<string, { count: number; timestamp: number }>();

    const handler: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
      const ip = req.ip || req.socket.remoteAddress;
      if (!ip) {
        res.status(400).json({
          success: false,
          message: 'Could not determine client IP'
        });
        return;
      }

      const now = Date.now();
      const userRequests = requests.get(ip);
      
      if (!userRequests) {
        requests.set(ip, { count: 1, timestamp: now });
        next();
        return;
      }

      if (now - userRequests.timestamp > windowMs) {
        requests.set(ip, { count: 1, timestamp: now });
        next();
        return;
      }

      if (userRequests.count >= limit) {
        res.status(429).json({ 
          success: false, 
          message: 'Too many requests, please try again later' 
        });
        return;
      }

      userRequests.count++;
      next();
    };

    return handler;
  };

  // Extract token from Authorization header
  private extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  public validateRequest = (schema: any): RequestHandler => {
    const validator: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      next();
    };
    return validator;
  };
}

// Export singleton instance
export const authMiddleware = AuthMiddleware.getInstance();

// Export middleware functions for direct use
export const {
  authenticate,
  verifyToken,
  requireRole,
  isAuthenticated,
  isNotAuthenticated,
  rateLimit,
  generateToken,
  validateRequest
} = authMiddleware;

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session?.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Set up isAuthenticated function
  req.isAuthenticated = function(): this is AuthenticatedRequest {
    return true;
  };

  // Ensure user data is available
  req.user = {
    id: req.session.user.id,
    username: req.session.user.username,
    email: req.session.user.email,
    profileImageUrl: req.session.user.profileImageUrl,
    accessToken: req.session.user.accessToken,
    refreshToken: req.session.user.refreshToken,
    tokenExpiry: req.session.user.tokenExpiry,
    role: req.session.user.role
  };

  next();
};

export const requireGuest = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  return next();
};

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  return next();
};

export const checkSession = (req: Request, res: Response, next: NextFunction) => {
  console.log('Session check middleware:', {
    sessionId: req.session.id,
    hasSession: !!req.session,
    hasCodeVerifier: !!req.session?.codeVerifier,
    hasUser: !!req.session?.user,
    cookies: req.cookies,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    }
  });
  next();
}; 