import { Router } from 'express';
import { confirmCardPayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/:bookingId/confirm-card', requireAuth, confirmCardPayment);

export default router;
