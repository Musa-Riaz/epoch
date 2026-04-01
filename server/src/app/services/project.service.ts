import mongoose from 'mongoose';
import Project from '../../infrastructure/database/models/project.model';
import Task from '../../infrastructure/database/models/task.model';
import User from '../../infrastructure/database/models/user.model';
import { buildPagination } from '../utils/query.util';

export class ProjectServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ProjectServiceError';
    this.status = status;
  }
}

const PROJECT_STATUSES = ['active', 'completed', 'archived'] as const;
type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface CreateProjectInput {
  name: string;
  description?: string;
  owner: string;
  deadline?: string;
  team?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  deadline?: string;
  team?: string[];
  progress?: number;
  status?: ProjectStatus;
}

export interface ProjectListOptions {
  page: number;
  limit: number;
  status?: ProjectStatus;
  search?: string;
  minProgress?: number;
  maxProgress?: number;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'name' | 'progress';
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

interface ManagerProjectsResult {
  totalProjects: number;
  totalMembers: number;
  projects: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function applyProjectListFilters(baseFilter: Record<string, unknown>, options: ProjectListOptions): Record<string, unknown> {
  const filter: Record<string, unknown> = { ...baseFilter };

  if (options.status) {
    filter.status = options.status;
  }

  if (options.search) {
    filter.$and = [
      {
        $or: [
          { name: { $regex: options.search, $options: 'i' } },
          { description: { $regex: options.search, $options: 'i' } },
        ],
      },
    ];
  }

  if (options.minProgress !== undefined || options.maxProgress !== undefined) {
    const progressFilter: Record<string, number> = {};

    if (options.minProgress !== undefined) {
      progressFilter.$gte = options.minProgress;
    }

    if (options.maxProgress !== undefined) {
      progressFilter.$lte = options.maxProgress;
    }

    filter.progress = progressFilter;
  }

  if (options.deadlineFrom || options.deadlineTo) {
    const deadlineFilter: Record<string, Date> = {};

    if (options.deadlineFrom) {
      deadlineFilter.$gte = new Date(options.deadlineFrom);
    }

    if (options.deadlineTo) {
      deadlineFilter.$lte = new Date(options.deadlineTo);
    }

    filter.deadline = deadlineFilter;
  }

  return filter;
}

function assertObjectId(value: string, message: string): void {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ProjectServiceError(message, 400);
  }
}

export async function createProject(input: CreateProjectInput) {
  assertObjectId(input.owner, 'Invalid owner id');

  const project = await Project.create({
    name: input.name,
    description: input.description,
    owner: input.owner,
    deadline: input.deadline,
    team: input.team ?? [],
  });

  return project;
}

export async function getProjectsForUser(userId: string, options: ProjectListOptions): Promise<PaginatedResult<any>> {
  assertObjectId(userId, 'Invalid user id');

  const filter = applyProjectListFilters(
    { $or: [{ owner: userId }, { team: userId }] },
    options
  );

  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder ?? -1;
  const skip = (options.page - 1) * options.limit;

  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(options.limit),
    Project.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPagination(total, options.page, options.limit),
  };
}

export async function getProjectsByManager(
  managerId: string,
  options: ProjectListOptions
): Promise<ManagerProjectsResult> {
  assertObjectId(managerId, 'Invalid manager id');

  const manager = await User.findById(managerId);
  if (!manager || manager.role !== 'manager') {
    throw new ProjectServiceError('Manager not found', 404);
  }

  const filter = applyProjectListFilters({ owner: managerId }, options);
  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder ?? -1;
  const skip = (options.page - 1) * options.limit;

  const [projects, total, totalMembersAggregate] = await Promise.all([
    Project.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(options.limit),
    Project.countDocuments(filter),
    Project.aggregate([
      { $match: filter },
      {
        $project: {
          teamCount: { $size: { $ifNull: ['$team', []] } },
        },
      },
      {
        $group: {
          _id: null,
          totalMembers: { $sum: '$teamCount' },
        },
      },
    ]),
  ]);

  const totalMembers = totalMembersAggregate[0]?.totalMembers ?? 0;

  return {
    totalProjects: total,
    totalMembers,
    projects: projects.map((project) => ({
      ...(project.toObject?.() || project),
      teamSize: project.team?.length || 0,
    })),
    pagination: buildPagination(total, options.page, options.limit),
  };
}

export async function getProjectsByMember(
  memberId: string,
  options: ProjectListOptions
): Promise<PaginatedResult<any>> {
  assertObjectId(memberId, 'Invalid member id');

  const member = await User.findById(memberId);
  if (!member) {
    throw new ProjectServiceError('Member not found', 404);
  }

  const filter = applyProjectListFilters({ team: memberId }, options);
  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder ?? -1;
  const skip = (options.page - 1) * options.limit;

  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(options.limit),
    Project.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPagination(total, options.page, options.limit),
  };
}

export async function getProjectAnalytics(projectId: string) {
  assertObjectId(projectId, 'Invalid project id');

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ProjectServiceError('Project not found', 404);
  }

  const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
    Task.countDocuments({ projectId }),
    Task.countDocuments({ projectId, status: 'done' }),
    Task.countDocuments({ projectId, status: 'todo' }),
    Task.countDocuments({ projectId, status: 'in-progress' }),
  ]);

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    projectId,
    progress,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
  };
}

export async function getProjectById(projectId: string) {
  assertObjectId(projectId, 'Invalid project id');

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ProjectServiceError('Project not found', 404);
  }

  return project;
}

export async function getMembersByProject(projectId: string) {
  assertObjectId(projectId, 'Invalid project id');

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ProjectServiceError('Project not found', 404);
  }

  return User.find({ _id: { $in: project.team } });
}

export async function getManagerById(managerId: string) {
  assertObjectId(managerId, 'Invalid manager id');

  const manager = await User.findById(managerId);
  if (!manager) {
    throw new ProjectServiceError('Manager not found', 404);
  }

  return manager;
}

export async function updateProject(projectId: string, updates: UpdateProjectInput) {
  assertObjectId(projectId, 'Invalid project id');

  const project = await Project.findByIdAndUpdate(projectId, updates, { new: true });
  if (!project) {
    throw new ProjectServiceError('Project not found', 404);
  }

  return project;
}

export async function updateProjectStatus(projectId: string, status: string) {
  assertObjectId(projectId, 'Invalid project id');

  if (!PROJECT_STATUSES.includes(status as ProjectStatus)) {
    throw new ProjectServiceError('Invalid status', 400);
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { status: status as ProjectStatus },
    { new: true }
  );

  if (!project) {
    throw new ProjectServiceError('Project not found', 404);
  }

  return project;
}

export async function archiveProject(projectId: string) {
  return updateProjectStatus(projectId, 'archived');
}

export async function recalcProjectProgress(projectId: string): Promise<number> {
  assertObjectId(projectId, 'Invalid project id');

  const [total, done] = await Promise.all([
    Task.countDocuments({ projectId }),
    Task.countDocuments({ projectId, status: 'done' }),
  ]);

  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });

  return progress;
}
