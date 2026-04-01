import { extractToken, issueToken, verifyToken } from './token.util';

describe('token.util', () => {
  it('issues and verifies a token payload', () => {
    const token = issueToken({
      userId: '507f191e810c19729de860ea',
      email: 'manager@example.com',
      role: 'manager',
    });

    const decoded = verifyToken(token);

    expect(decoded.userId).toBe('507f191e810c19729de860ea');
    expect(decoded.email).toBe('manager@example.com');
    expect(decoded.role).toBe('manager');
  });

  it('throws for invalid token signatures', () => {
    expect(() => verifyToken('invalid.token.value')).toThrow('Invalid or expired token');
  });

  it('extracts bearer token from authorization header', () => {
    expect(extractToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('returns null when authorization header is missing or malformed', () => {
    expect(extractToken(undefined)).toBeNull();
    expect(extractToken('Basic abc123')).toBeNull();
  });
});
