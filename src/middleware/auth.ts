import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import XApiService from '../services/xApiService';
import { User } from '../types';

// Extend Express Request type to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      isAuthenticated?: boolean;
      session: {
        user?: {
          accessToken: string;
          refreshToken: string;
          tokenExpiry: number;
          userId: string;
          username: string;
        };
        codeVerifier?: string;
        authResponse?: {
          token: string;
          user: User;
        };
        destroy: (callback: (err?: Error) => void) => void;
      };
    }
  }
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
  public authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First try JWT authentication
      const token = this.extractTokenFromHeader(req);
      
      if (token) {
        try {
          const decoded = jwt.verify(token, this.JWT_SECRET) as User;
          req.user = decoded;
          req.isAuthenticated = true;
          return next();
        } catch (error) {
          // If JWT fails, try X authentication
          console.log('JWT verification failed, trying X authentication');
        }
      }

      // Try X authentication
      if (!req.session?.user) {
        return res.redirect('/auth/login');
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
          return res.redirect('/auth/login');
        }
      }

      // Set user in request
      req.user = {
        id: user.userId,
        username: user.username,
        accessToken: user.accessToken,
        role: 'user' as const
      };
      req.isAuthenticated = true;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed' 
      });
    }
  };

  // Generate JWT token
  public generateToken = (user: User): string => {
    return jwt.sign(user, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as jwt.SignOptions);
  };

  // Verify JWT token
  public verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractTokenFromHeader(req);
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication token is required' 
        });
      }

      const decoded = jwt.verify(token, this.JWT_SECRET) as User;
      req.user = decoded;
      req.isAuthenticated = true;
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  };

  // Check if user has required role
  public checkRole = (requiredRole: User['role']) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      if (req.user.role !== requiredRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
      }

      next();
    };
  };

  // Check if user is authenticated
  public isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    next();
  };

  // Check if user is not authenticated (for login/register routes)
  public isNotAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated) {
      return res.status(403).json({ 
        success: false, 
        message: 'User already authenticated' 
      });
    }
    next();
  };

  // Rate limiting middleware
  public rateLimit = (limit: number, windowMs: number) => {
    const requests = new Map<string, { count: number; timestamp: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || req.socket.remoteAddress;
      if (!ip) {
        return res.status(400).json({
          success: false,
          message: 'Could not determine client IP'
        });
      }

      const now = Date.now();
      const userRequests = requests.get(ip);
      
      if (!userRequests) {
        requests.set(ip, { count: 1, timestamp: now });
        next();
      } else if (now - userRequests.timestamp > windowMs) {
        requests.set(ip, { count: 1, timestamp: now });
        next();
      } else if (userRequests.count >= limit) {
        return res.status(429).json({ 
          success: false, 
          message: 'Too many requests, please try again later' 
        });
      } else {
        userRequests.count++;
        next();
      }
    };
  };

  // Extract token from Authorization header
  private extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}

// Export singleton instance
export const authMiddleware = AuthMiddleware.getInstance();

// Export middleware functions for direct use
export const {
  authenticate,
  verifyToken,
  checkRole,
  isAuthenticated,
  isNotAuthenticated,
  rateLimit,
  generateToken
} = authMiddleware; 