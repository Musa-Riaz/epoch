import { api } from "@/lib/axios";
import { ApiResponse } from "@/types";
import {
  CreateTaskRequest,
  BulkTaskStatusUpdateRequest,
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
  ProjectAnalyticsResponse,
  IComment,
  IActivity,
  INotification,
  ProjectListQueryParams,
  TaskListQueryParams,
  ActivityListQueryParams,
  NotificationListQueryParams,
  NotificationListResponse,
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
      profilePicture,
    }),

    updateProfile: async (userId: string, profileData: Partial<IUserResponse>) =>
      await api.put<ApiResponse<IUserResponse>>(`/auth/updateProfile/${userId}`, profileData),

  getUserById: async (id: string) =>
    await api.get<ApiResponse<IUserResponse>>(`/auth/user/${id}`),

  getAllUsers: async () =>
    await api.get<ApiResponse<IUserResponse[]>>("/auth/users"),

  getManagerAnalytics: async (id: string) =>
    await api.get<ApiResponse<ManagerAnalyticsResponse>>(
      `/auth/manager/analytics/${id}`
    ),
};

export const taskApi = {
  // Define task-related API methods here
  getTasks: async (params?: TaskListQueryParams) =>
    await api.get<ApiResponse<ITask[]>>("/tasks", { params }),

  getTask: async (id: string) =>
    await api.get<ApiResponse<ITask>>(`/tasks/${id}`),

  getTasksByProject: async (projectId: string) =>
    await api.get<ApiResponse<ITask[]>>(`/tasks/project/${projectId}`),

  getTasksByAssignedUser: async (userId: string) => await api.get<ApiResponse<ITask[]>>(`/tasks/assigned/${userId}`),

  getUserByTask: async (taskId: string) => await api.get<ApiResponse<IUserResponse>>(`/tasks/user/${taskId}`),
  
  createTask: async (taskData: CreateTaskRequest) =>
    await api.post<ApiResponse<ITask>>("/tasks", taskData),

  updateTask: async (id: string, taskData: UpdateTaskRequest) =>
    await api.patch<ApiResponse<ITask>>(`/tasks/${id}`, taskData),
  assignTask: async (taskId: string, memberId: string) => await api.post<ApiResponse<ITask>>('/tasks/assign', {taskId, memberId}),

  bulkUpdateTaskStatus: async (payload: BulkTaskStatusUpdateRequest) =>
    await api.patch<ApiResponse<{ matchedCount: number; modifiedCount: number }>>('/tasks/bulk-status', payload),

  deleteTask: async (id: string) =>
    await api.delete<ApiResponse<null>>(`/tasks/${id}`),
};

export const projectApi = {
  getProjects: async (params?: ProjectListQueryParams) =>
    await api.get<ApiResponse<IProject[]>>("/projects", { params }),

  getProject: async (id: string) =>
    await api.get<ApiResponse<IProject>>(`/projects/${id}`),

  getProjectsByManager: async (managerId: string, params?: ProjectListQueryParams) =>
    await api.get<ApiResponse<GetProjectsByManagerResponse>>(
      `/projects/manager/${managerId}`,
      { params }
    ),

    getProjectsByMember: async (userId: string, params?: ProjectListQueryParams) =>
      await api.get<ApiResponse<IProject[]>>(`/projects/member/${userId}/projects`, { params }),

  getProjectAnalytics: async (projectId: string) =>
    await api.get<ApiResponse<ProjectAnalyticsResponse>>(
      `/projects/${projectId}/analytics`
    ),

    getMembersByProject: async (projectId: string) => await api.get<ApiResponse<IUserResponse[]>>(
      `/projects/members/${projectId}/projects`
    ),

    getManagerByProject: async (ownerId: string) => await api.get<ApiResponse<IUserResponse>>(`/projects/manager/${ownerId}/projects`),

  createProject: async (projectData: CreateProjectRequest) =>
    await api.post<ApiResponse<IProject>>("/projects", projectData),

  updateProject: async (id: string, projectData: UpdateProjectRequest) =>
    await api.patch<ApiResponse<IProject>>(`/projects/${id}`, projectData),

  updateProjectStatus: async (
    id: string,
    status: "active" | "completed" | "archived"
  ) =>
    await api.patch<ApiResponse<IProject>>(`/projects/${id}/status`, {
      status,
    }),

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
  getCommentAvatar: async (authorId: string) => 
    await api.get<ApiResponse<IUserResponse>>(`/comments/avatar/${authorId}`)
};

export const activityApi = {
  getActivities: async (params?: ActivityListQueryParams) =>
    await api.get<ApiResponse<IActivity[]>>('/activities', { params }),
};

export const notificationApi = {
  getNotifications: async (params?: NotificationListQueryParams) =>
    await api.get<ApiResponse<NotificationListResponse>>('/notifications', { params }),
  markAsRead: async (id: string) =>
    await api.patch<ApiResponse<INotification>>(`/notifications/${id}/read`),
  markAllAsRead: async () =>
    await api.patch<ApiResponse<{ success: boolean }>>('/notifications/read-all'),
};
