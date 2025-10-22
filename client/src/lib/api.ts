import { api } from "@/lib/axios";
import { ApiResponse } from "@/types";
import { 
  CreateTaskRequest,
  IUserResponse,
  ITask,
  UpdateTaskRequest,
  LoginResponse,
  SignupResponse,
  ManagerAnalyticsResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  IProject,
  GetProjectsByManagerResponse,
  IComment
} from "@/interfaces/api";

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

  getManagerAnalytics: async (id: string) => await api.get<ApiResponse<ManagerAnalyticsResponse>>(`/auth/manager/analytics/${id}`),
};

export const taskApi = {
  // Define task-related API methods here
  getTasks: async () => await api.get<ApiResponse<ITask[]>>("/tasks"),

  getTask: async (id: string) => await api.get<ApiResponse<ITask>>(`/tasks/${id}`),

  getTasksByProject: async (projectId: string) => await api.get<ApiResponse<ITask[]>>(`/tasks/project/${projectId}`),

  createTask: async (taskData: CreateTaskRequest) =>
    await api.post<ApiResponse<ITask>>("/tasks", taskData),

  updateTask: async (id: string, taskData: UpdateTaskRequest) =>
    await api.patch<ApiResponse<ITask>>(`/tasks/${id}`, taskData),
  deleteTask: async (id: string) =>
    await api.delete<ApiResponse<null>>(`/tasks/${id}`),
};

export const projectApi = {
  getProjects: async () => await api.get<ApiResponse<IProject[]>>("/projects"),

  getProject: async (id: string) => await api.get<ApiResponse<IProject>>(`/projects/${id}`),

  getProjectsByManager: async (managerId: string) => 
    await api.get<ApiResponse<GetProjectsByManagerResponse>>(`/projects/manager/${managerId}`),

  createProject: async (projectData: CreateProjectRequest) =>
    await api.post<ApiResponse<IProject>>("/projects", projectData),

  updateProject: async (id: string, projectData: UpdateProjectRequest) =>
    await api.patch<ApiResponse<IProject>>(`/projects/${id}`, projectData),

  updateProjectStatus: async (id: string, status: 'active' | 'completed' | 'archived') =>
    await api.patch<ApiResponse<IProject>>(`/projects/${id}/status`, { status }),

  deleteProject: async (id: string) =>
    await api.delete<ApiResponse<null>>(`/projects/${id}`),
};

export const commentApi = {
  getCommentsByTask: async (taskId: string) =>
    await api.get<ApiResponse<IComment[]>>(`/comments/${taskId}`),

  createComment: async (commentData: CreateCommentRequest) =>
    await api.post<ApiResponse<IComment>>("/comments", commentData),

  updateComment: async (id: string, commentData: UpdateCommentRequest) =>
    await api.patch<ApiResponse<IComment>>(`/comments/${id}`, commentData),

  deleteComment: async (id: string) =>
    await api.delete<ApiResponse<null>>(`/comments/${id}`),
};
