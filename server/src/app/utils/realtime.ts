import { io } from '../../server';

export function emitNotificationToUser(userId: string, payload: unknown): void {
  if (!userId) return;
  io.to(`user:${userId}`).emit('notification:new', payload);
}

export function emitActivityEvent(payload: unknown, options?: { projectId?: string; userId?: string }): void {
  if (options?.projectId) {
    io.to(`project:${options.projectId}`).emit('activity:new', payload);
  }

  if (options?.userId) {
    io.to(`user:${options.userId}`).emit('activity:new', payload);
  }
}
