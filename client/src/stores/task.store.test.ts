import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware');
  return {
    ...actual,
    devtools: (fn: unknown) => fn,
    persist: (fn: unknown) => fn,
  };
});

const mockedTaskApi = {
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  getTask: vi.fn(),
  getTasksByProject: vi.fn(),
  getTasksByAssignedUser: vi.fn(),
  getUserByTask: vi.fn(),
  assignTask: vi.fn(),
};

vi.mock('@/lib/api', () => ({
  taskApi: mockedTaskApi,
}));

describe('task.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores tasks and pagination for getTasks', async () => {
    const { useTaskStore } = await import('./task.store');

    mockedTaskApi.getTasks.mockResolvedValue({
      data: {
        data: [{ _id: 't1', title: 'Draft docs', status: 'todo', priority: 'medium' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
    });

    const result = await useTaskStore.getState().getTasks({ page: 1, limit: 10 });

    expect(result).toHaveLength(1);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().pagination).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('sets error and returns null on failed getTasks', async () => {
    const { useTaskStore } = await import('./task.store');

    mockedTaskApi.getTasks.mockRejectedValue({
      response: {
        data: {
          error: 'Tasks fetch failed',
        },
      },
    });

    const result = await useTaskStore.getState().getTasks();

    expect(result).toBeNull();
    expect(useTaskStore.getState().error).toBe('Tasks fetch failed');
  });

  it('returns created task and updates current task state', async () => {
    const { useTaskStore } = await import('./task.store');

    mockedTaskApi.createTask.mockResolvedValue({
      data: {
        data: { _id: 't9', title: 'Ship release', status: 'todo', priority: 'high' },
      },
    });

    const created = await useTaskStore.getState().createTask({
      title: 'Ship release',
      projectId: '507f191e810c19729de860ea',
      priority: 'high',
    });

    expect(created?._id).toBe('t9');
    expect(useTaskStore.getState().task?._id).toBe('t9');
    expect(useTaskStore.getState().isLoading).toBe(false);
  });
});
