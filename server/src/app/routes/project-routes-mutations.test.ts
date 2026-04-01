process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import { app } from '../../server';
import { issueToken } from '../utils/token.util';
import * as projectService from '../services/project.service';

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
    createProject: jest.fn(),
    getProjectById: jest.fn(),
    updateProject: jest.fn(),
    updateProjectStatus: jest.fn(),
    archiveProject: jest.fn(),
    getProjectAnalytics: jest.fn(),
    getMembersByProject: jest.fn(),
  };
});

function authHeader(role: 'admin' | 'manager' | 'member' = 'manager') {
  const token = issueToken({
    userId: '507f191e810c19729de860ea',
    email: `${role}@example.com`,
    role,
  });

  return `Bearer ${token}`;
}

describe('Project mutation and detail routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates project and injects owner from auth token', async () => {
    (projectService.createProject as jest.Mock).mockResolvedValue({
      _id: 'p1',
      name: 'Platform Revamp',
      owner: '507f191e810c19729de860ea',
    });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', authHeader('manager'))
      .send({
        name: 'Platform Revamp',
        description: 'Modernize dashboard and API layers',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(projectService.createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Platform Revamp',
        owner: '507f191e810c19729de860ea',
      })
    );
  });

  it('updates project details', async () => {
    (projectService.updateProject as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860eb',
      name: 'Platform Revamp V2',
    });

    const response = await request(app)
      .patch('/api/projects/507f191e810c19729de860eb')
      .set('Authorization', authHeader('manager'))
      .send({
        name: 'Platform Revamp V2',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(projectService.updateProject).toHaveBeenCalledWith(
      '507f191e810c19729de860eb',
      expect.objectContaining({ name: 'Platform Revamp V2' })
    );
  });

  it('updates project status through status route', async () => {
    (projectService.updateProjectStatus as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860eb',
      status: 'completed',
    });

    const response = await request(app)
      .patch('/api/projects/507f191e810c19729de860eb/status')
      .set('Authorization', authHeader('manager'))
      .send({ status: 'completed' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(projectService.updateProjectStatus).toHaveBeenCalledWith(
      '507f191e810c19729de860eb',
      'completed'
    );
  });

  it('returns project analytics details', async () => {
    (projectService.getProjectAnalytics as jest.Mock).mockResolvedValue({
      projectId: '507f191e810c19729de860eb',
      progress: 60,
      totalTasks: 10,
      completedTasks: 6,
      pendingTasks: 2,
      inProgressTasks: 2,
    });

    const response = await request(app)
      .get('/api/projects/507f191e810c19729de860eb/analytics')
      .set('Authorization', authHeader('manager'));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.progress).toBe(60);
  });

  it('archives project via delete endpoint', async () => {
    (projectService.archiveProject as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860eb',
      status: 'archived',
    });

    const response = await request(app)
      .delete('/api/projects/507f191e810c19729de860eb')
      .set('Authorization', authHeader('manager'));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(projectService.archiveProject).toHaveBeenCalledWith('507f191e810c19729de860eb');
  });

  it('validates project id route params', async () => {
    const response = await request(app)
      .patch('/api/projects/invalid-project-id')
      .set('Authorization', authHeader('manager'))
      .send({ name: 'Should fail' });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('ValidationError');
  });
});
