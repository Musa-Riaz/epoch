import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../utils/api';
import { parsePositiveInt, parseString } from '../utils/query.util';
import { ActivityServiceError, getActivityFeedForUser } from '../services/activity.service';

export async function getActivityFeed(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      sendError({ res, error: 'Unauthorized', status: 401 });
      return;
    }

    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const projectId = parseString(req.query.projectId);
    const actionType = parseString(req.query.actionType) as
      | 'project.created'
      | 'project.status-updated'
      | 'task.created'
      | 'task.updated'
      | 'task.deleted'
      | 'task.assigned'
      | 'task.bulk-status-updated'
      | 'comment.created'
      | undefined;

    const result = await getActivityFeedForUser(userId, {
      page,
      limit,
      projectId,
      actionType,
    });

    sendSuccess({
      res,
      data: result.items,
      pagination: result.pagination,
      status: 200,
      message: 'Activity feed fetched',
    });
  } catch (err) {
    if (err instanceof ActivityServiceError) {
      sendError({ res, error: err.message, status: err.status });
      return;
    }

    sendError({ res, error: 'Failed to fetch activity feed', details: err, status: 500 });
  }
}
