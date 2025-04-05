import express from 'express';
import { login, callback, logout, jwtLogin, getCurrentUser, refreshToken } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// OAuth routes
router.get('/login', login);
router.get('/callback', callback);
router.get('/logout', logout);

// JWT routes
router.post('/jwt/login', jwtLogin);
router.get('/jwt/me', authMiddleware, getCurrentUser);
router.post('/jwt/refresh', refreshToken);

export default router; 