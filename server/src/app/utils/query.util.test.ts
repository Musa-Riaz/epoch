import { buildPagination, parsePositiveInt, parseSortOrder, parseString } from './query.util';

describe('query.util', () => {
  describe('parsePositiveInt', () => {
    it('returns default for non-numeric values', () => {
      expect(parsePositiveInt('abc', 10)).toBe(10);
      expect(parsePositiveInt(undefined, 5)).toBe(5);
    });

    it('returns default for zero or negative values', () => {
      expect(parsePositiveInt(0, 10)).toBe(10);
      expect(parsePositiveInt(-2, 10)).toBe(10);
    });

    it('returns capped integer for valid numeric values', () => {
      expect(parsePositiveInt('12', 10)).toBe(12);
      expect(parsePositiveInt('20.8', 10)).toBe(20);
      expect(parsePositiveInt(1000, 10, 100)).toBe(100);
    });
  });

  describe('parseSortOrder', () => {
    it('returns ascending for asc keyword', () => {
      expect(parseSortOrder('asc')).toBe(1);
      expect(parseSortOrder('ASC')).toBe(1);
    });

    it('returns descending for unknown values', () => {
      expect(parseSortOrder('desc')).toBe(-1);
      expect(parseSortOrder(undefined)).toBe(-1);
      expect(parseSortOrder('')).toBe(-1);
    });
  });

  describe('parseString', () => {
    it('returns undefined for non-string and blank values', () => {
      expect(parseString(123)).toBeUndefined();
      expect(parseString(undefined)).toBeUndefined();
      expect(parseString('   ')).toBeUndefined();
    });

    it('returns trimmed value for valid strings', () => {
      expect(parseString(' search ')).toBe('search');
      expect(parseString('value')).toBe('value');
    });
  });

  describe('buildPagination', () => {
    it('builds pagination metadata with rounded total pages', () => {
      const result = buildPagination(95, 2, 10);

      expect(result).toEqual({
        total: 95,
        page: 2,
        limit: 10,
        totalPages: 10,
      });
    });

    it('ensures totalPages is at least one', () => {
      const result = buildPagination(0, 1, 20);

      expect(result).toEqual({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });
  });
});
