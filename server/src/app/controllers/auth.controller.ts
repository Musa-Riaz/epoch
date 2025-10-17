import {Request, Response} from 'express';
import { sendSuccess, sendError } from '../utils/api';
import {IUser, User} from '../../infrastructure/database/models/user.model';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { issueToken } from '../utils/token.util';


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

