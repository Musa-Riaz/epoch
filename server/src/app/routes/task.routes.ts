import { Router } from 'express';
import { createTask, getTask, getTasks, updateTask, deleteTask, getTasksByProject, getUserbyTask, assignTask, getTasksByAssignedUser, bulkUpdateTaskStatus } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
	objectIdParamSchema,
	taskAssignSchema,
	taskBulkStatusSchema,
	taskProjectParamSchema,
	taskSchema,
	taskUpdateSchema,
	validateParams,
	validateRequest,
} from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(taskSchema), createTask);
router.post('/assign', authMiddleware, validateRequest(taskAssignSchema), assignTask);
router.patch('/bulk-status', authMiddleware, validateRequest(taskBulkStatusSchema), bulkUpdateTaskStatus);
router.get('/', authMiddleware, getTasks);
router.get('/project/:projectId', authMiddleware, validateParams(taskProjectParamSchema), getTasksByProject);
router.get('/assigned/:id', authMiddleware, validateParams(objectIdParamSchema), getTasksByAssignedUser);
router.get('/user/:id', authMiddleware, validateParams(objectIdParamSchema), getUserbyTask);
router.get('/:id', authMiddleware, validateParams(objectIdParamSchema), getTask);
router.patch('/:id', authMiddleware, validateParams(objectIdParamSchema), validateRequest(taskUpdateSchema), updateTask);
router.delete('/:id', authMiddleware, validateParams(objectIdParamSchema), deleteTask);

export default router;
