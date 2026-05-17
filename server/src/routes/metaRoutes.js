import { Router } from 'express';
import { getNotifications, getReferenceData } from '../controllers/metaController.js';

const router = Router();

router.get('/reference-data', getReferenceData);
router.get('/notifications', getNotifications);

export default router;
