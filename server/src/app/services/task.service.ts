import mongoose from 'mongoose';
import Task from '../../infrastructure/database/models/task.model';
import { User } from '../../infrastructure/database/models/user.model';
import { recalcProjectProgress } from './project.service';
import { buildPagination } from '../utils/query.util';

export class TaskServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'TaskServiceError';
    this.status = status;
  }
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  media?: string[];
}

export interface TaskListOptions {
  page: number;
  limit: number;
  projectId?: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title';
  sortOrder?: 1 | -1;
}

interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function assertObjectId(id: string, errorMessage: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new TaskServiceError(errorMessage, 400);
  }
}

export async function createTask(input: CreateTaskInput) {
  assertObjectId(input.projectId, 'Invalid project id');

  if (input.assignedTo) {
    assertObjectId(input.assignedTo, 'Invalid assigned user id');
  }

  const task = await Task.create(input);
  recalcProjectProgress(input.projectId).catch(console.error);

  return task;
}

export async function getTasks(options: TaskListOptions): Promise<PaginatedResult<any>> {
  const filter: Record<string, unknown> = {};

  if (options.projectId) {
    assertObjectId(options.projectId, 'Invalid project id');
    filter.projectId = options.projectId;
  }

  if (options.assignedTo) {
    assertObjectId(options.assignedTo, 'Invalid assigned user id');
    filter.assignedTo = options.assignedTo;
  }

  if (options.status) {
    filter.status = options.status;
  }

  if (options.priority) {
    filter.priority = options.priority;
  }

  if (options.search) {
    filter.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { description: { $regex: options.search, $options: 'i' } },
    ];
  }

  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder ?? -1;
  const skip = (options.page - 1) * options.limit;

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(options.limit),
    Task.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPagination(total, options.page, options.limit),
  };
}

export async function getTasksByProject(projectId: string) {
  assertObjectId(projectId, 'Invalid project id');
  return Task.find({ projectId });
}

export async function getTaskById(taskId: string) {
  assertObjectId(taskId, 'Invalid task id');

  const task = await Task.findById(taskId);
  if (!task) {
    throw new TaskServiceError('Task not found', 404);
  }

  return task;
}

export async function getTasksByAssignedUser(userId: string) {
  assertObjectId(userId, 'Invalid user id');
  return Task.find({ assignedTo: userId });
}

export async function getUserById(userId: string) {
  assertObjectId(userId, 'Invalid user id');

  const user = await User.findById(userId);
  if (!user) {
    throw new TaskServiceError('User not found', 404);
  }

  return user;
}

export async function updateTask(taskId: string, updates: UpdateTaskInput) {
  assertObjectId(taskId, 'Invalid task id');

  if (updates.assignedTo) {
    assertObjectId(updates.assignedTo, 'Invalid assigned user id');
  }

  const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
  if (!task) {
    throw new TaskServiceError('Task not found', 404);
  }

  if (updates.status) {
    recalcProjectProgress(task.projectId.toString()).catch(console.error);
  }

  return task;
}

export async function deleteTask(taskId: string) {
  assertObjectId(taskId, 'Invalid task id');

  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new TaskServiceError('Task not found', 404);
  }

  recalcProjectProgress(task.projectId.toString()).catch(console.error);
  return task;
}

export async function assignTask(taskId: string, memberId: string) {
  assertObjectId(taskId, 'Invalid task id');
  assertObjectId(memberId, 'Invalid member id');

  const [task, member] = await Promise.all([
    Task.findById(taskId),
    User.findById(memberId),
  ]);

  if (!task) {
    throw new TaskServiceError('Task not found', 404);
  }

  if (!member) {
    throw new TaskServiceError('Member not found', 404);
  }

  task.assignedTo = memberId as any;
  await task.save();

  return task;
}

export async function bulkUpdateTaskStatus(taskIds: string[], status: 'todo' | 'in-progress' | 'done') {
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new TaskServiceError('taskIds must include at least one id', 400);
  }

  taskIds.forEach((taskId) => assertObjectId(taskId, 'Invalid task id'));

  const tasks = await Task.find({ _id: { $in: taskIds } });
  if (tasks.length === 0) {
    throw new TaskServiceError('No tasks found for provided task ids', 404);
  }

  const result = await Task.updateMany(
    { _id: { $in: taskIds } },
    { $set: { status } }
  );

  const projectIds = Array.from(new Set(tasks.map((task: any) => task.projectId?.toString()).filter(Boolean)));
  await Promise.all(projectIds.map((projectId) => recalcProjectProgress(projectId).catch(console.error)));

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
}
