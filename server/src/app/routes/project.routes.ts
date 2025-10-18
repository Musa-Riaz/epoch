import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
} from '../controllers/project.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.patch('/:id', authMiddleware, updateProject);
router.patch('/:id/status', authMiddleware, updateProjectStatus);
router.delete('/:id', authMiddleware, deleteProject);

export default router;
