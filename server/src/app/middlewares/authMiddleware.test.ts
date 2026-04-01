import { authMiddleware, requireRole } from './authMiddleware';
import { verifyToken } from '../utils/token.util';
import { sendError } from '../utils/api';

jest.mock('../utils/token.util', () => ({
  extractToken: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.mock('../utils/api', () => ({
  sendError: jest.fn(),
}));

const { extractToken } = jest.requireMock('../utils/token.util') as {
  extractToken: jest.Mock;
};

describe('authMiddleware', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attaches user data and calls next for valid token', () => {
    const req: any = { headers: { authorization: 'Bearer good-token' } };
    extractToken.mockReturnValue('good-token');
    (verifyToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'manager@example.com',
      role: 'manager',
    });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({
      userId: 'u1',
      email: 'manager@example.com',
      role: 'manager',
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 401 json response when token is missing', () => {
    const req: any = { headers: {} };
    extractToken.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized. Kindly login to access this resource.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('maps verification errors to sendError', () => {
    const req: any = { headers: { authorization: 'Bearer bad-token' } };
    extractToken.mockReturnValue('bad-token');
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('bad token');
    });

    authMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith({
      res,
      error: 'Invalid or expired access token',
      status: 401,
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  const res = {} as any;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next when user role is allowed', () => {
    const middleware = requireRole(['admin', 'manager']);
    const req: any = { user: { role: 'manager' } };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns unauthorized when user is missing', () => {
    const middleware = requireRole(['admin']);
    const req: any = {};

    middleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith({
      res,
      error: 'User not authenticated',
      details: null,
      status: 401,
    });
  });

  it('returns forbidden when user role is not allowed', () => {
    const middleware = requireRole(['admin']);
    const req: any = { user: { role: 'member' } };

    middleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith({
      res,
      error: 'Insufficient permissions',
      details: null,
      status: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
