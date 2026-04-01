process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import { app } from '../../server';
import { issueToken } from '../utils/token.util';
import { TaskServiceError } from '../services/task.service';
import * as taskService from '../services/task.service';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('../services/task.service', () => {
  const actual = jest.requireActual('../services/task.service');
  return {
    ...actual,
    createTask: jest.fn(),
    updateTask: jest.fn(),
    assignTask: jest.fn(),
    bulkUpdateTaskStatus: jest.fn(),
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

describe('Task mutation routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a task for valid payload', async () => {
    (taskService.createTask as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860ef',
      title: 'Write release notes',
      status: 'todo',
      priority: 'medium',
    });

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader())
      .send({
        title: 'Write release notes',
        description: 'Draft and publish release summary',
        projectId: '507f191e810c19729de860eb',
        priority: 'medium',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Write release notes');
    expect(taskService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Write release notes',
        projectId: '507f191e810c19729de860eb',
      })
    );
  });

  it('returns validation error when create payload is invalid', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader())
      .send({
        title: '',
        projectId: 'invalid-id',
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('ValidationError');
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it('maps service errors for create task requests', async () => {
    (taskService.createTask as jest.Mock).mockRejectedValue(
      new TaskServiceError('Invalid project id', 400)
    );

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader())
      .send({
        title: 'Write release notes',
        projectId: '507f191e810c19729de860eb',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid project id');
  });

  it('updates a task by id', async () => {
    (taskService.updateTask as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860ef',
      status: 'done',
      title: 'Write release notes',
    });

    const response = await request(app)
      .patch('/api/tasks/507f191e810c19729de860ef')
      .set('Authorization', authHeader())
      .send({
        status: 'done',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('done');
    expect(taskService.updateTask).toHaveBeenCalledWith(
      '507f191e810c19729de860ef',
      expect.objectContaining({ status: 'done' })
    );
  });

  it('validates object id for update route params', async () => {
    const response = await request(app)
      .patch('/api/tasks/not-a-valid-object-id')
      .set('Authorization', authHeader())
      .send({ status: 'done' });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('ValidationError');
    expect(taskService.updateTask).not.toHaveBeenCalled();
  });

  it('assigns a task to a member', async () => {
    (taskService.assignTask as jest.Mock).mockResolvedValue({
      _id: '507f191e810c19729de860ef',
      assignedTo: '507f191e810c19729de860ec',
    });

    const response = await request(app)
      .post('/api/tasks/assign')
      .set('Authorization', authHeader())
      .send({
        taskId: '507f191e810c19729de860ef',
        memberId: '507f191e810c19729de860ec',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(taskService.assignTask).toHaveBeenCalledWith(
      '507f191e810c19729de860ef',
      '507f191e810c19729de860ec'
    );
  });

  it('bulk updates task status for selected tasks', async () => {
    (taskService.bulkUpdateTaskStatus as jest.Mock).mockResolvedValue({
      matchedCount: 2,
      modifiedCount: 2,
    });

    const response = await request(app)
      .patch('/api/tasks/bulk-status')
      .set('Authorization', authHeader())
      .send({
        taskIds: ['507f191e810c19729de860ef', '507f191e810c19729de860ee'],
        status: 'in-progress',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(taskService.bulkUpdateTaskStatus).toHaveBeenCalledWith(
      ['507f191e810c19729de860ef', '507f191e810c19729de860ee'],
      'in-progress'
    );
  });
});
