process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import { app } from '../../server';
import { issueToken } from '../utils/token.util';
import * as notificationService from '../services/notification.service';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('../services/notification.service', () => {
  const actual = jest.requireActual('../services/notification.service');
  return {
    ...actual,
    getNotificationsForUser: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
  };
});

function authHeader() {
  const token = issueToken({
    userId: '507f191e810c19729de860ea',
    email: 'manager@example.com',
    role: 'manager',
  });

  return `Bearer ${token}`;
}

describe('Notification routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated notifications with unread count', async () => {
    (notificationService.getNotificationsForUser as jest.Mock).mockResolvedValue({
      items: [
        {
          _id: 'n1',
          title: 'Task assigned',
          message: 'You were assigned a task.',
          isRead: false,
          createdAt: '2026-04-01T00:00:00.000Z',
        },
      ],
      unreadCount: 1,
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/notifications?page=1&limit=10')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.unreadCount).toBe(1);
    expect(notificationService.getNotificationsForUser).toHaveBeenCalledWith(
      '507f191e810c19729de860ea',
      expect.objectContaining({ page: 1, limit: 10, unreadOnly: false })
    );
  });

  it('marks a single notification as read', async () => {
    (notificationService.markNotificationAsRead as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860ef',
      isRead: true,
    });

    const response = await request(app)
      .patch('/api/notifications/507f191e810c19729de860ef/read')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith(
      '507f191e810c19729de860ea',
      '507f191e810c19729de860ef'
    );
  });

  it('marks all notifications as read', async () => {
    (notificationService.markAllNotificationsAsRead as jest.Mock).mockResolvedValue({ success: true });

    const response = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(notificationService.markAllNotificationsAsRead).toHaveBeenCalledWith('507f191e810c19729de860ea');
  });

  it('returns 401 without auth', async () => {
    const response = await request(app).get('/api/notifications');
    expect(response.status).toBe(401);
  });
});
