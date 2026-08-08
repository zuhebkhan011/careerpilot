import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';

const router = Router();

router.get('/:profileId', getDashboardStats);

export default router;
