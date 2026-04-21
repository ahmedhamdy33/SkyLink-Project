import { Router } from 'express';
import { createFlight, deleteFlight, getFlightSeats, listFlights, searchFlights, updateFlight, updateFlightStatus } from '../controllers/flightController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', listFlights);
router.get('/search', searchFlights);
router.get('/:id/seats', getFlightSeats);
router.post('/', requireAuth, requireAdmin, createFlight);
router.put('/:id', requireAuth, requireAdmin, updateFlight);
router.delete('/:id', requireAuth, requireAdmin, deleteFlight);
router.patch('/:id/status', requireAuth, requireAdmin, updateFlightStatus);

export default router;
