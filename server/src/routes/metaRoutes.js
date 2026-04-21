import { Router } from 'express';
import { getReferenceData } from '../controllers/metaController.js';

const router = Router();

router.get('/reference-data', getReferenceData);

export default router;
