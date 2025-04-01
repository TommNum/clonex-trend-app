import express, { Router } from 'express';
import { requireAuth, rateLimit } from '../middleware/auth';
import * as trendController from '../controllers/trendController';
import { AuthenticatedRequest } from '../controllers/trendController';

const router = Router();

// Logging middleware for all trend routes
router.use((req, res, next) => {
    console.log(`[Trends] ${req.method} ${req.path}`);
    next();
});

// Rate limit for refresh trends (1 request per 15 minutes)
const refreshRateLimit = rateLimit(1, 15 * 60 * 1000);

// Get all trends
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        await trendController.getTrends(req, res);
    } catch (error) {
        console.error('Error in trends route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get trend details
router.get('/:trendId', requireAuth, trendController.getTrendDetails);

// Search last trend
router.get('/search/last', requireAuth, refreshRateLimit, trendController.searchLastTrend);

// Swap media for a trend
router.post('/:trendId/swap', requireAuth, trendController.swapTrendMedia);

export default router; 