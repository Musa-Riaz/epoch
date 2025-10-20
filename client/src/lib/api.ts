import { api } from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateTaskRequest } from "../interfaces/api";
import {
  IUserResponse,
  ICommentResponse,
  IProjectResponse,
  ITaskResponse,
  UpdateTaskRequest,
  ITeamResponse,
  LoginResponse,
  SignupResponse,
} from "@/interfaces/api";
import { profile } from "console";

export const authApi = {
  login: async (email: string, password: string) =>
    await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    }),

  signup: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: string,
    profilePicture?: string | null
  ) =>
    await api.post<ApiResponse<SignupResponse>>("/auth/signup", {
      firstName,
      lastName,
      email,
      password,
      role,
      profilePicture
    }),

  getUserById: async (id: string) =>
    await api.get<ApiResponse<IUserResponse>>(`/auth/user/${id}`),

  getAllUsers: async () =>
    await api.get<ApiResponse<IUserResponse[]>>("/auth/users"),
};

export const taskApi = {
  // Define task-related API methods here
  getTasks: async () => await api.get<ApiResponse<ITaskResponse[]>>("/tasks"),

  getTask: async (id: string) => await api.get<ApiResponse<ITaskResponse>>(`/tasks/${id}`),

  createTask: async (taskData: CreateTaskRequest) =>
    await api.post<ApiResponse<ITaskResponse>>("/tasks", taskData),

  updateTask: async (id: string, taskData: UpdateTaskRequest) =>
    await api.patch<ApiResponse<ITaskResponse>>(`/tasks/${id}`, taskData),
  deleteTask: async (id: string) =>
    await api.delete<ApiResponse<null>>(`/tasks/${id}`),
};
