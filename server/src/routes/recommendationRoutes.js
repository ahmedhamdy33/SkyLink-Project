import { Router } from 'express';
import { getRecommendations, getSearchHistory, saveSearchHistory } from '../controllers/recommendationController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getRecommendations);
router.get('/search-history', requireAuth, getSearchHistory);
router.post('/search-history', requireAuth, saveSearchHistory);

export default router;
