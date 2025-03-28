import express from 'express';
import { requireAuth } from '../middleware/auth';
import * as trendController from '../controllers/trendController';

const router = express.Router();

// Get all trends
router.get('/', requireAuth, trendController.getTrends);

// Get trend details
router.get('/:trendId', requireAuth, trendController.getTrendDetails);

// Swap media for a trend
router.post('/:trendId/swap', requireAuth, trendController.swapTrendMedia);

export default router; 