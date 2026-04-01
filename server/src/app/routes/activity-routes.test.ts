process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import { app } from '../../server';
import { issueToken } from '../utils/token.util';
import * as activityService from '../services/activity.service';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('../services/activity.service', () => {
  const actual = jest.requireActual('../services/activity.service');
  return {
    ...actual,
    getActivityFeedForUser: jest.fn(),
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

describe('Activity routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated activity feed for authenticated users', async () => {
    (activityService.getActivityFeedForUser as jest.Mock).mockResolvedValue({
      items: [
        {
          _id: 'a1',
          actionType: 'task.updated',
          message: 'updated task "Draft docs"',
          actorEmail: 'manager@example.com',
          createdAt: '2026-04-01T00:00:00.000Z',
        },
      ],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/activities?page=1&limit=10')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.pagination).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    expect(activityService.getActivityFeedForUser).toHaveBeenCalledWith(
      '507f191e810c19729de860ea',
      expect.objectContaining({ page: 1, limit: 10 })
    );
  });

  it('returns 401 without authorization token', async () => {
    const response = await request(app).get('/api/activities');

    expect(response.status).toBe(401);
  });
});
