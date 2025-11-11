# Overview

A full-featured project management web app that enables teams to create projects, assign tasks, track progress, collaborate through comments, and manage roles efficiently.
This frontend is built using Next.js (App Router), TypeScript, Zustand for state management, and Axios for API communication with a Node.js + MongoDB backend.

# Business Logic & Frontend Flow

## 1. Authentication Flow

Login / Signup pages communicate with /api/auth/login and /api/auth/signup.

On successful login, a JWT is stored in a secure HttpOnly cookie.

A useAuth hook verifies session status and manages redirects.

Zustand authStore retains current user and token state.

``` typescript
interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} 

```

## Project Management Logic

Projects page lists all accessible projects.

New project form validates input with Zod and submits via Axios.

Projects fetched via projectStore.fetchProjects().

Individual project page shows:

Overview (progress, stats)

Members (avatars, roles)

Task list (linked by projectId)

``` typescript
interface ProjectState {
  projects: IProject[];
  selectedProject: IProject | null;
  fetchProjects: () => Promise<void>;
  createProject: (payload: IProjectCreate) => Promise<void>;
  selectProject: (id: string) => void;
}
```

## Task Management Logic

Tasks linked to a project via projectId.

Each task supports CRUD operations, status updates, and priority flags.

Task cards display color-coded progress (pending, in-progress, done).

Drag-and-drop task board implemented using dnd-kit or react-beautiful-dnd.

``` typescript
// taskStore.ts
interface TaskState {
  tasks: ITask[];
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (taskData: ITaskCreate) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
}

```

## 4. Comment and Collaboration

Threaded comments under each task.

Real-time update placeholder (can later extend to WebSockets).

Markdown support for comments using react-markdown.

## 5. Dashboard and Analytics

Dashboard aggregates:

Tasks completed per project.

User workload summary.

Project deadlines overview.

Charts generated via Recharts.
