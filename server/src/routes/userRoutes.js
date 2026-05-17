import { Router } from 'express';
import { changeMyPassword, deleteUser, getAnalytics, getMyAccount, getUsers, updateMyAccount } from '../controllers/userController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, getMyAccount);
router.put('/me', requireAuth, updateMyAccount);
router.patch('/me/password', requireAuth, changeMyPassword);
router.get('/', requireAuth, requireAdmin, getUsers);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);
router.get('/analytics', requireAuth, requireAdmin, getAnalytics);

export default router;
