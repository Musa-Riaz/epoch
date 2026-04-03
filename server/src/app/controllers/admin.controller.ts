import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import { User } from '../../infrastructure/database/models/user.model';
import Project from '../../infrastructure/database/models/project.model';
import Invitation from '../../infrastructure/database/models/invitation.model';
import Task from '../../infrastructure/database/models/task.model';

// System-wide Dashboard Metrics
export async function getSystemMetrics(req: Request, res: Response): Promise<void> {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalInvitations = await Invitation.countDocuments();
    
    // Group users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    return sendSuccess({
      res,
      data: {
        totalUsers,
        totalProjects,
        totalInvitations,
        usersByRole
      },
      status: 200,
      message: 'System metrics fetched successfully'
    });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch system metrics', details: err as any, status: 500 });
  }
}

// Get all projects in the system (Super Admin)
export async function getAllSystemProjects(req: Request, res: Response): Promise<void> {
  try {
    const projects = await Project.find()
      .populate('owner', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });
      
    return sendSuccess({
      res,
      data: projects,
      status: 200,
      message: 'All system projects fetched successfully'
    });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch projects', details: err as any, status: 500 });
  }
}

// Delete a user from the entire system
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return sendError({ res, error: 'User not found', status: 404 });
    }
    
    if (user.role === 'admin') {
      return sendError({ res, error: 'Cannot delete another admin', status: 403 });
    }

    await User.findByIdAndDelete(id);
    // Cleanup their data...
    await Project.deleteMany({ owner: id });
    await Invitation.deleteMany({ email: user.email });

    return sendSuccess({ res, data: null, status: 200, message: 'User and their related data deleted successfully' });
  } catch (err) {
    return sendError({ res, error: 'Failed to delete user', details: err as any, status: 500 });
  }
}

// Get all tasks in the system (Super Admin)
export async function getAllSystemTasks(req: Request, res: Response): Promise<void> {
  try {
    const tasks = await Task.find()
      .populate('projectId', 'name status')
      .populate('assignedTo', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });

    return sendSuccess({
      res,
      data: tasks,
      status: 200,
      message: 'All system tasks fetched successfully'
    });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch tasks', details: err as any, status: 500 });
  }
}
