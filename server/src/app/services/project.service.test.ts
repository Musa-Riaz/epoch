import {
  ProjectServiceError,
  createProject,
  getProjectAnalytics,
  getProjectsByManager,
  getProjectsForUser,
  recalcProjectProgress,
  updateProjectStatus,
} from './project.service';
import Project from '../../infrastructure/database/models/project.model';
import Task from '../../infrastructure/database/models/task.model';
import User from '../../infrastructure/database/models/user.model';

jest.mock('../../infrastructure/database/models/project.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../../infrastructure/database/models/task.model', () => ({
  __esModule: true,
  default: {
    countDocuments: jest.fn(),
  },
}));

jest.mock('../../infrastructure/database/models/user.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    find: jest.fn(),
  },
}));

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

describe('project.service', () => {
  const validId = '507f191e810c19729de860ea';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates project with default empty team', async () => {
    (Project.create as jest.Mock).mockResolvedValue({ _id: 'p1', name: 'Epoch' });

    await createProject({
      name: 'Epoch',
      owner: validId,
    });

    expect(Project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: validId,
        team: [],
      })
    );
  });

  it('returns paginated projects for a user', async () => {
    const items = [{ _id: 'p1' }];
    const chain = buildFindChain(items);

    (Project.find as jest.Mock).mockReturnValue(chain);
    (Project.countDocuments as jest.Mock).mockResolvedValue(5);

    const result = await getProjectsForUser(validId, {
      page: 2,
      limit: 2,
      sortBy: 'updatedAt',
      sortOrder: 1,
    });

    expect(Project.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [{ owner: validId }, { team: validId }],
      })
    );
    expect(chain.sort).toHaveBeenCalledWith({ updatedAt: 1 });
    expect(chain.skip).toHaveBeenCalledWith(2);
    expect(chain.limit).toHaveBeenCalledWith(2);
    expect(result.pagination).toEqual({ total: 5, page: 2, limit: 2, totalPages: 3 });
  });

  it('applies advanced progress and deadline filters for user project queries', async () => {
    const items = [{ _id: 'p2' }];
    const chain = buildFindChain(items);

    (Project.find as jest.Mock).mockReturnValue(chain);
    (Project.countDocuments as jest.Mock).mockResolvedValue(1);

    await getProjectsForUser(validId, {
      page: 1,
      limit: 10,
      minProgress: 20,
      maxProgress: 80,
      deadlineFrom: '2026-01-01T00:00:00.000Z',
      deadlineTo: '2026-12-31T23:59:59.000Z',
    });

    expect(Project.find).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: { $gte: 20, $lte: 80 },
      })
    );
    expect(Project.find).toHaveBeenCalledWith(
      expect.objectContaining({
        deadline: {
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        },
      })
    );
  });

  it('throws when manager lookup fails in getProjectsByManager', async () => {
    (User.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      getProjectsByManager(validId, {
        page: 1,
        limit: 10,
      })
    ).rejects.toMatchObject({
      message: 'Manager not found',
      status: 404,
    });
  });

  it('returns manager projects with team size summary', async () => {
    const projectDoc = {
      team: ['m1', 'm2'],
      toObject: () => ({ _id: 'p1', name: 'Epoch' }),
    };
    const chain = buildFindChain([projectDoc]);

    (User.findById as jest.Mock).mockResolvedValue({ _id: validId, role: 'manager' });
    (Project.find as jest.Mock).mockReturnValue(chain);
    (Project.countDocuments as jest.Mock).mockResolvedValue(1);
    (Project.aggregate as jest.Mock).mockResolvedValue([{ totalMembers: 2 }]);

    const result = await getProjectsByManager(validId, {
      page: 1,
      limit: 10,
      status: 'active',
    });

    expect(result.totalProjects).toBe(1);
    expect(result.totalMembers).toBe(2);
    expect(result.projects[0].teamSize).toBe(2);
    expect(result.pagination).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
  });

  it('computes analytics counts and progress', async () => {
    (Project.findById as jest.Mock).mockResolvedValue({ _id: validId });
    (Task.countDocuments as jest.Mock)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(3);

    const result = await getProjectAnalytics(validId);

    expect(result).toEqual({
      projectId: validId,
      progress: 40,
      totalTasks: 10,
      completedTasks: 4,
      pendingTasks: 3,
      inProgressTasks: 3,
    });
  });

  it('rejects invalid project status transitions', async () => {
    await expect(updateProjectStatus(validId, 'paused')).rejects.toMatchObject({
      message: 'Invalid status',
      status: 400,
    });
  });

  it('recalculates and persists project progress', async () => {
    (Task.countDocuments as jest.Mock)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(6);
    (Project.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, progress: 75 });

    const result = await recalcProjectProgress(validId);

    expect(result).toBe(75);
    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(validId, { progress: 75 });
  });
});
