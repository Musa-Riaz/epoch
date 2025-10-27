import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectsByManager,
  getProjectAnalytics,
  getMembersByProject,
  getProjectsByMember
} from '../controllers/project.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest, projectSchema } from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(projectSchema), createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.get('/manager/:id', authMiddleware, getProjectsByManager);
router.get('/:id/analytics', authMiddleware, getProjectAnalytics);
router.get('/members/:id/projects', authMiddleware, getMembersByProject);
router.get('/manager/:id/projects', authMiddleware, getProjectsByManager);
router.get('/member/:userId/projects', authMiddleware, getProjectsByMember);
router.patch('/:id', authMiddleware, updateProject);
router.patch('/:id/status', authMiddleware, updateProjectStatus);
router.delete('/:id', authMiddleware, deleteProject);

export default router;
