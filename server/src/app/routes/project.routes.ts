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
import {
  managerParamSchema,
  memberParamSchema,
  objectIdParamSchema,
  projectSchema,
  projectStatusSchema,
  projectUpdateSchema,
  validateParams,
  validateRequest,
} from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(projectSchema), createProject);
router.get('/', authMiddleware, getProjects);
router.get('/manager/:id/projects', authMiddleware, validateParams(managerParamSchema), getProjectsByManager);
router.get('/manager/:id', authMiddleware, validateParams(managerParamSchema), getProjectsByManager);
router.get('/member/:userId/projects', authMiddleware, validateParams(memberParamSchema), getProjectsByMember);
router.get('/members/:id/projects', authMiddleware, validateParams(objectIdParamSchema), getMembersByProject);
router.get('/:id/analytics', authMiddleware, validateParams(objectIdParamSchema), getProjectAnalytics);
router.get('/:id', authMiddleware, validateParams(objectIdParamSchema), getProjectById);
router.patch('/:id', authMiddleware, validateParams(objectIdParamSchema), validateRequest(projectUpdateSchema), updateProject);
router.patch('/:id/status', authMiddleware, validateParams(objectIdParamSchema), validateRequest(projectStatusSchema), updateProjectStatus);
router.delete('/:id', authMiddleware, validateParams(objectIdParamSchema), deleteProject);

export default router;
