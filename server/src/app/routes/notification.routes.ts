import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getNotifications,
  readAllNotifications,
  readNotification,
} from '../controllers/notification.controller';
import { objectIdParamSchema, validateParams } from '../validators/schemas';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/read-all', authMiddleware, readAllNotifications);
router.patch('/:id/read', authMiddleware, validateParams(objectIdParamSchema), readNotification);

export default router;
