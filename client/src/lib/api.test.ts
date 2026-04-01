import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockedApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/axios', () => ({
  api: mockedApi,
}));

import { projectApi, taskApi } from './api';

describe('api query forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards list query params to projectApi.getProjects', async () => {
    mockedApi.get.mockResolvedValue({ data: {} });

    await projectApi.getProjects({
      page: 2,
      limit: 12,
      search: 'atlas',
      status: 'active',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/projects', {
      params: {
        page: 2,
        limit: 12,
        search: 'atlas',
        status: 'active',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
    });
  });

  it('forwards list query params to projectApi.getProjectsByManager', async () => {
    mockedApi.get.mockResolvedValue({ data: {} });

    await projectApi.getProjectsByManager('manager-1', {
      page: 1,
      limit: 9,
      status: 'archived',
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/projects/manager/manager-1', {
      params: {
        page: 1,
        limit: 9,
        status: 'archived',
      },
    });
  });

  it('forwards list query params to taskApi.getTasks', async () => {
    mockedApi.get.mockResolvedValue({ data: {} });

    await taskApi.getTasks({
      page: 3,
      limit: 20,
      status: 'todo',
      priority: 'high',
      search: 'docs',
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/tasks', {
      params: {
        page: 3,
        limit: 20,
        status: 'todo',
        priority: 'high',
        search: 'docs',
      },
    });
  });
});
