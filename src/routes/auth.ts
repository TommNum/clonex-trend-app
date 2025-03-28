import { Router } from 'express';
import * as authController from '../controllers/authController';
import { isNotAuthenticated } from '../middleware/auth';

const router = Router();

// Apply middleware to prevent authenticated users from accessing login
router.use('/login', isNotAuthenticated);

// Auth routes
router.get('/login', authController.login);
router.get('/callback', authController.callback);
router.get('/logout', authController.logout);

// JWT-specific routes
router.post('/jwt/login', isNotAuthenticated, authController.jwtLogin);
router.get('/me', authController.getCurrentUser);

export default router; 