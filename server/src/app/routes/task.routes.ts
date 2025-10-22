import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask, getTasksByProject } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest, taskSchema } from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(taskSchema), createTask);
router.get('/', authMiddleware, getTasks);
router.patch('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

// Manager routes
router.get('/project/:projectId', authMiddleware, getTasksByProject);

export default router;
