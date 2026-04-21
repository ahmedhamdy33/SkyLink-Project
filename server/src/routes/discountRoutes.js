import { Router } from 'express';
import { applyDiscount, createDiscount } from '../controllers/discountController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/apply', applyDiscount);
router.post('/', requireAuth, requireAdmin, createDiscount);

export default router;
