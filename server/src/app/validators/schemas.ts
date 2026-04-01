import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api';

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'member']).optional(),
  // TODO: Add profile picture validation, currently it is not working
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  deadline: z.string().optional(),
  team: z.array(z.string()).optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  team: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

export const projectStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'archived']),
});

export const objectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id parameter'),
});

export const managerParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager id parameter'),
});

export const memberParamSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member id parameter'),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().min(1),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  media: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
});

export const taskAssignSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task id parameter'),
  memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member id parameter'),
});

export const taskBulkStatusSchema = z.object({
  taskIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task id parameter')).min(1),
  status: z.enum(['todo', 'in-progress', 'done']),
});

export const taskProjectParamSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project id parameter'),
});

export const commentSchema = z.object({
  taskId: z.string().min(1),
  content: z.string().min(1),
});

export const teamSchema = z.object({
  name: z.string().min(1),
  members: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
});

export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      const message = err?.errors ? err.errors.map((e: any) => e.message).join(', ') : 'Validation error';
      console.error(message);
      return sendError({ res, error: 'ValidationError', details: err, status: 422 });
    }
  };
}

export function validateParams(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (err: any) {
      const message = err?.errors ? err.errors.map((e: any) => e.message).join(', ') : 'Validation error';
      console.error(message);
      return sendError({ res, error: 'ValidationError', details: err, status: 422 });
    }
  };
}
