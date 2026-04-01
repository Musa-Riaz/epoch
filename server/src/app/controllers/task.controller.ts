import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import {
  TaskServiceError,
  assignTask as assignTaskService,
  bulkUpdateTaskStatus as bulkUpdateTaskStatusService,
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTaskById,
  getTasks as getTasksService,
  getTasksByAssignedUser as getTasksByAssignedUserService,
  getTasksByProject as getTasksByProjectService,
  getUserById,
  updateTask as updateTaskService,
} from '../services/task.service';
import { parsePositiveInt, parseSortOrder, parseString } from '../utils/query.util';
import { logActivity } from '../services/activity.service';
import { createNotifications } from '../services/notification.service';

function handleTaskServiceError(res: Response, err: unknown, fallbackMessage: string): void {
  if (err instanceof TaskServiceError) {
    sendError({ res, error: err.message, status: err.status });
    return;
  }

  sendError({ res, error: fallbackMessage, details: err as unknown, status: 500 });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    const actor = (req as any).user;
    const actorName = parseString(`${(req as any).user?.firstName || ''} ${(req as any).user?.lastName || ''}`.trim());
    const task = await createTaskService({ title, description, projectId, assignedTo, priority, dueDate });

    if (actor?.userId) {
      void logActivity({
        actorId: actor.userId,
        actorName,
        actorEmail: actor.email,
        actorRole: actor.role,
        actionType: 'task.created',
        targetType: 'task',
        targetId: String(task._id),
        projectId: String(task.projectId),
        targetName: task.title,
        message: `created task \"${task.title}\"`,
        metadata: { title: task.title, status: task.status },
      }).catch(console.error);
    }

    if (assignedTo) {
      void createNotifications({
        userIds: [String(assignedTo)],
        type: 'task.created',
        title: 'New task created',
        message: `Task \"${task.title}\" was created and assigned to you.`,
        relatedType: 'task',
        relatedId: String(task._id),
        projectId: String(task.projectId),
      }).catch(console.error);
    }

    return sendSuccess({ res, data: task, status: 201, message: 'Task created' });
  } catch (err) {
    handleTaskServiceError(res, err, 'Failed to create task');
    return;
  }
}

export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const projectId = parseString(req.query.projectId);
    const assignedTo = parseString(req.query.assignedTo);
    const status = parseString(req.query.status) as 'todo' | 'in-progress' | 'done' | undefined;
    const priority = parseString(req.query.priority) as 'low' | 'medium' | 'high' | undefined;
    const search = parseString(req.query.search);
    const sortBy = parseString(req.query.sortBy) as 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title' | undefined;
    const sortOrder = parseSortOrder(req.query.sortOrder);

    const result = await getTasksService({
      page,
      limit,
      projectId,
      assignedTo,
      status,
      priority,
      search,
      sortBy,
      sortOrder,
    });

    return sendSuccess({
      res,
      data: result.items,
      pagination: result.pagination,
      status: 200,
      message: 'Tasks fetched',
    });
  } catch (err) {
    handleTaskServiceError(res, err, 'Failed to fetch tasks');
    return;
  }
}

export async function getTasksByProject(req: Request, res: Response) : Promise<void> {
  try{
    const {projectId} = req.params;

    const tasks = await getTasksByProjectService(projectId);
    if(tasks.length === 0){
      return sendSuccess({ res, data: [], status: 200, message: 'No tasks found for this project' });
    }
    return sendSuccess({ res, data: tasks, status: 200, message: 'Tasks fetched by project' });
  }
  catch(err){
    handleTaskServiceError(res, err, 'Failed to fetch tasks by project');
    return;
  }
}

export async function getTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const task = await getTaskById(id);
    return sendSuccess({ res, data: task, status: 200, message: 'Task fetched' });
  }
  catch(err){
    handleTaskServiceError(res, err, 'Failed to fetch task');
    return;
  }
}

export async function getTasksByAssignedUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const tasks = await getTasksByAssignedUserService(id);
    if(tasks.length === 0){
      return sendSuccess({ res, data: [], status: 200, message: 'No tasks assigned to this user' });
    }
    return sendSuccess({ res, data: tasks, status: 200, message: 'Tasks fetched by assigned user' });
  }
  catch(err) {
    handleTaskServiceError(res, err, 'Failed to fetch tasks by assigned user');
    return;
  }
}

// get user by their task assignment
export async function getUserbyTask(req: Request, res: Response): Promise<void> {
  try{
    const { id }= req.params;

    const user = await getUserById(id);

    return sendSuccess({ res, data: user, status: 200, message: 'User fetched by task' });
  }
  catch(err){
    handleTaskServiceError(res, err, 'Failed to fetch user by task');
    return;
  }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const actor = (req as any).user;
    const actorName = parseString(`${(req as any).user?.firstName || ''} ${(req as any).user?.lastName || ''}`.trim());
    const task = await updateTaskService(id, updates);

    if (actor?.userId) {
      void logActivity({
        actorId: actor.userId,
        actorName,
        actorEmail: actor.email,
        actorRole: actor.role,
        actionType: 'task.updated',
        targetType: 'task',
        targetId: String(task._id),
        projectId: String(task.projectId),
        targetName: task.title,
        message: `updated task \"${task.title}\"`,
      }).catch(console.error);
    }

    if (task.assignedTo) {
      void createNotifications({
        userIds: [String(task.assignedTo)],
        type: 'task.updated',
        title: 'Task updated',
        message: `Task \"${task.title}\" has new updates.`,
        relatedType: 'task',
        relatedId: String(task._id),
        projectId: String(task.projectId),
      }).catch(console.error);
    }

    return sendSuccess({ res, data: task, status: 200, message: 'Task updated' });
  } catch (err) {
    handleTaskServiceError(res, err, 'Failed to update task');
    return;
  }
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const actor = (req as any).user;

    const task = await deleteTaskService(id);

    if (actor?.userId) {
      void logActivity({
        actorId: actor.userId,
        actorEmail: actor.email,
        actorRole: actor.role,
        actionType: 'task.deleted',
        targetType: 'task',
        targetId: String(task._id),
        projectId: String(task.projectId),
        message: `deleted task \"${task.title}\"`,
      }).catch(console.error);
    }

    return sendSuccess({ res, data: task, status: 200, message: 'Task deleted' });
  } catch (err) {
    handleTaskServiceError(res, err, 'Failed to delete task');
    return;
  }
}



// method through which a manager will assign tasks to a member
export async function assignTask(req: Request, res: Response): Promise<void> {
    try {
        const { taskId, memberId} = req.body;
    const actor = (req as any).user;
    const actorName = parseString(`${(req as any).user?.firstName || ''} ${(req as any).user?.lastName || ''}`.trim());

        if (!taskId || !memberId) {
          return sendError({ res, error: 'taskId and memberId are required', status: 400 });
        }

        const task = await assignTaskService(taskId, memberId);

        if (actor?.userId) {
          void logActivity({
            actorId: actor.userId,
            actorName,
            actorEmail: actor.email,
            actorRole: actor.role,
            actionType: 'task.assigned',
            targetType: 'task',
            targetId: String(task._id),
            projectId: String(task.projectId),
            targetName: task.title,
            message: `assigned task \"${task.title}\"`,
            metadata: { assignedTo: memberId },
          }).catch(console.error);
        }

        void createNotifications({
          userIds: [memberId],
          type: 'task.assigned',
          title: 'Task assigned',
          message: `You were assigned task \"${task.title}\".`,
          relatedType: 'task',
          relatedId: String(task._id),
          projectId: String(task.projectId),
        }).catch(console.error);

        return sendSuccess({ res, data: task, status: 200, message: 'Task assigned to member successfully' });
        
    }
    catch(err){
        handleTaskServiceError(res, err, 'Failed to assign task');
        return;
    }
}

export async function bulkUpdateTaskStatus(req: Request, res: Response): Promise<void> {
  try {
    const { taskIds, status } = req.body;
    const actor = (req as any).user;
    const actorName = parseString(`${(req as any).user?.firstName || ''} ${(req as any).user?.lastName || ''}`.trim());
    const result = await bulkUpdateTaskStatusService(taskIds, status);

    if (actor?.userId && Array.isArray(taskIds) && taskIds.length > 0) {
      void logActivity({
        actorId: actor.userId,
        actorName,
        actorEmail: actor.email,
        actorRole: actor.role,
        actionType: 'task.bulk-status-updated',
        targetType: 'task',
        targetId: String(taskIds[0]),
        targetName: `${taskIds.length} tasks`,
        message: `bulk updated ${taskIds.length} task(s) to ${status}`,
        metadata: { taskIds, status, count: taskIds.length },
      }).catch(console.error);
    }

    return sendSuccess({
      res,
      data: result,
      status: 200,
      message: 'Tasks updated successfully',
    });
  } catch (err) {
    handleTaskServiceError(res, err, 'Failed to bulk update task status');
    return;
  }
}