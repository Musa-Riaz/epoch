import {Request, Response} from 'express';
import { sendSuccess, sendError } from '../utils/api';
import {IUser, User} from '../../infrastructure/database/models/user.model';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { issueToken } from '../utils/token.util';
import Project from '../../infrastructure/database/models/project.model';


export async function signup(req: Request, res: Response): Promise<void>{

    try{

        const {firstName, lastName, email, password, role, profilePicture} = req.body;

        // first find if the user even exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return sendError({ res, error: 'User already exists with this email', status: 400 });
        }

        // Hash the password before creating the user
        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            profilePicture
        });

        // Do not return the password field in the response
        const userObj = newUser.toObject();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (userObj as any).password;

        return sendSuccess({
            res,
            data: userObj,
            status: 201,
            message: 'User registered successfully'
        });

    }
    catch(err){
        return sendError({res, error: 'Failed to register user', details: err as any, status: 500});
    }

}

export async function login(req: Request, res: Response): Promise<void> {

    try{

        const {email, password} =  req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return sendError({ res, error: 'Invalid email or password', status: 401 });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return sendError({ res, error: 'Invalid email or password', status: 401 });
        }

        const userObj = user.toObject();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (userObj as any).password;

        // creating jwt token 
        const token = issueToken({
            userId: (user as any)._id.toString(),
            email: user.email,
            role: user.role
        })

        

        return sendSuccess({
            res,
            data: {user: userObj, accessToken: token},
            status: 200,
            message: 'User logged in successfully',
        });

    }
    catch(err){
        return sendError({res, error: 'Failed to login user', details: err as any, status: 500});
    }

}

export async function getProfile(req: Request, res: Response) : Promise<void> {
    try {

        const userId = (req.body as any).userId;
        if(!userId) {
            return sendError({res, error: 'Unauthorized', status: 401});
        }

        const user = await User.findById(userId);
        if(!user) {
            return sendError({res, error: 'User not found', status: 404});
        }

        return sendSuccess({
            res,
            data:user,
            status:200,
            message: "User profile fetched successfully"
        })

    }
    catch(err) {
        return sendError({res, error: 'Failed to get user profile', details: err as any, status: 500});
    }
}

export async function getUserById(req: Request, res: Response) : Promise<void> {
    try {

        const { userId } = req.params;
        if(!userId){
            return sendError({res, error: 'User ID is required', status: 400});
        }
        const user = await User.findById(userId);
        if(!user){
            return sendError({res, error: 'User not found', status: 404});
        }
        const userObj = user.toObject();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete (userObj as any).password;

        return sendSuccess({
            res,
            data: userObj,
            status: 200,
            message: "User fetched successfully"
        })

    }
    catch(err){
        return sendError({res, error: 'Failed to get user', status: 500});
    }
}

export async function getAllUsers(req: Request, res: Response) : Promise<void> {
    try {

        const users = await User.find();
        return sendSuccess({
            res,
            data: {users, length: users.length},
            status: 200,
            message: "Users fetched successfully"
        })

    }
    catch(err){
        return sendError({res, error: 'Failed to get users', details: err as any, status: 500});
    }
}

// Get analytics of a particular manager
export async function getManagerAnalytics(req: Request, res: Response) : Promise<void>{
  try{

    const managerId = req.params.id; // Get the id from params
    const manager = await User.findById(managerId);
    if(!manager || manager.role !== 'manager'){
        return sendError({ res, error: 'Manager not found', status: 404 });
    } 
    // get all projects managed by this manager
    const projects = await Project.find({ owner: managerId });
    console.log(projects)
    const totalMembers = projects.reduce((sum, project) => sum + (project.team?.length || 0), 0);
    
    return sendSuccess({ 
      res, 
      data: { 
        totalProjects: projects.length, 
        totalMembers: totalMembers,
        projects: projects.map(p => ({
          ...p.toObject?.() || p,
          teamSize: p.team?.length || 0
        }))
      }, 
      status: 200, 
      message: 'Projects fetched successfully' 
    });
  }
  catch(err){
    return sendError({ res, error: 'Failed to fetch projects by manager', details: err as any, status: 500 });
  }
}


// method through which a manager will assign tasks to a member
export async function assignTask(req: Request, res: Response): Promise<void> {
    try {

    }
    catch(err){
        return sendError({ res, error: 'Failed to assign task', details: err as any, status: 500 });
    }
}