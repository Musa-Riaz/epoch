process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import { app } from '../../server';
import { issueToken } from '../utils/token.util';
import { User } from '../../infrastructure/database/models/user.model';
import { comparePassword, hashPassword } from '../utils/hash.util';

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
}));

jest.mock('../utils/hash.util', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user on signup and omits password in response', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
    (User.create as jest.Mock).mockResolvedValue({
      toObject: () => ({
        _id: '507f191e810c19729de860ea',
        firstName: 'Ava',
        lastName: 'Stone',
        email: 'ava@example.com',
        role: 'manager',
        password: 'hashed-password',
      }),
    });

    const response = await request(app).post('/api/auth/signup').send({
      firstName: 'Ava',
      lastName: 'Stone',
      email: 'ava@example.com',
      password: 'password123',
      role: 'manager',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('ava@example.com');
    expect(response.body.data.password).toBeUndefined();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ava@example.com',
        password: 'hashed-password',
      })
    );
  });

  it('returns conflict-style validation error when user already exists', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ _id: 'existing-user' });

    const response = await request(app).post('/api/auth/signup').send({
      firstName: 'Ava',
      lastName: 'Stone',
      email: 'ava@example.com',
      password: 'password123',
      role: 'manager',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('User already exists with this email');
  });

  it('returns 422 for invalid signup payload', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      firstName: '',
      email: 'invalid-email',
      password: '123',
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('ValidationError');
  });

  it('returns token and user payload on successful login', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => '507f191e810c19729de860ea' },
      email: 'ava@example.com',
      role: 'manager',
      password: 'hashed-password',
      toObject: () => ({
        _id: '507f191e810c19729de860ea',
        email: 'ava@example.com',
        role: 'manager',
        password: 'hashed-password',
      }),
    });
    (comparePassword as jest.Mock).mockResolvedValue(true);

    const response = await request(app).post('/api/auth/login').send({
      email: 'ava@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.accessToken).toBeTruthy();
  });

  it('rejects login when password is incorrect', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      email: 'ava@example.com',
      password: 'hashed-password',
    });
    (comparePassword as jest.Mock).mockResolvedValue(false);

    const response = await request(app).post('/api/auth/login').send({
      email: 'ava@example.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('enforces role-based protection for admin users endpoint', async () => {
    const managerToken = issueToken({
      userId: '507f191e810c19729de860ea',
      email: 'manager@example.com',
      role: 'manager',
    });

    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('returns users list for admin role', async () => {
    const adminToken = issueToken({
      userId: '507f191e810c19729de860eb',
      email: 'admin@example.com',
      role: 'admin',
    });

    (User.find as jest.Mock).mockResolvedValue([
      { _id: 'u1', email: 'user1@example.com' },
      { _id: 'u2', email: 'user2@example.com' },
    ]);

    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
  });
});
