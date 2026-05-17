import { Router } from 'express';
import { createFlight, deleteFlight, updateFlight, updateFlightStatus } from '../controllers/flightController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);
router.patch('/:id/status', updateFlightStatus);

export default router;
