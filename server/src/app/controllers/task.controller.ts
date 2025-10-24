import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Task from '../../infrastructure/database/models/task.model';
import { User} from '../../infrastructure/database/models/user.model';
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

export async function getTasksByProject(req: Request, res: Response) : Promise<void> {
  try{
    const {projectId} = req.params;
    const tasks = await Task.find({projectId});
    if(!tasks){
      return sendError({ res, error: 'Tasks not found for the project', status: 400 });
    }
    return sendSuccess({ res, data: tasks, status: 200, message: 'Tasks fetched by project' });
  }
  catch(err){
    return sendError({ res, error: 'Failed to fetch tasks by project', details: err as any, status: 500 });
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

// get user by their task assignment
export async function getUserbyTask(req: Request, res: Response): Promise<void> {
  try{
    const { id }= req.params;
    const user = await User.findById(id);
    return sendSuccess({ res, data: user, status: 200, message: 'User fetched by task' });
  }
  catch(err){
    return sendError({ res, error: 'Failed to fetch user by task', details: err as any, status: 500 });
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



// method through which a manager will assign tasks to a member
export async function assignTask(req: Request, res: Response): Promise<void> {
    try {
        const { taskId, memberId} = req.body;
        const task = await Task.findById(taskId);
        if(!task){
            return sendError({ res, error: 'Task not found', status: 404 });
        }
        task.assignedTo = memberId;
        await task.save();
        return sendSuccess({ res, data: task, status: 200, message: 'Task assigned to member successfully' });
        
    }
    catch(err){
        return sendError({ res, error: 'Failed to assign task', details: err as any, status: 500 });
    }
}