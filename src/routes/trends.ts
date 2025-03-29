import express from 'express';
import { requireAuth, rateLimit } from '../middleware/auth';
import * as trendController from '../controllers/trendController';

const router = express.Router();

// Rate limit for refresh trends (1 request per 15 minutes)
const refreshRateLimit = rateLimit(1, 15 * 60 * 1000);

// Get all trends
router.get('/', requireAuth, trendController.getTrends);

// Get trend details
router.get('/:trendId', requireAuth, trendController.getTrendDetails);

// Search last trend
router.get('/search/last', requireAuth, refreshRateLimit, trendController.searchLastTrend);

// Swap media for a trend
router.post('/:trendId/swap', requireAuth, trendController.swapTrendMedia);

export default router; 