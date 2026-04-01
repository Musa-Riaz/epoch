import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './helpers.utils';

describe('getErrorMessage', () => {
  it('returns nested response error when present', () => {
    const error = {
      response: {
        data: {
          error: 'Request failed',
        },
      },
    };

    expect(getErrorMessage(error)).toBe('Request failed');
  });

  it('returns nested response message when error is absent', () => {
    const error = {
      response: {
        data: {
          message: 'Bad request',
        },
      },
    };

    expect(getErrorMessage(error)).toBe('Bad request');
  });

  it('returns top-level message when response payload is unavailable', () => {
    const error = {
      message: 'Network error',
    };

    expect(getErrorMessage(error)).toBe('Network error');
  });

  it('falls back to default for null and unknown values', () => {
    expect(getErrorMessage(null)).toBe('An error occurred');
    expect(getErrorMessage(undefined)).toBe('An error occurred');
    expect(getErrorMessage({})).toBe('An error occurred');
  });
});
