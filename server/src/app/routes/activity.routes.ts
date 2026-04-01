import { Router } from 'express';
import { getActivityFeed } from '../controllers/activity.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getActivityFeed);

export default router;
