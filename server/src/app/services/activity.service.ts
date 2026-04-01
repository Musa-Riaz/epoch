import mongoose from 'mongoose';
import Activity, { ActivityActionType } from '../../infrastructure/database/models/activity.model';
import Project from '../../infrastructure/database/models/project.model';
import User from '../../infrastructure/database/models/user.model';
import { buildPagination } from '../utils/query.util';
import { emitActivityEvent } from '../utils/realtime';

export class ActivityServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ActivityServiceError';
    this.status = status;
  }
}

export interface CreateActivityInput {
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  actionType: ActivityActionType;
  targetType: 'project' | 'task' | 'comment';
  targetId: string;
  projectId?: string;
  projectName?: string;
  targetName?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityListOptions {
  page: number;
  limit: number;
  projectId?: string;
  actionType?: ActivityActionType;
}

function assertObjectId(id: string, message: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ActivityServiceError(message, 400);
  }
}

export async function logActivity(input: CreateActivityInput) {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return null;
  }

  assertObjectId(input.actorId, 'Invalid actor id');
  assertObjectId(input.targetId, 'Invalid target id');

  if (input.projectId) {
    assertObjectId(input.projectId, 'Invalid project id');
  }

  let actorName = input.actorName;
  if (!actorName) {
    const actor = await User.findById(input.actorId, { firstName: 1, lastName: 1 }).lean();
    if (actor) {
      actorName = `${(actor as any).firstName || ''} ${(actor as any).lastName || ''}`.trim() || undefined;
    }
  }

  let projectName = input.projectName;
  if (!projectName && input.projectId) {
    const project = await Project.findById(input.projectId, { name: 1 }).lean();
    projectName = (project as any)?.name;
  }

  const activity = await Activity.create({
    ...input,
    actorName,
    projectName,
  });

  emitActivityEvent(activity, {
    projectId: input.projectId,
    userId: input.actorId,
  });

  return activity;
}

export async function getActivityFeedForUser(userId: string, options: ActivityListOptions) {
  assertObjectId(userId, 'Invalid user id');

  const visibleProjects = await Project.find(
    { $or: [{ owner: userId }, { team: userId }] },
    { _id: 1 }
  ).lean();

  const visibleProjectIds = visibleProjects.map((project: any) => String(project._id));

  const filter: Record<string, unknown> = {
    $or: [{ actorId: userId }],
  };

  if (visibleProjectIds.length > 0) {
    (filter.$or as Array<Record<string, unknown>>).push({
      projectId: { $in: visibleProjectIds },
    });
  }

  if (options.projectId) {
    assertObjectId(options.projectId, 'Invalid project id');
    filter.projectId = options.projectId;
  }

  if (options.actionType) {
    filter.actionType = options.actionType;
  }

  const skip = (options.page - 1) * options.limit;
  const [items, total] = await Promise.all([
    Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit),
    Activity.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPagination(total, options.page, options.limit),
  };
}
