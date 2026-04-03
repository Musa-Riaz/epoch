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

export async function updateProfile(req: Request, res: Response) : Promise<void> {
    try {

        const {userId} = req.params;
        if(!userId) {
            return sendError({res, error: 'Unauthorized', status: 401});
        }
        const {firstName, lastName, email, role, profilePicture, password} = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            email,
            role,
            profilePicture,
            password: password ? await hashPassword(password) : undefined //hash the new password if provided
        }, {new: true});
        //new will check for the updated document

        if(!updatedUser) {
            return sendError({res, error: 'User not found', status: 404});
        }

        return sendSuccess({
            res,
            data: updatedUser,
            status: 200,
            message: 'Profile updated successfully'
        });

    }
    
    catch(err){
        return sendError({res, error: 'Failed to update profile', details: err as any, status: 500});
    }
}

export async function getProfile(req: Request, res: Response) : Promise<void> {
    try {

        const userId = (req.body as any)?.userId;
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

// -----------------------------------------------------------------------------
// OTP & PASSWORD RESET LOGIC
// -----------------------------------------------------------------------------

import Otp from '../../infrastructure/database/models/otp.model';
import { sendOtpEmail } from '../utils/email.util';

function generateRandomOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak user existence for security
      return sendSuccess({ res, data: null, status: 200, message: 'If the email exists, an OTP has been sent.' });
    }
    
    const otp = generateRandomOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing unused reset OTPs for this email to prevent spam
    await Otp.deleteMany({ email, type: 'reset', isUsed: false });

    await Otp.create({ email, otp, type: 'reset', expiresAt });
    
    // Attempt to send email
    const emailSent = await sendOtpEmail({ to: email, otp, type: 'reset' });
    if (!emailSent) {
      return sendError({ res, error: 'Failed to send OTP email', status: 500 });
    }

    return sendSuccess({ res, data: null, status: 200, message: 'OTP sent successfully to email' });
  } catch (err) {
    return sendError({ res, error: 'Failed to process forgot password', details: err as any, status: 500 });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp, newPassword } = req.body;
    
    const validOtp = await Otp.findOne({ email, otp, type: 'reset', isUsed: false, expiresAt: { $gt: new Date() } });
    if (!validOtp) {
      return sendError({ res, error: 'Invalid or expired OTP', status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await User.findOneAndUpdate({ email }, { password: hashedPassword });
    if (!updatedUser) {
      return sendError({ res, error: 'User not found', status: 404 });
    }

    // Mark OTP as used
    validOtp.isUsed = true;
    await validOtp.save();

    return sendSuccess({ res, data: null, status: 200, message: 'Password reset successfully' });
  } catch (err) {
    return sendError({ res, error: 'Failed to reset password', details: err as any, status: 500 });
  }
}

export async function sendLoginOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendError({ res, error: 'User not found with this email', status: 404 });
    }

    const otp = generateRandomOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await Otp.deleteMany({ email, type: 'login', isUsed: false });
    await Otp.create({ email, otp, type: 'login', expiresAt });
    
    const emailSent = await sendOtpEmail({ to: email, otp, type: 'login' });
    if (!emailSent) {
      return sendError({ res, error: 'Failed to send OTP email', status: 500 });
    }

    return sendSuccess({ res, data: null, status: 200, message: 'Login OTP sent successfully' });
  } catch (err) {
    return sendError({ res, error: 'Failed to send login OTP', details: err as any, status: 500 });
  }
}

export async function loginWithOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp } = req.body;
    
    const validOtp = await Otp.findOne({ email, otp, type: 'login', isUsed: false, expiresAt: { $gt: new Date() } });
    if (!validOtp) {
      return sendError({ res, error: 'Invalid or expired OTP', status: 401 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError({ res, error: 'User not found', status: 404 });
    }

    validOtp.isUsed = true;
    await validOtp.save();

    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (userObj as any).password;

    const token = issueToken({
      userId: (user as any)._id.toString(),
      email: user.email,
      role: user.role
    });

    return sendSuccess({
      res,
      data: { user: userObj, accessToken: token },
      status: 200,
      message: 'User logged in successfully via OTP',
    });
  } catch (err) {
    return sendError({ res, error: 'Failed to login via OTP', details: err as any, status: 500 });
  }
}
