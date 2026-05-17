import { Router } from 'express';
import { chatWithAssistant } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/chat', optionalAuth, chatWithAssistant);

export default router;
