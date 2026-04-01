process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import { app } from '../../server';
import { issueToken } from '../utils/token.util';
import * as projectService from '../services/project.service';
import * as taskService from '../services/task.service';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('../services/project.service', () => {
  const actual = jest.requireActual('../services/project.service');
  return {
    ...actual,
    getProjectsForUser: jest.fn(),
    getProjectsByManager: jest.fn(),
    getProjectsByMember: jest.fn(),
  };
});

jest.mock('../services/task.service', () => {
  const actual = jest.requireActual('../services/task.service');
  return {
    ...actual,
    getTasks: jest.fn(),
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

describe('List endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated projects for authenticated user', async () => {
    (projectService.getProjectsForUser as jest.Mock).mockResolvedValue({
      items: [{ _id: 'p1', name: 'Atlas Revamp', status: 'active' }],
      pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/projects?page=1&limit=20&search=atlas')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(projectService.getProjectsForUser).toHaveBeenCalledTimes(1);
  });

  it('returns manager project stats with pagination metadata', async () => {
    (projectService.getProjectsByManager as jest.Mock).mockResolvedValue({
      totalProjects: 2,
      totalMembers: 5,
      projects: [{ _id: 'p1', name: 'Launch Program', teamSize: 3 }],
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/projects/manager/507f191e810c19729de860ea?page=1&limit=10')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalProjects).toBe(2);
    expect(response.body.data.totalMembers).toBe(5);
    expect(response.body.pagination).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    expect(projectService.getProjectsByManager).toHaveBeenCalledTimes(1);
  });

  it('returns paginated tasks for authenticated user', async () => {
    (taskService.getTasks as jest.Mock).mockResolvedValue({
      items: [{ _id: 't1', title: 'Document API', status: 'todo' }],
      pagination: { total: 1, page: 1, limit: 25, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/tasks?page=1&limit=25&status=todo')
      .set('Authorization', authHeader());

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toEqual({
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
    });
    expect(taskService.getTasks).toHaveBeenCalledTimes(1);
  });

  it('returns 401 when authorization header is missing', async () => {
    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(401);
  });
});
