import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest, taskSchema } from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(taskSchema), createTask);
router.get('/', authMiddleware, getTasks);
router.patch('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

export default router;
