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