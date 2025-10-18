import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Comment from '../../infrastructure/database/models/comment.model';

export async function addComment(req: Request, res: Response): Promise<void> {
  try {
    const { taskId, content } = req.body;
    const authorId = (req as any).user?.userId;
    if (!authorId) return sendError({ res, error: 'Unauthorized', status: 401 });

    const comment = await Comment.create({ taskId, content, authorId });
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
