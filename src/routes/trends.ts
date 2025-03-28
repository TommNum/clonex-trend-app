import { Router } from 'express';
import * as trendController from '../controllers/trendController';
import { authenticate, rateLimit } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply rate limiting to all routes
router.use(rateLimit(100, 60000)); // 100 requests per minute

// Trend routes
router.get('/', trendController.getTrends);
router.get('/analyze/:trendId', trendController.analyzeTrend);
router.post('/process/:trendName', trendController.processMediaSwap);
router.post('/post', trendController.postToX);
router.post('/auto-process', trendController.autoProcessTrend);

export default router; 