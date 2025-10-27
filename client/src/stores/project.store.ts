import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { projectApi } from '@/lib/api';
import { IProject, CreateProjectRequest, UpdateProjectRequest, ProjectAnalyticsResponse } from '@/interfaces/api';
import { getErrorMessage } from '@/utils/helpers.utils';
import { IUser } from '../../../server/src/infrastructure/database/models/user.model';

interface ProjectState {
  projects: IProject[];
  currentProject: IProject | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectActions {
  getProjects: () => Promise<void>;
  getProject: (id: string) => Promise<IProject | null>;
  getProjectsByManager: (managerId: string) => Promise<void>;
  getProjectsByMember: (userId: string) => Promise<void>;
  getProjectAnalytics: (projectId: string) => Promise<ProjectAnalyticsResponse | void>;
  createProject: (projectData: CreateProjectRequest) => Promise<IProject | null>;
  updateProject: (id: string, projectData: UpdateProjectRequest) => Promise<IProject | null>;
  updateProjectStatus: (id: string, status: 'active' | 'completed' | 'archived') => Promise<IProject | null>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: IProject | null) => void;
  clearError: () => void;
  getMembersByProject: (projectId: string) => Promise<IUser[] | void>;
  getManagerByProject: (ownerId: string) =>  Promise<IUser | null>;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        projects: [],
        currentProject: null,
        isLoading: false,
        error: null,

        // Actions
        getProjects: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.getProjects();
            set({ projects: response.data.data, isLoading: false });
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
          }
        },

        getProject: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.getProject(id);
            const project = response.data.data;
            set({ currentProject: project, isLoading: false });
            return project;
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
            return null;
          }
        },

        getProjectsByManager: async (managerId: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.getProjectsByManager(managerId);
            set({ projects: response.data.data.projects, isLoading: false });
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
          }
        },

        getProjectsByMember: async (userId: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.getProjectsByMember(userId);
            set({ projects: response.data.data, isLoading: false });
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
          }
        },  

        getProjectAnalytics: async (projectId: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.getProjectAnalytics(projectId);
            set({ isLoading: false });
            return response.data.data;
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
          }
        },

        getMembersByProject: async (projectId: string) => {
          set({ isLoading: true, error: null });
          try {

            const response = await projectApi.getMembersByProject(projectId);
            set({ isLoading: false });
            return response.data.data;

          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
            return null;
          }
        },

        getManagerByProject: async (ownerId: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.getManagerByProject(ownerId);
            set({ isLoading: false });
            return response.data.data;
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
            return null;
          }
        },

        createProject: async (projectData: CreateProjectRequest) => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.createProject(projectData);
            const newProject = response.data.data;
            set((state) => ({
              projects: [...state.projects, newProject],
              isLoading: false,
            }));
            return newProject;
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
            throw err;
          }
        },

        updateProject: async (id: string, projectData: UpdateProjectRequest) => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.updateProject(id, projectData);
            const updatedProject = response.data.data;
            set((state) => ({
              projects: state.projects.map((p) =>
                p._id === id ? updatedProject : p
              ),
              currentProject: state.currentProject?._id === id ? updatedProject : state.currentProject,
              isLoading: false,
            }));
            return updatedProject;
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
            throw err;
          }
        },

        updateProjectStatus: async (id: string, status: 'active' | 'completed' | 'archived') => {
          set({ isLoading: true, error: null });
          try {
            const response = await projectApi.updateProjectStatus(id, status);
            const updatedProject = response.data.data;
            set((state) => ({
              projects: state.projects.map((p) =>
                p._id === id ? updatedProject : p
              ),
              currentProject: state.currentProject?._id === id ? updatedProject : state.currentProject,
              isLoading: false,
            }));
            return updatedProject;
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
            throw err;
          }
        },

        deleteProject: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            await projectApi.deleteProject(id);
            set((state) => ({
              projects: state.projects.filter((p) => p._id !== id),
              currentProject: state.currentProject?._id === id ? null : state.currentProject,
              isLoading: false,
            }));
          } catch (err) {
            set({ error: getErrorMessage(err), isLoading: false });
            throw err;
          }
        },

        setCurrentProject: (project: IProject | null) => {
          set({ currentProject: project });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'project-store',
        partialize: (state) => ({
          projects: state.projects,
          currentProject: state.currentProject,
        }),
      }
    )
  )
);
