import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Project from '../../infrastructure/database/models/project.model';
import Task from '../../infrastructure/database/models/task.model';
import User from '../../infrastructure/database/models/user.model';

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

// get projects by manager
export async function getProjectsByManager(req: Request, res: Response): Promise<void> {
  try{

    const managerId = req.params.id; // Get the id from params
    const manager = await User.findById(managerId);
    if(!manager || manager.role !== 'manager'){
        return sendError({ res, error: 'Manager not found', status: 404 });
    }
    // get all projects managed by this manager
    const projects = await Project.find({ owner: managerId });
    const totalMembers = projects.reduce((sum, project) => sum + (project.team?.length || 0), 0);

    return sendSuccess({res, data: { totalProjects: projects.length, totalMembers: totalMembers, projects: projects.map(p => ({
      ...p.toObject?.() || p,
      teamSize: p.team?.length || 0
    })) }, status: 200, message: 'Projects fetched successfully'})

  }
  catch(err){
    return sendError({ res, error: 'Failed to fetch projects by manager', details: err as any, status: 500 });
  }
}

// Get projects analytics

export async function getProjectAnalytics(req: Request, res: Response) : Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) return sendError({ res, error: 'Project not found', status: 404 });

    // Get tasks related to the project
    const tasks = await Task.find({ projectId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return sendSuccess({
      res,
      data: { projectId, progress, totalTasks, completedTasks, pendingTasks, inProgressTasks },
      status: 200,
      message: 'Project analytics fetched successfully'
    });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch project analytics', details: err as any, status: 500 });
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

// get team members for a particular project
export async function getMembersByProject(req: Request, res: Response): Promise<void>{

  try{
  const { id } = req.params;
  const project = await Project.findById(id);
  if(!project){
    return sendError({ res, error: 'Project not found', status: 404 });
  }

  const members = await User.find({_id: { $in: project.team }});
  return sendSuccess({ res, data: members, status: 200, message: 'Team members fetched successfully' });

  }
  catch(err){
    return sendError({ res, error: 'Failed to get team members', details: err as any, status: 500 });
  }
}

export async function getManagerByProject(req: Request, res: Response): Promise<void>{
  try{

    const { id }= req.params;

    const manager = await User.findById(id);
    if(!manager){
      return sendError({ res, error: 'Manager not found', status: 404 });
    }
    return sendSuccess({ res, data: manager, status: 200, message: 'Manager fetched successfully' });

  }
  catch(err){
    return sendError({ res, error: 'Failed to get manager by project', details: err as any, status: 500 });
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


