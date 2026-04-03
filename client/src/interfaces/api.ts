// ========================================
// Core Entity Interfaces (replicate server models)
// ========================================

export interface IProject {
  _id: string;
  name: string;
  description: string;
  owner: string;
  team: string[];
  status: 'active' | 'completed' | 'archived';
  deadline?: Date | string;
  progress: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  media?: string[];
  dueDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ITeam {
  _id: string;
  name: string;
  members: string[];
  projects: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IComment {
  _id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IUserResponse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'member' | 'admin' | 'manager';
    profilePicture?: string;
    password?: string;
    createdAt: string;
    updatedAt: string;
}


export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'member' | 'admin' | 'manager';
    profilePicture?: string | null;

}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    profilePicture?: string | null;

}

export interface CreateUserResponse {
  user: IUserResponse;
  message: string;
}

export interface UpdateUserResponse {
  user: IUserResponse;
  message: string;
}

export interface ITaskResponse {
task: ITask;
message: string;

}


export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  media?: File | null;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  projectId?: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  media?: string[];
  dueDate?: string;

}

export interface BulkTaskStatusUpdateRequest {
  taskIds: string[];
  status: 'todo' | 'in-progress' | 'done';
}

export interface IProjectResponse {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  team: string[];
  status: 'active' | 'completed' | 'archived';
  deadline?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;

}

export interface GetProjectsByManagerResponse {
  totalProjects: number;
  totalMembers: number;
  projects: IProject[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'completed' | 'archived';
  minProgress?: number;
  maxProgress?: number;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'name' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskListQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  assignedTo?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface IActivity {
  _id: string;
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  actionType:
    | 'project.created'
    | 'project.status-updated'
    | 'task.created'
    | 'task.updated'
    | 'task.deleted'
    | 'task.assigned'
    | 'task.bulk-status-updated'
    | 'comment.created';
  targetType: 'project' | 'task' | 'comment';
  targetId: string;
  projectId?: string;
  projectName?: string;
  targetName?: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityListQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  actionType?:
    | 'project.created'
    | 'project.status-updated'
    | 'task.created'
    | 'task.updated'
    | 'task.deleted'
    | 'task.assigned'
    | 'task.bulk-status-updated'
    | 'comment.created';
}

export interface INotification {
  _id: string;
  userId: string;
  type:
    | 'task.assigned'
    | 'task.created'
    | 'task.updated'
    | 'task.bulk-status-updated'
    | 'comment.created'
    | 'project.created'
    | 'project.status-updated';
  title: string;
  message: string;
  isRead: boolean;
  relatedType: 'project' | 'task' | 'comment';
  relatedId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationListResponse {
  items: INotification[];
  unreadCount: number;
}

export interface ProjectAnalyticsResponse {
  projectId: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
}

export interface ManagerAnalyticsResponse {
  totalProjects: number;
  totalMembers: number;
}

export interface ITeamResponse {
  _id: string;
  name: string;
  members: string[];
  projects: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICommentResponse {
  _id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
    message: string;
    user: IUserResponse;
    accessToken: string;
}

export interface SignupResponse {
    message: string;
    user: IUserResponse;
    accessToken?: string;

}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  profilePicture?: string | null;
}

// Project interfaces
export interface CreateProjectRequest {
  name: string;
  description?: string;
  owner: string;
  team?: string[];
  teamEmails?: string[]; // Added for email invitations
  status?: 'active' | 'completed' | 'archived';
  deadline?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  team?: string[];
  status?: 'active' | 'completed' | 'archived';
  deadline?: string;
  progress?: number;
}

// Comment interfaces
export interface CreateCommentRequest {
  taskId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

