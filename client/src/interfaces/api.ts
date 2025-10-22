import { IProject } from '../../../server/src/infrastructure/database/models/project.model';
import { ITeam } from '../../../server/src/infrastructure/database/models/team.model';
import { IComment } from '../../../server/src/infrastructure/database/models/comment.model';
import { ITask } from '../../../server/src/infrastructure/database/models/task.model';

// Re-export server interfaces
export type { ITask, IProject, ITeam, IComment };

export interface IUserResponse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'member' | 'admin' | 'manager';
    profilePicture?: string;
    createdAt: string;
    updatedAt: string;
}

// export interface ITask {
//   _id: string;
//     title: string;
//     description?: string;
//     projectId: string;
//     assignedTo?: string;
//     status: 'todo' | 'in-progress' | 'done';
//     priority: 'low' | 'medium' | 'high';
//     media?: string[];
//     dueDate?: Date;
//     createdAt: Date;
//     updatedAt: Date;  

// }

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
  projects: IProject[];
  
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

