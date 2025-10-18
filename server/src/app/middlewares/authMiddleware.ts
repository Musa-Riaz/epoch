import {Request, Response, NextFunction} from 'express';
import { verifyToken, extractToken } from '../utils/token.util';
import { sendError } from '../utils/api';

export const authMiddleware = (req: Request, res: Response, next: NextFunction)=> {
    try {
        // extract the token from the authorization header
        const token = extractToken(req.headers.authorization);
        if(!token){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // verify the access token
        const decoded = verifyToken(token);
        // passing the user information in the request object
        (req as any).user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch(err){
        return sendError({
            res,
            error: 'Invalid or expired access token',
            status: 401,
        })

    }
}

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return sendError({ res, error: 'User not authenticated', details: null, status: 401 });
      }

      if (!roles.includes(user.role)) {
        console.log('User role:', user.role, 'Required roles:', roles);
        return sendError({ res, error: 'Insufficient permissions', details: null, status: 403 });
      }

      next();
    } catch (error) {
      return sendError({ res, error: 'Authorization failed', details: null, status: 403 });
    }
  };
};