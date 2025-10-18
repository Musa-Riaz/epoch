import { Router } from 'express';
import { createTeam, getTeams, addMember, removeMember, getTeamProjects } from '../controllers/team.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest, teamSchema } from '../validators/schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(teamSchema), createTeam);
router.get('/', authMiddleware, getTeams);
router.patch('/:id/add-member', authMiddleware, addMember);
router.patch('/:id/remove-member', authMiddleware, removeMember);
router.get('/:id/projects', authMiddleware, getTeamProjects);

export default router;
