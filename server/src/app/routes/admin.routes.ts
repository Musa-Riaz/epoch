import { Router } from 'express';
import { getSystemMetrics, getAllSystemProjects, deleteUser, getAllSystemTasks } from '../controllers/admin.controller';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Ensure all routes are protected by Super Admin role
router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/metrics', getSystemMetrics);
router.get('/projects', getAllSystemProjects);
router.get('/tasks', getAllSystemTasks);
router.delete('/users/:id', deleteUser);

export default router;
