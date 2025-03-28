import { User } from './index';

declare module 'express-session' {
  interface SessionData {
    user?: User;
    codeVerifier?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email?: string;
      profileImageUrl?: string;
      accessToken: string;
      refreshToken: string;
      tokenExpiry: number;
      role?: string;
    }

    interface Request {
      user?: User;
      file?: {
        filename: string;
        path: string;
        mimetype: string;
      };
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }

    interface Session {
      user?: User;
      isAuthenticated?: boolean;
      returnTo?: string;
    }
  }
}

export {}; 