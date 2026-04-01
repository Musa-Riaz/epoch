import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Comment from '../../infrastructure/database/models/comment.model';
import Task from '../../infrastructure/database/models/task.model';
import Project from '../../infrastructure/database/models/project.model';
import { logActivity } from '../services/activity.service';
import { createNotifications } from '../services/notification.service';
import User from '../../infrastructure/database/models/user.model';
import { parseString } from '../utils/query.util';

export async function addComment(req: Request, res: Response): Promise<void> {
  try {
    const { taskId, content } = req.body;
    const authorId = (req as any).user?.userId;
    const actor = (req as any).user;
    const actorName = parseString((req as any).user?.name);
    if (!authorId) return sendError({ res, error: 'Unauthorized', status: 401 });

    const comment = await Comment.create({ taskId, content, authorId });

    const task = await Task.findById(taskId);
    if (task && actor?.userId) {
      const project = await Project.findById(task.projectId, { owner: 1, name: 1 });

      void logActivity({
        actorId: actor.userId,
        actorName,
        actorEmail: actor.email,
        actorRole: actor.role,
        actionType: 'comment.created',
        targetType: 'comment',
        targetId: String(comment._id),
        projectId: String(task.projectId),
        projectName: String((project as any)?.name || ''),
        targetName: String(task.title || 'task'),
        message: 'commented on a task',
        metadata: { taskId: String(task._id) },
      }).catch(console.error);

      const recipientIds = [
        String(task.assignedTo || ''),
        String((project as any)?.owner || ''),
      ]
        .filter((id) => id && id !== String(authorId));

      if (recipientIds.length > 0) {
        void createNotifications({
          userIds: recipientIds,
          type: 'comment.created',
          title: 'New comment',
          message: 'A new comment was added to one of your tasks.',
          relatedType: 'comment',
          relatedId: String(comment._id),
          projectId: String(task.projectId),
        }).catch(console.error);
      }
    }

    return sendSuccess({ res, data: comment, status: 201, message: 'Comment added' });
  } catch (err) {
    return sendError({ res, error: 'Failed to add comment', details: err as any, status: 500 });
  }
}

export async function getCommentsByTask(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ taskId });
    return sendSuccess({ res, data: comments, status: 200, message: 'Comments fetched' });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch comments', details: err as any, status: 500 });
  }
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const authorId = (req as any).user?.userId;
    const comment = await Comment.findById(id);
    if (!comment) return sendError({ res, error: 'Comment not found', status: 404 });
    if (comment.authorId.toString() !== authorId) return sendError({ res, error: 'Forbidden', status: 403 });

    comment.content = req.body.content ?? comment.content;
    await comment.save();
    return sendSuccess({ res, data: comment, status: 200, message: 'Comment updated' });
  } catch (err) {
    return sendError({ res, error: 'Failed to update comment', details: err as any, status: 500 });
  }
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const authorId = (req as any).user?.userId;
    const comment = await Comment.findById(id);
    if (!comment) return sendError({ res, error: 'Comment not found', status: 404 });
    if (comment.authorId.toString() !== authorId) return sendError({ res, error: 'Forbidden', status: 403 });

    await comment.deleteOne();
    return sendSuccess({ res, data: comment, status: 200, message: 'Comment deleted' });
  } catch (err) {
    return sendError({ res, error: 'Failed to delete comment', details: err as any, status: 500 });
  }
}


export async function getCommentAvatar(req: Request, res: Response): Promise<void> {

  try{

    const { authorId } = req.params;
    // finding user by id
    const user = await User.findById(authorId);
    if(!user) return sendError({res, error: 'User not found', status: 404});
    
    return sendSuccess({res, data: user, status: 200, message: "User Fetched Successfully"});

  }
  catch(err){
    return sendError({ res, error: 'Failed to get comment avatar', details: err as any, status: 500 });
  }

}