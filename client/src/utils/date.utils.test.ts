import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatDate,
  formatDateLong,
  formatDateRelative,
  formatDateShort,
  formatDateTime,
  formatTime,
} from './date.utils';

describe('date.utils', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('formats date values consistently for short and long date outputs', () => {
    const input = '2025-10-22T15:30:00.000Z';

    expect(formatDate(input)).toBe('10/22/2025');
    expect(formatDateShort(input)).toBe('Oct 22, 2025');
    expect(formatDateLong(input)).toBe('October 22, 2025');
  });

  it('formats date time and time only output', () => {
    const input = '2025-10-22T15:30:00.000Z';
    const expectedDateTime = new Date(input).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const expectedTime = new Date(input).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    expect(formatDateTime(input)).toBe(expectedDateTime);
    expect(formatTime(input)).toBe(expectedTime);
  });

  it('returns relative date labels for today and yesterday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'));

    expect(formatDateRelative('2026-04-01T08:00:00.000Z')).toBe('Today');
    expect(formatDateRelative('2026-03-31T12:00:00.000Z')).toBe('Yesterday');
  });

  it('returns relative date labels for weeks, months, and years', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'));

    expect(formatDateRelative('2026-03-20T12:00:00.000Z')).toBe('1 week ago');
    expect(formatDateRelative('2026-02-15T12:00:00.000Z')).toBe('1 month ago');
    expect(formatDateRelative('2024-01-01T12:00:00.000Z')).toBe('2 years ago');
  });
});
