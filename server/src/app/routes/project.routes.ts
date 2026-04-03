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
  getProjectsByMember,
  getManagerMembers,
  removeMemberFromProject,
} from '../controllers/project.controller';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
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

// Manager-scoped routes
router.get('/manager/:id', authMiddleware, validateParams(managerParamSchema), getProjectsByManager);
router.get('/manager/:id/projects', authMiddleware, validateParams(managerParamSchema), getProjectsByManager);
router.get('/manager/:managerId/members', authMiddleware, requireRole(['manager', 'admin']), getManagerMembers);

// Member-scoped routes
router.get('/member/:userId/projects', authMiddleware, validateParams(memberParamSchema), getProjectsByMember);
router.get('/members/:id/projects', authMiddleware, validateParams(objectIdParamSchema), getMembersByProject);

// Project-level routes
router.get('/:id/analytics', authMiddleware, validateParams(objectIdParamSchema), getProjectAnalytics);
router.get('/:id', authMiddleware, validateParams(objectIdParamSchema), getProjectById);
router.patch('/:id', authMiddleware, validateParams(objectIdParamSchema), validateRequest(projectUpdateSchema), updateProject);
router.patch('/:id/status', authMiddleware, validateParams(objectIdParamSchema), validateRequest(projectStatusSchema), updateProjectStatus);
router.delete('/:id', authMiddleware, validateParams(objectIdParamSchema), deleteProject);

// Member management within a project
router.delete('/:projectId/members/:memberId', authMiddleware, requireRole(['manager', 'admin']), removeMemberFromProject);

export default router;
