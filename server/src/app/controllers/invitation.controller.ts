import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Invitation from '../../infrastructure/database/models/invitation.model';
import Project from '../../infrastructure/database/models/project.model';
import User from '../../infrastructure/database/models/user.model';
import { sendInvitationEmail, sendWelcomeEmail } from '../utils/email.util';

/**
 * Send project invitations to multiple email addresses
 */
export async function sendProjectInvitations(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, emails } = req.body; // emails is an array of email addresses
    const inviterId = (req as any).user?.userId;

    if (!inviterId) {
      return sendError({ res, error: 'Unauthorized', status: 401 });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return sendError({ res, error: 'Please provide at least one email address', status: 400 });
    }

    // Verify project exists and user is the owner/manager
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError({ res, error: 'Project not found', status: 404 });
    }

    // if (project.owner.toString() !== inviterId) {
    //   return sendError({ res, error: 'Only project owner can send invitations', status: 403 });
    // }

    // Get inviter details for the email
    const inviter = await User.findById(inviterId);
    if (!inviter) {
      return sendError({ res, error: 'Inviter not found', status: 404 });
    }

    const results = [];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    for (const email of emails) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
          // User exists - check if already in project
          if (project.team.includes(existingUser._id as any)) {
            results.push({
              email,
              status: 'already_member',
              message: 'User is already a member of this project',
            });
            continue;
          }

          // Add user directly to project
          project.team.push(existingUser._id as any);
          await project.save();

          // Send welcome notification email
          await sendWelcomeEmail({
            to: email,
            name: `${existingUser.firstName} ${existingUser.lastName}`,
            projectName: project.name,
          });

          results.push({
            email,
            status: 'added_directly',
            message: 'User added to project directly',
          });
        } else {
          // User doesn't exist - create invitation
          
          // Check if there's already a pending invitation
          const existingInvitation = await Invitation.findOne({
            email: email.toLowerCase(),
            projectId,
            status: 'pending',
            expiresAt: { $gt: new Date() },
          });

          if (existingInvitation) {
            results.push({
              email,
              status: 'invitation_exists',
              message: 'An invitation has already been sent to this email',
            });
            continue;
          }

          // Create new invitation
          const invitation = await Invitation.create({
            email: email.toLowerCase(),
            projectId,
            invitedBy: inviterId,
          });

          // Send invitation email
          const emailSent = await sendInvitationEmail({
            to: email,
            projectName: project.name,
            inviterName: `${inviter.firstName} ${inviter.lastName}`,
            invitationToken: invitation.token,
            frontendUrl,
          });

          results.push({
            email,
            status: emailSent ? 'invitation_sent' : 'invitation_created_email_failed',
            message: emailSent
              ? 'Invitation email sent successfully'
              : 'Invitation created but email sending failed',
            invitationToken: invitation.token, // For development/testing
          });
        }
      } catch (error) {
        console.error(`Error processing invitation for ${email}:`, error);
        results.push({
          email,
          status: 'error',
          message: 'Failed to process invitation',
        });
      }
    }

    return sendSuccess({
      res,
      data: { results, projectName: project.name },
      status: 200,
      message: 'Invitations processed',
    });
  } catch (err) {
    console.error('Error in sendProjectInvitations:', err);
    return sendError({
      res,
      error: 'Failed to send invitations',
      details: err as any,
      status: 500,
    });
  }
}

/**
 * Get invitation details by token
 */
export async function getInvitationByToken(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token })
      .populate('projectId', 'name description')
      .populate('invitedBy', 'firstName lastName email');

    if (!invitation) {
      return sendError({ res, error: 'Invitation not found', status: 404 });
    }

    // Check if invitation is valid
    if (!invitation.isValid()) {
      if (invitation.status === 'accepted') {
        return sendError({ res, error: 'This invitation has already been used', status: 400 });
      }
      if (invitation.expiresAt < new Date()) {
        invitation.status = 'expired';
        await invitation.save();
        return sendError({ res, error: 'This invitation has expired', status: 400 });
      }
    }

    return sendSuccess({
      res,
      data: {
        email: invitation.email,
        project: invitation.projectId,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt,
      },
      status: 200,
      message: 'Invitation details retrieved',
    });
  } catch (err) {
    return sendError({
      res,
      error: 'Failed to get invitation',
      details: err as any,
      status: 500,
    });
  }
}

/**
 * Accept project invitation
 */
export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return sendError({ res, error: 'Please log in to accept the invitation', status: 401 });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ token }).populate('projectId');
    
    if (!invitation) {
      return sendError({ res, error: 'Invitation not found', status: 404 });
    }

    // Validate invitation
    if (!invitation.isValid()) {
      if (invitation.status === 'accepted') {
        return sendError({ res, error: 'This invitation has already been used', status: 400 });
      }
      if (invitation.expiresAt < new Date()) {
        invitation.status = 'expired';
        await invitation.save();
        return sendError({ res, error: 'This invitation has expired', status: 400 });
      }
    }

    // Get user and verify email matches
    const user = await User.findById(userId);
    if (!user) {
      return sendError({ res, error: 'User not found', status: 404 });
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return sendError({
        res,
        error: 'This invitation was sent to a different email address',
        status: 403,
      });
    }

    // Get project
    const project = await Project.findById(invitation.projectId);
    if (!project) {
      return sendError({ res, error: 'Project not found', status: 404 });
    }

    // Check if user is already a member
    if (project.team.includes(userId as any)) {
      invitation.status = 'accepted';
      await invitation.save();
      return sendSuccess({
        res,
        data: { project },
        status: 200,
        message: 'You are already a member of this project',
      });
    }

    // Add user to project
    project.team.push(userId as any);
    await project.save();

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    // Send welcome email
    await sendWelcomeEmail({
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      projectName: project.name,
    });

    return sendSuccess({
      res,
      data: { project },
      status: 200,
      message: 'Successfully joined the project!',
    });
  } catch (err) {
    console.error('Error in acceptInvitation:', err);
    return sendError({
      res,
      error: 'Failed to accept invitation',
      details: err as any,
      status: 500,
    });
  }
}

/**
 * Get all pending invitations for a project
 */
export async function getProjectInvitations(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return sendError({ res, error: 'Unauthorized', status: 401 });
    }

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError({ res, error: 'Project not found', status: 404 });
    }

    if (project.owner.toString() !== userId && !project.team.includes(userId as any)) {
      return sendError({ res, error: 'Access denied', status: 403 });
    }

    // Get pending invitations
    const invitations = await Invitation.find({
      projectId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('invitedBy', 'firstName lastName email');

    return sendSuccess({
      res,
      data: invitations,
      status: 200,
      message: 'Invitations retrieved',
    });
  } catch (err) {
    return sendError({
      res,
      error: 'Failed to get invitations',
      details: err as any,
      status: 500,
    });
  }
}

/**
 * Cancel/revoke an invitation
 */
export async function cancelInvitation(req: Request, res: Response): Promise<void> {
  try {
    const { invitationId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return sendError({ res, error: 'Unauthorized', status: 401 });
    }

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return sendError({ res, error: 'Invitation not found', status: 404 });
    }

    // Verify user is the one who sent the invitation
    if (invitation.invitedBy.toString() !== userId) {
      return sendError({ res, error: 'Only the inviter can cancel this invitation', status: 403 });
    }

    invitation.status = 'rejected';
    await invitation.save();

    return sendSuccess({
      res,
      data: invitation,
      status: 200,
      message: 'Invitation cancelled',
    });
  } catch (err) {
    return sendError({
      res,
      error: 'Failed to cancel invitation',
      details: err as any,
      status: 500,
    });
  }
}
