import { Router } from 'express';
import { confirmCardPayment, getSandboxPaymentConfig } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/sandbox-config', requireAuth, getSandboxPaymentConfig);
router.post('/:bookingId/confirm-card', requireAuth, confirmCardPayment);

export default router;
