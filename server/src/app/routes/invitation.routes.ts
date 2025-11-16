import { Router } from 'express';
import { 
  sendProjectInvitations, 
  getInvitationByToken, 
  acceptInvitation,
  getProjectInvitations,
  cancelInvitation
} from '../controllers/invitation.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Send invitations to join a project (requires authentication)
router.post('/send', authMiddleware, sendProjectInvitations);

// Get invitation details by token (no auth required - for viewing before login)
router.get('/token/:token', getInvitationByToken);

// Accept an invitation (requires authentication)
router.post('/accept', authMiddleware, acceptInvitation);

// Get all pending invitations for a project (requires authentication)
router.get('/project/:projectId', authMiddleware, getProjectInvitations);

// Cancel/revoke an invitation (requires authentication)
router.delete('/:invitationId', authMiddleware, cancelInvitation);

export default router;
