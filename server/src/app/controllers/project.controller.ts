import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Project from '../../infrastructure/database/models/project.model';
import Task from '../../infrastructure/database/models/task.model';

export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, deadline, team } = req.body;
    const owner = (req as any).user?.userId;
    if (!owner) return sendError({ res, error: 'Unauthorized', status: 401 });

    const project = await Project.create({ name, description, owner, deadline, team });
    return sendSuccess({ res, data: project, status: 201, message: 'Project created' });
  } catch (err) {
    return sendError({ res, error: 'Failed to create project', details: err as any, status: 500 });
  }
}

export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return sendError({ res, error: 'Unauthorized', status: 401 });

    const projects = await Project.find({ $or: [{ owner: userId }, { team: userId }] });
    return sendSuccess({ res, data: projects, status: 200, message: 'Projects fetched' });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch projects', details: err as any, status: 500 });
  }
}

export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return sendError({ res, error: 'Project not found', status: 404 });
    return sendSuccess({ res, data: project, status: 200, message: 'Project fetched' });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch project', details: err as any, status: 500 });
  }
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const project = await Project.findByIdAndUpdate(id, updates, { new: true });
    if (!project) return sendError({ res, error: 'Project not found', status: 404 });
    return sendSuccess({ res, data: project, status: 200, message: 'Project updated' });
  } catch (err) {
    return sendError({ res, error: 'Failed to update project', details: err as any, status: 500 });
  }
}

export async function updateProjectStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'completed', 'archived'].includes(status)) {
      return sendError({ res, error: 'Invalid status', status: 400 });
    }
    const project = await Project.findByIdAndUpdate(id, { status }, { new: true });
    if (!project) return sendError({ res, error: 'Project not found', status: 404 });
    return sendSuccess({ res, data: project, status: 200, message: 'Project status updated' });
  } catch (err) {
    return sendError({ res, error: 'Failed to update project status', details: err as any, status: 500 });
  }
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    // Soft-delete by setting status to archived
    const project = await Project.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
    if (!project) return sendError({ res, error: 'Project not found', status: 404 });
    // Optionally, could also remove tasks; leaving tasks for now
    return sendSuccess({ res, data: project, status: 200, message: 'Project archived' });
  } catch (err) {
    return sendError({ res, error: 'Failed to delete project', details: err as any, status: 500 });
  }
}

// Recalculate project.progress based on tasks
export async function recalcProjectProgress(projectId: string) {
  const total = await Task.countDocuments({ projectId });
  if (total === 0) return 0;
  const done = await Task.countDocuments({ projectId, status: 'done' });
  const progress = Math.round((done / total) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
  return progress;
}


