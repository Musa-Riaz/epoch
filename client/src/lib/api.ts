import {api} from '@/lib/axios'
import { ApiResponse } from '@/types';
import { IUserResponse, LoginResponse, SignupResponse } from '@/interfaces/api';

export const authApi = {
    login: async (email: string, password: string) => await api.post<ApiResponse<LoginResponse>>('/auth/login', {email, password}),

    signup: async (firstName: string, lastName: string, email: string, password: string, role?: string) => await api.post<ApiResponse<SignupResponse>>('/auth/signup', {firstName, lastName, email, password, role, profilePicture: null}),

    logout: async () => await api.post<ApiResponse<null>>('/auth/logout'),

    getUserById: async (id: string) => await api.get<ApiResponse<IUserResponse>>(`/auth/user/${id}`),

    getAllUsers: async () => await api.get<ApiResponse<IUserResponse[]>>('/auth/users'),

}