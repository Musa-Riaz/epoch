import mongoose from 'mongoose';
import Notification, { NotificationType } from '../../infrastructure/database/models/notification.model';
import { buildPagination } from '../utils/query.util';
import { emitNotificationToUser } from '../utils/realtime';

export class NotificationServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'NotificationServiceError';
    this.status = status;
  }
}

export interface CreateNotificationInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  relatedType: 'project' | 'task' | 'comment';
  relatedId: string;
  projectId?: string;
}

export interface NotificationListOptions {
  page: number;
  limit: number;
  unreadOnly?: boolean;
}

function assertObjectId(id: string, message: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotificationServiceError(message, 400);
  }
}

export async function createNotifications(input: CreateNotificationInput) {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return [];
  }

  if (!Array.isArray(input.userIds) || input.userIds.length === 0) {
    return [];
  }

  assertObjectId(input.relatedId, 'Invalid related id');
  if (input.projectId) {
    assertObjectId(input.projectId, 'Invalid project id');
  }

  const userIds = Array.from(new Set(input.userIds.filter(Boolean)));
  userIds.forEach((id) => assertObjectId(id, 'Invalid notification user id'));

  const docs = userIds.map((userId) => ({
    userId,
    type: input.type,
    title: input.title,
    message: input.message,
    relatedType: input.relatedType,
    relatedId: input.relatedId,
    projectId: input.projectId,
  }));

  const created = await Notification.insertMany(docs);
  created.forEach((notification: any) => {
    emitNotificationToUser(String(notification.userId), notification);
  });

  return created;
}

export async function getNotificationsForUser(userId: string, options: NotificationListOptions) {
  assertObjectId(userId, 'Invalid user id');

  const filter: Record<string, unknown> = { userId };
  if (options.unreadOnly) {
    filter.isRead = false;
  }

  const skip = (options.page - 1) * options.limit;
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    items,
    unreadCount,
    pagination: buildPagination(total, options.page, options.limit),
  };
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  assertObjectId(userId, 'Invalid user id');
  assertObjectId(notificationId, 'Invalid notification id');

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new NotificationServiceError('Notification not found', 404);
  }

  return notification;
}

export async function markAllNotificationsAsRead(userId: string) {
  assertObjectId(userId, 'Invalid user id');

  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { success: true };
}
