import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask, getTasksByProject, getUserbyTask, assignTask, getTasksByAssignedUser } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest, taskSchema } from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(taskSchema), createTask);
router.post('/assign', authMiddleware, assignTask);
router.get('/', authMiddleware, getTasks);
router.get('/assigned/:id', authMiddleware, getTasksByAssignedUser);
router.patch('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

// Manager routes
router.get('/project/:projectId', authMiddleware, getTasksByProject);
router.get('/user/:id', authMiddleware, getUserbyTask);

export default router;
