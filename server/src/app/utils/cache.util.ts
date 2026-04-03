import NodeCache from 'node-cache';

// Default TTL: 5 minutes, check period: 60 seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const CacheKeys = {
  managerProjects: (managerId: string) => `manager:${managerId}:projects`,
  managerMembers: (managerId: string) => `manager:${managerId}:members`,
  managerDashboard: (managerId: string) => `manager:${managerId}:dashboard`,
  projectById: (projectId: string) => `project:${projectId}`,
  projectMembers: (projectId: string) => `project:${projectId}:members`,
  projectAnalytics: (projectId: string) => `project:${projectId}:analytics`,
  memberTasks: (memberId: string) => `member:${memberId}:tasks`,
};

export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttl?: number): void {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

export function invalidateCache(keys: string[]): void {
  cache.del(keys);
}

export function invalidatePattern(prefix: string): void {
  const allKeys = cache.keys();
  const matching = allKeys.filter((k) => k.startsWith(prefix));
  if (matching.length > 0) {
    cache.del(matching);
  }
}

export default cache;
