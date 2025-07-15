// backend/src/routes/timeRoutes.ts

import { Router } from 'express';
import { TimeController } from '../controllers/timeController';

const router = Router();

router.post('/clock-in', TimeController.clockIn);

router.post('/clock-out', TimeController.clockOut);

router.get('/status/:userId', TimeController.getStatusAndEntriesToday);

router.get('/summary/:userId', TimeController.getDailySummaries);

export default router;