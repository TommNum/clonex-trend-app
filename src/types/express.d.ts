import { User } from './index';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      profileImageUrl?: string;
      accessToken: string;
      refreshToken: string;
      tokenExpiry: number;
    };
    codeVerifier?: string;
    authResponse?: {
      token: string;
      user: User;
    };
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      profileImageUrl?: string;
      accessToken: string;
      refreshToken: string;
      tokenExpiry: number;
      role?: string;
    }
  }
} 