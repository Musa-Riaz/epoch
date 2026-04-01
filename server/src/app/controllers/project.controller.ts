import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import {
  ProjectServiceError,
  archiveProject,
  createProject as createProjectService,
  getManagerById,
  getMembersByProject as getMembersByProjectService,
  getProjectAnalytics as getProjectAnalyticsService,
  getProjectById as getProjectByIdService,
  getProjectsByManager as getProjectsByManagerService,
  getProjectsByMember as getProjectsByMemberService,
  getProjectsForUser,
  updateProject as updateProjectService,
  updateProjectStatus as updateProjectStatusService,
} from '../services/project.service';
import { parsePositiveInt, parseSortOrder, parseString } from '../utils/query.util';
import { logActivity } from '../services/activity.service';
import { createNotifications } from '../services/notification.service';

function parseProgressQuery(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.max(0, Math.min(100, Math.floor(parsed)));
}

function handleProjectServiceError(res: Response, err: unknown, fallbackMessage: string): void {
  if (err instanceof ProjectServiceError) {
    sendError({ res, error: err.message, status: err.status });
    return;
  }

  sendError({ res, error: fallbackMessage, details: err as unknown, status: 500 });
}

export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, deadline, team } = req.body;
    const owner = (req as any).user?.userId;
    const actor = (req as any).user;
    const actorName = parseString(`${(req as any).user?.firstName || ''} ${(req as any).user?.lastName || ''}`.trim());
    if (!owner) return sendError({ res, error: 'Unauthorized', status: 401 });

    const project = await createProjectService({ name, description, owner, deadline, team });

    if (actor?.userId) {
      void logActivity({
        actorId: actor.userId,
        actorName,
        actorEmail: actor.email,
        actorRole: actor.role,
        actionType: 'project.created',
        targetType: 'project',
        targetId: String(project._id),
        projectId: String(project._id),
        projectName: project.name,
        targetName: project.name,
        message: `created project \"${project.name}\"`,
      }).catch(console.error);
    }

    if (Array.isArray(project.team) && project.team.length > 0) {
      void createNotifications({
        userIds: project.team.map((memberId: any) => String(memberId)),
        type: 'project.created',
        title: 'Added to project',
        message: `You were added to project \"${project.name}\".`,
        relatedType: 'project',
        relatedId: String(project._id),
        projectId: String(project._id),
      }).catch(console.error);
    }

    return sendSuccess({ res, data: project, status: 201, message: 'Project created' });
  } catch (err) {
    handleProjectServiceError(res, err, 'Failed to create project');
    return;
  }
}

export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return sendError({ res, error: 'Unauthorized', status: 401 });

    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const search = parseString(req.query.search);
    const status = parseString(req.query.status) as 'active' | 'completed' | 'archived' | undefined;
    const minProgress = parseProgressQuery(req.query.minProgress);
    const maxProgress = parseProgressQuery(req.query.maxProgress);
    const deadlineFrom = parseString(req.query.deadlineFrom);
    const deadlineTo = parseString(req.query.deadlineTo);
    const sortBy = parseString(req.query.sortBy) as 'createdAt' | 'updatedAt' | 'deadline' | 'name' | 'progress' | undefined;
    const sortOrder = parseSortOrder(req.query.sortOrder);

    const result = await getProjectsForUser(userId, {
      page,
      limit,
      search,
      status,
      minProgress,
      maxProgress,
      deadlineFrom,
      deadlineTo,
      sortBy,
      sortOrder,
    });

    return sendSuccess({
      res,
      data: result.items,
      pagination: result.pagination,
      status: 200,
      message: 'Projects fetched',
    });
  } catch (err) {
    handleProjectServiceError(res, err, 'Failed to fetch projects');
    return;
  }
}

// get projects by manager
export async function getProjectsByManager(req: Request, res: Response): Promise<void> {
  try{

    const managerId = req.params.id;
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const search = parseString(req.query.search);
    const status = parseString(req.query.status) as 'active' | 'completed' | 'archived' | undefined;
    const minProgress = parseProgressQuery(req.query.minProgress);
    const maxProgress = parseProgressQuery(req.query.maxProgress);
    const deadlineFrom = parseString(req.query.deadlineFrom);
    const deadlineTo = parseString(req.query.deadlineTo);
    const sortBy = parseString(req.query.sortBy) as 'createdAt' | 'updatedAt' | 'deadline' | 'name' | 'progress' | undefined;
    const sortOrder = parseSortOrder(req.query.sortOrder);

    const projectStats = await getProjectsByManagerService(managerId, {
      page,
      limit,
      search,
      status,
      minProgress,
      maxProgress,
      deadlineFrom,
      deadlineTo,
      sortBy,
      sortOrder,
    });

    return sendSuccess({
      res,
      data: {
        totalProjects: projectStats.totalProjects,
        totalMembers: projectStats.totalMembers,
        projects: projectStats.projects,
      },
      pagination: projectStats.pagination,
      status: 200,
      message: 'Projects fetched successfully'
    })

  }
  catch(err){
    handleProjectServiceError(res, err, 'Failed to fetch projects by manager');
    return;
  }
}

// get projects of which the member is a part of 
export async function getProjectsByMember(req: Request, res: Response): Promise<void> {
  try{
    const { userId } = req.params;
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const search = parseString(req.query.search);
    const status = parseString(req.query.status) as 'active' | 'completed' | 'archived' | undefined;
    const minProgress = parseProgressQuery(req.query.minProgress);
    const maxProgress = parseProgressQuery(req.query.maxProgress);
    const deadlineFrom = parseString(req.query.deadlineFrom);
    const deadlineTo = parseString(req.query.deadlineTo);
    const sortBy = parseString(req.query.sortBy) as 'createdAt' | 'updatedAt' | 'deadline' | 'name' | 'progress' | undefined;
    const sortOrder = parseSortOrder(req.query.sortOrder);

    const result = await getProjectsByMemberService(userId, {
      page,
      limit,
      search,
      status,
      minProgress,
      maxProgress,
      deadlineFrom,
      deadlineTo,
      sortBy,
      sortOrder,
    });

    if(result.items.length === 0){
      return sendSuccess({ res, data: [], status: 200, message: 'No projects found for this member' });
    }
    return sendSuccess({
      res,
      data: result.items,
      pagination: result.pagination,
      status: 200,
      message: 'Projects fetched successfully'
    });

  }
  catch(err){
    handleProjectServiceError(res, err, 'Failed to fetch projects by member');
    return;
  }
}

// Get projects analytics

export async function getProjectAnalytics(req: Request, res: Response) : Promise<void> {
  try {
    const projectId = req.params.id;
    const analytics = await getProjectAnalyticsService(projectId);

    return sendSuccess({
      res,
      data: analytics,
      status: 200,
      message: 'Project analytics fetched successfully'
    });
  } catch (err) {
    handleProjectServiceError(res, err, 'Failed to fetch project analytics');
    return;
  }
}

export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const project = await getProjectByIdService(id);
    return sendSuccess({ res, data: project, status: 200, message: 'Project fetched' });
  } catch (err) {
    handleProjectServiceError(res, err, 'Failed to fetch project');
    return;
  }
}

// get team members for a particular project
export async function getMembersByProject(req: Request, res: Response): Promise<void>{

  try{
  const { id } = req.params;
  const members = await getMembersByProjectService(id);
  return sendSuccess({ res, data: members, status: 200, message: 'Team members fetched successfully' });

  }
  catch(err){
    handleProjectServiceError(res, err, 'Failed to get team members');
    return;
  }
}

export async function getManagerByProject(req: Request, res: Response): Promise<void>{
  try{

    const { id }= req.params;

    const manager = await getManagerById(id);
    return sendSuccess({ res, data: manager, status: 200, message: 'Manager fetched successfully' });

  }
  catch(err){
    handleProjectServiceError(res, err, 'Failed to get manager by project');
    return;
  }
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const project = await updateProjectService(id, updates);
    return sendSuccess({ res, data: project, status: 200, message: 'Project updated' });
  } catch (err) {
    handleProjectServiceError(res, err, 'Failed to update project');
    return;
  }
}

export async function updateProjectStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actor = (req as any).user;
    const actorName = parseString(`${(req as any).user?.firstName || ''} ${(req as any).user?.lastName || ''}`.trim());
    const project = await updateProjectStatusService(id, status);

    if (actor?.userId) {
      void logActivity({
        actorId: actor.userId,
        actorName,
        actorEmail: actor.email,
        actorRole: actor.role,
        actionType: 'project.status-updated',
        targetType: 'project',
        targetId: String(project._id),
        projectId: String(project._id),
        projectName: project.name,
        targetName: project.name,
        message: `updated project \"${project.name}\" status to ${project.status}`,
        metadata: { status: project.status },
      }).catch(console.error);
    }

    if (Array.isArray(project.team) && project.team.length > 0) {
      void createNotifications({
        userIds: project.team.map((memberId: any) => String(memberId)),
        type: 'project.status-updated',
        title: 'Project status changed',
        message: `Project \"${project.name}\" is now ${project.status}.`,
        relatedType: 'project',
        relatedId: String(project._id),
        projectId: String(project._id),
      }).catch(console.error);
    }

    return sendSuccess({ res, data: project, status: 200, message: 'Project status updated' });
  } catch (err) {
    handleProjectServiceError(res, err, 'Failed to update project status');
    return;
  }
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const project = await archiveProject(id);
    return sendSuccess({ res, data: project, status: 200, message: 'Project archived' });
  } catch (err) {
    handleProjectServiceError(res, err, 'Failed to delete project');
    return;
  }
}


