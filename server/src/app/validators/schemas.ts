import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api';

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'member']).optional(),
  profilePicture: z.string().url().optional(),
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

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().min(1),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
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
