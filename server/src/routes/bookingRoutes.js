import { Router } from 'express';
import { cancelBooking, createBooking, getUserBookings, updateBooking } from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, createBooking);
router.get('/user/:userId', requireAuth, getUserBookings);
router.put('/:id', requireAuth, updateBooking);
router.delete('/:id', requireAuth, cancelBooking);

export default router;
