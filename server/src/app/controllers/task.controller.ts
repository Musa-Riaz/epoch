import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Task from '../../infrastructure/database/models/task.model';
import { recalcProjectProgress } from './project.controller';

export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    const task = await Task.create({ title, description, projectId, assignedTo, priority, dueDate });
    // recalc project progress (async)
    recalcProjectProgress(projectId).catch(console.error);
    return sendSuccess({ res, data: task, status: 201, message: 'Task created' });
  } catch (err) {
    return sendError({ res, error: 'Failed to create task', details: err as any, status: 500 });
  }
}

export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.query;
    const filter: any = {};
    if (projectId) filter.projectId = projectId;
    const tasks = await Task.find(filter);
    return sendSuccess({ res, data: tasks, status: 200, message: 'Tasks fetched' });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch tasks', details: err as any, status: 500 });
  }
}

export async function getTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return sendError({ res, error: 'Task not found', status: 404 });
    return sendSuccess({ res, data: task, status: 200, message: 'Task fetched' });
  }
  catch(err){
    return sendError({ res, error: 'Failed to fetch task', details: err as any, status: 500 });
  }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) return sendError({ res, error: 'Task not found', status: 404 });
    // recalc project progress if status changed
    if (updates.status) recalcProjectProgress(task.projectId.toString()).catch(console.error);
    return sendSuccess({ res, data: task, status: 200, message: 'Task updated' });
  } catch (err) {
    return sendError({ res, error: 'Failed to update task', details: err as any, status: 500 });
  }
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return sendError({ res, error: 'Task not found', status: 404 });
    recalcProjectProgress(task.projectId.toString()).catch(console.error);
    return sendSuccess({ res, data: task, status: 200, message: 'Task deleted' });
  } catch (err) {
    return sendError({ res, error: 'Failed to delete task', details: err as any, status: 500 });
  }
}


//  TODO: add the controller that will allow members to assign tasks to the members

export async function assignTask(req: Request, res: Response) {
  try{

  }
  catch(err){
    
  }
}