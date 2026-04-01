import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware');
  return {
    ...actual,
    devtools: (fn: unknown) => fn,
    persist: (fn: unknown) => fn,
  };
});

const mockedAuthApi = {
  login: vi.fn(),
  signup: vi.fn(),
  updateProfile: vi.fn(),
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  getManagerAnalytics: vi.fn(),
};

vi.mock('@/lib/api', () => ({
  authApi: mockedAuthApi,
}));

const mockedLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('auth.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', mockedLocalStorage);
  });

  it('sets authenticated state on successful login', async () => {
    const { useAuthStore } = await import('./auth.store');

    mockedAuthApi.login.mockResolvedValue({
      data: {
        data: {
          user: {
            _id: 'u1',
            firstName: 'Ava',
            lastName: 'Stone',
            email: 'ava@example.com',
            role: 'manager',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
          accessToken: 'token-123',
        },
      },
    });

    await useAuthStore.getState().login('ava@example.com', 'password123');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('token-123');
    expect(state.user?.email).toBe('ava@example.com');
    expect(state.isLoading).toBe(false);
  });

  it('stores error and rethrows when login fails', async () => {
    const { useAuthStore } = await import('./auth.store');

    const error = { response: { data: { error: 'Invalid credentials' } } };
    mockedAuthApi.login.mockRejectedValue(error);

    await expect(useAuthStore.getState().login('ava@example.com', 'bad')).rejects.toEqual(error);

    const state = useAuthStore.getState();
    expect(state.error).toBe('Invalid credentials');
    expect(state.isLoading).toBe(false);
  });

  it('clears auth state and local storage on logout', async () => {
    const { useAuthStore } = await import('./auth.store');

    useAuthStore.setState({
      user: {
        _id: 'u1',
        firstName: 'Ava',
        lastName: 'Stone',
        email: 'ava@example.com',
        role: 'manager',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      token: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      users: [],
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(mockedLocalStorage.removeItem).toHaveBeenCalledWith('auth-storage');
  });
});
