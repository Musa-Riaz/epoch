import { Pagination } from './api';

export function parsePositiveInt(value: unknown, defaultValue: number, max = 100): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return Math.min(Math.floor(parsed), max);
}

export function parseSortOrder(value: unknown): 1 | -1 {
  const normalized = String(value ?? '').toLowerCase();
  return normalized === 'asc' ? 1 : -1;
}

export function parseString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildPagination(total: number, page: number, limit: number): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    total,
    page,
    limit,
    totalPages,
  };
}
