import { Router } from 'express';
import { forgotPassword, login, register, resendVerificationEmail, resetPassword, verifyEmail } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

export default router;
