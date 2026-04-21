import { Router } from 'express';
import { deleteUser, getAnalytics, getUsers } from '../controllers/userController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, getUsers);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);
router.get('/analytics', requireAuth, requireAdmin, getAnalytics);

export default router;
