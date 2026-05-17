import { Router } from 'express';
import { createAircraft, deleteAircraft, getAircraftDetails, getAircraftSeatMap, listAircraft, updateAircraft } from '../controllers/aircraftController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', listAircraft);
router.get('/:id', getAircraftDetails);
router.get('/:id/seats', getAircraftSeatMap);
router.post('/', requireAuth, requireAdmin, createAircraft);
router.put('/:id', requireAuth, requireAdmin, updateAircraft);
router.delete('/:id', requireAuth, requireAdmin, deleteAircraft);

export default router;
