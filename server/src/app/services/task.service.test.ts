import {
  bulkUpdateTaskStatus,
  TaskServiceError,
  assignTask,
  createTask,
  deleteTask,
  getTasks,
  getUserById,
  updateTask,
} from './task.service';
import Task from '../../infrastructure/database/models/task.model';
import { User } from '../../infrastructure/database/models/user.model';
import { recalcProjectProgress } from './project.service';

jest.mock('../../infrastructure/database/models/task.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('../../infrastructure/database/models/user.model', () => ({
  __esModule: true,
  User: {
    findById: jest.fn(),
  },
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('./project.service', () => {
  const actual = jest.requireActual('./project.service');
  return {
    ...actual,
    recalcProjectProgress: jest.fn().mockResolvedValue(0),
  };
});

function buildFindChain(items: unknown[]) {
  const chain = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
  };

  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockResolvedValue(items);

  return chain;
}

describe('task.service', () => {
  const validId = '507f191e810c19729de860ea';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates task and triggers async project progress recalculation', async () => {
    (Task.create as jest.Mock).mockResolvedValue({ _id: 't1', title: 'Draft docs' });

    const result = await createTask({
      title: 'Draft docs',
      projectId: validId,
      assignedTo: '507f191e810c19729de860eb',
    });

    expect(result).toEqual({ _id: 't1', title: 'Draft docs' });
    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Draft docs', projectId: validId })
    );
    expect(recalcProjectProgress).toHaveBeenCalledWith(validId);
  });

  it('rejects create task for invalid project id', async () => {
    await expect(
      createTask({
        title: 'Draft docs',
        projectId: 'invalid-id',
      })
    ).rejects.toMatchObject({
      message: 'Invalid project id',
      status: 400,
    });
  });

  it('returns paginated tasks and applies sorting filters', async () => {
    const items = [{ _id: 't1' }];
    const chain = buildFindChain(items);

    (Task.find as jest.Mock).mockReturnValue(chain);
    (Task.countDocuments as jest.Mock).mockResolvedValue(7);

    const result = await getTasks({
      page: 2,
      limit: 3,
      status: 'todo',
      search: 'docs',
      sortBy: 'updatedAt',
      sortOrder: 1,
    });

    expect(Task.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'todo',
        $or: [
          { title: { $regex: 'docs', $options: 'i' } },
          { description: { $regex: 'docs', $options: 'i' } },
        ],
      })
    );
    expect(chain.sort).toHaveBeenCalledWith({ updatedAt: 1 });
    expect(chain.skip).toHaveBeenCalledWith(3);
    expect(chain.limit).toHaveBeenCalledWith(3);
    expect(result.items).toEqual(items);
    expect(result.pagination).toEqual({ total: 7, page: 2, limit: 3, totalPages: 3 });
  });

  it('throws when update target task is missing', async () => {
    (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(updateTask(validId, { status: 'done' })).rejects.toMatchObject({
      message: 'Task not found',
      status: 404,
    });
  });

  it('assigns task to member when both entities exist', async () => {
    const task = {
      assignedTo: null,
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Task.findById as jest.Mock).mockResolvedValue(task);
    (User.findById as jest.Mock).mockResolvedValue({ _id: 'member-1' });

    const result = await assignTask(validId, '507f191e810c19729de860eb');

    expect(result).toBe(task);
    expect(task.assignedTo).toBe('507f191e810c19729de860eb');
    expect(task.save).toHaveBeenCalledTimes(1);
  });

  it('throws when assigning to non-existent member', async () => {
    (Task.findById as jest.Mock).mockResolvedValue({ _id: 't1' });
    (User.findById as jest.Mock).mockResolvedValue(null);

    await expect(assignTask(validId, '507f191e810c19729de860eb')).rejects.toMatchObject({
      message: 'Member not found',
      status: 404,
    });
  });

  it('deletes task and triggers project progress recalculation', async () => {
    (Task.findByIdAndDelete as jest.Mock).mockResolvedValue({ projectId: validId });

    const deleted = await deleteTask(validId);

    expect(deleted).toEqual({ projectId: validId });
    expect(recalcProjectProgress).toHaveBeenCalledWith(validId);
  });

  it('throws when requested user by id does not exist', async () => {
    (User.findById as jest.Mock).mockResolvedValue(null);

    await expect(getUserById(validId)).rejects.toMatchObject({
      message: 'User not found',
      status: 404,
    });
  });

  it('bulk updates task statuses and returns update counters', async () => {
    (Task.find as jest.Mock).mockResolvedValue([
      { _id: 't1', projectId: validId },
      { _id: 't2', projectId: '507f191e810c19729de860eb' },
    ]);
    (Task.updateMany as jest.Mock).mockResolvedValue({ matchedCount: 2, modifiedCount: 2 });

    const result = await bulkUpdateTaskStatus(
      [validId, '507f191e810c19729de860eb'],
      'done'
    );

    expect(Task.updateMany).toHaveBeenCalledWith(
      { _id: { $in: [validId, '507f191e810c19729de860eb'] } },
      { $set: { status: 'done' } }
    );
    expect(result).toEqual({ matchedCount: 2, modifiedCount: 2 });
    expect(recalcProjectProgress).toHaveBeenCalledTimes(2);
  });
});
