import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../utils/api';
import { parsePositiveInt } from '../utils/query.util';
import {
  NotificationServiceError,
  getNotificationsForUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notification.service';

function handleNotificationError(res: Response, err: unknown, fallback: string): void {
  if (err instanceof NotificationServiceError) {
    sendError({ res, error: err.message, status: err.status });
    return;
  }

  sendError({ res, error: fallback, details: err, status: 500 });
}

export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      sendError({ res, error: 'Unauthorized', status: 401 });
      return;
    }

    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const unreadOnly = String(req.query.unreadOnly ?? '').toLowerCase() === 'true';

    const result = await getNotificationsForUser(userId, { page, limit, unreadOnly });

    sendSuccess({
      res,
      data: { items: result.items, unreadCount: result.unreadCount },
      pagination: result.pagination,
      status: 200,
      message: 'Notifications fetched',
    });
  } catch (err) {
    handleNotificationError(res, err, 'Failed to fetch notifications');
  }
}

export async function readNotification(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      sendError({ res, error: 'Unauthorized', status: 401 });
      return;
    }

    const notification = await markNotificationAsRead(userId, req.params.id);
    sendSuccess({ res, data: notification, status: 200, message: 'Notification marked as read' });
  } catch (err) {
    handleNotificationError(res, err, 'Failed to mark notification as read');
  }
}

export async function readAllNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      sendError({ res, error: 'Unauthorized', status: 401 });
      return;
    }

    const result = await markAllNotificationsAsRead(userId);
    sendSuccess({ res, data: result, status: 200, message: 'All notifications marked as read' });
  } catch (err) {
    handleNotificationError(res, err, 'Failed to mark all notifications as read');
  }
}
