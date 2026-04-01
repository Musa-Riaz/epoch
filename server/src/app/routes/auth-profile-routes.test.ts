process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import { app } from '../../server';
import { issueToken } from '../utils/token.util';
import { User } from '../../infrastructure/database/models/user.model';
import Project from '../../infrastructure/database/models/project.model';
import { hashPassword } from '../utils/hash.util';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('../../infrastructure/database/models/user.model', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../infrastructure/database/models/project.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

jest.mock('../utils/hash.util', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

function authHeader(role: 'admin' | 'manager' | 'member' = 'manager') {
  const token = issueToken({
    userId: '507f191e810c19729de860ea',
    email: `${role}@example.com`,
    role,
  });

  return `Bearer ${token}`;
}

describe('Auth profile and analytics routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates profile for authenticated user', async () => {
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860ea',
      firstName: 'Ava',
      lastName: 'Stone',
      email: 'ava@example.com',
      role: 'manager',
    });

    const response = await request(app)
      .put('/api/auth/updateProfile/507f191e810c19729de860ea')
      .set('Authorization', authHeader('manager'))
      .send({ firstName: 'Ava' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(User.findByIdAndUpdate).toHaveBeenCalled();
  });

  it('hashes password when updating profile password', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('hashed-123');
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860ea',
      firstName: 'Ava',
    });

    await request(app)
      .put('/api/auth/updateProfile/507f191e810c19729de860ea')
      .set('Authorization', authHeader('manager'))
      .send({ password: 'new-password-123' });

    expect(hashPassword).toHaveBeenCalledWith('new-password-123');
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f191e810c19729de860ea',
      expect.objectContaining({ password: 'hashed-123' }),
      { new: true }
    );
  });

  it('returns manager analytics for manager role', async () => {
    (User.findById as jest.Mock).mockResolvedValue({ _id: 'm1', role: 'manager' });
    (Project.find as jest.Mock).mockResolvedValue([
      { team: ['u1', 'u2'], toObject: () => ({ _id: 'p1', name: 'Revamp' }) },
      { team: ['u3'], toObject: () => ({ _id: 'p2', name: 'API' }) },
    ]);

    const response = await request(app)
      .get('/api/auth/manager/analytics/507f191e810c19729de860ea')
      .set('Authorization', authHeader('manager'));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalProjects).toBe(2);
    expect(response.body.data.totalMembers).toBe(3);
  });

  it('returns 404 when manager analytics target is not manager', async () => {
    (User.findById as jest.Mock).mockResolvedValue({ _id: 'u1', role: 'member' });

    const response = await request(app)
      .get('/api/auth/manager/analytics/507f191e810c19729de860ea')
      .set('Authorization', authHeader('manager'));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Manager not found');
  });

  it('returns unauthorized for profile route without body userId', async () => {
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns user by id for manager role access', async () => {
    (User.findById as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860ef',
      email: 'member@example.com',
      role: 'member',
      toObject: () => ({
        _id: '507f191e810c19729de860ef',
        email: 'member@example.com',
        role: 'member',
        password: 'secret',
      }),
    });

    const response = await request(app)
      .get('/api/auth/user/507f191e810c19729de860ef')
      .set('Authorization', authHeader('manager'));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.password).toBeUndefined();
  });
});
