import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api';
import Team from '../../infrastructure/database/models/team.model';

export async function createTeam(req: Request, res: Response): Promise<void> {
  try {
    const { name, members, projects } = req.body;
    const team = await Team.create({ name, members, projects });
    return sendSuccess({ res, data: team, status: 201, message: 'Team created' });
  } catch (err) {
    return sendError({ res, error: 'Failed to create team', details: err as any, status: 500 });
  }
}

export async function getTeams(req: Request, res: Response): Promise<void> {
  try {
    const teams = await Team.find();
    return sendSuccess({ res, data: teams, status: 200, message: 'Teams fetched' });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch teams', details: err as any, status: 500 });
  }
}

export async function addMember(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const team = await Team.findById(id);
    if (!team) return sendError({ res, error: 'Team not found', status: 404 });
    if (!team.members.includes(userId)) {
      team.members.push(userId as any);
      await team.save();
    }
    return sendSuccess({ res, data: team, status: 200, message: 'Member added' });
  } catch (err) {
    return sendError({ res, error: 'Failed to add member', details: err as any, status: 500 });
  }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const team = await Team.findById(id);
    if (!team) return sendError({ res, error: 'Team not found', status: 404 });
    team.members = team.members.filter(m => m.toString() !== userId);
    await team.save();
    return sendSuccess({ res, data: team, status: 200, message: 'Member removed' });
  } catch (err) {
    return sendError({ res, error: 'Failed to remove member', details: err as any, status: 500 });
  }
}

export async function getTeamProjects(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate('projects');
    if (!team) return sendError({ res, error: 'Team not found', status: 404 });
    return sendSuccess({ res, data: team.projects, status: 200, message: 'Team projects fetched' });
  } catch (err) {
    return sendError({ res, error: 'Failed to fetch team projects', details: err as any, status: 500 });
  }
}
