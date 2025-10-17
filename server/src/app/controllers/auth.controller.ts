import {Request, Response} from 'express';
import { sendSuccess, sendError } from '../utils/api';
import {User} from '../../infrastructure/database/models/user.model';

export async function signup(req: Request, res: Response): Promise<void>{

    try{

        const {firstName, lastName, email, password, role} = req.body;
        // first find if the user even exists
        await User.findOne({email}).then(async (existingUser) => {
            if(existingUser){
                return sendError({res, error: "User already exists with this email", status: 400});
            }
        });
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            role,
        });

        return sendSuccess({
            res,
            data: newUser,
            status: 201,
            message: 'User registered successfully'
        })

    }
    catch(err){
        return sendError({res, error: 'Failed to register user', details: err as any, status: 500});
    }

}