import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { taskApi } from "@/lib/api";
import { CreateTaskRequest, IUserResponse, PaginationMeta, TaskListQueryParams, UpdateTaskRequest } from "@/interfaces/api";
import { ITask } from "@/interfaces/api";
import { getErrorMessage } from "@/utils/helpers.utils";

interface TaskState {
    task: ITask | null;
    tasks: ITask[];
    pagination: PaginationMeta | null;
    isLoading: boolean;
    error: string | null;
}

interface TaskActions {
    createTask: (taskData: CreateTaskRequest) => Promise<ITask | null>;
    updateTask: (id: string, taskData: UpdateTaskRequest) => Promise<ITask | null>;
    deleteTask: (id: string) => Promise<boolean>;
    getTasks: (params?: TaskListQueryParams) => Promise<ITask[] | null>;
    getTasksByProject: (projectId: string) => Promise<ITask[] | null>;
    getTasksByAssignedUser: (userId: string) => Promise<ITask[] | null>;
    getUserByTask: (taskId: string) => Promise<IUserResponse | null>;
    assignTask: (taskId: string, memberId: string) => Promise<ITask | null>;
    bulkUpdateTaskStatus: (taskIds: string[], status: 'todo' | 'in-progress' | 'done') => Promise<boolean>;
}

export const useTaskStore = create<TaskState & TaskActions>()(
    devtools(
        persist(
            (set) => ({
                task: null,
                tasks: [],
                pagination: null,
                isLoading: false,
                error: null,
                createTask: async (taskData) => {
                    set({ isLoading: true });
                    try {
                        const response = (await taskApi.createTask(taskData)).data.data;
                        set({ task: response, isLoading: false });
                        return response;
                    } catch (error) {
                        set({ error: getErrorMessage(error), isLoading: false });
                        return null;
                    }
                },
                updateTask: async (id, taskData) => {
                    set({ isLoading: true });
                    try {
                        const response = (await taskApi.updateTask(id, taskData)).data.data;
                        set({ task: response, isLoading: false });
                        return response;
                    } catch (error) {
                        set({ error: getErrorMessage(error), isLoading: false });
                        return null;
                    }
                },
                deleteTask: async (id) => {
                    set({ isLoading: true });
                    try {
                        await taskApi.deleteTask(id);
                        set({ isLoading: false });
                        return true;
                    } catch (error) {
                        set({ error: getErrorMessage(error), isLoading: false });
                        return false;
                    }
                },
                getTasks: async (params) => {
                    set({ isLoading: true });
                    try {
                        const res = (await taskApi.getTasks(params)).data;
                        const response = res.data;
                        set({ tasks: response, pagination: res.pagination ?? null, isLoading: false });
                        return response;
                    } catch (error) {
                        set({ error: getErrorMessage(error), isLoading: false });
                        return null;
                    }
                },
                getTask: async (id: string) => {
                    set({ isLoading: true });
                    try {
                        const response = (await taskApi.getTask(id)).data.data;
                        set({ task: response, isLoading: false });
                        return response;
                    } catch (error) {
                        set({ error: getErrorMessage(error), isLoading: false });
                        return null;
                    }
                },
                getTasksByProject: async (projectId: string) => {
                    set({ isLoading: true });
                    try {
                        const response = (await taskApi.getTasksByProject(projectId)).data.data;
                        set({ tasks: response, isLoading: false });
                        return response;
                    } catch (error) {
                        set({ error: getErrorMessage(error), isLoading: false });
                        return null;
                    }
                },
                getTasksByAssignedUser: async (userId: string) => {
                    set({ isLoading: true });
                    try {
                        const response = (await taskApi.getTasksByAssignedUser(userId)).data.data;
                        set({ tasks: response, isLoading: false });
                        return response;
                    } catch (error) {
                        set({ error: getErrorMessage(error), isLoading: false });
                        return null;
                    }
                },
                getUserByTask: async (taskId: string) => {
                    set({ isLoading: true });
                    try {

                        const response = (await taskApi.getUserByTask(taskId)).data.data;
                        set({ isLoading: false });
                        return response;

                    }
                    catch(err){
                        set({ error: getErrorMessage(err), isLoading: false });
                        return null;
                    }
                },
                assignTask: async (taskId: string, memberId: string) => {
                    set({isLoading: true});
                    try{
                        const response = (await taskApi.assignTask(taskId, memberId)).data.data;
                        set({isLoading: false});
                        return response;
                    }
                    catch(err){
                        set({ error: getErrorMessage(err), isLoading: false });
                        return null;
                    }
                },
                bulkUpdateTaskStatus: async (taskIds, status) => {
                    set({ isLoading: true });
                    try {
                        await taskApi.bulkUpdateTaskStatus({ taskIds, status });
                        set((state) => ({
                            tasks: state.tasks.map((task) =>
                                taskIds.includes(String(task._id)) ? { ...task, status } : task
                            ),
                            isLoading: false,
                        }));
                        return true;
                    } catch (err) {
                        set({ error: getErrorMessage(err), isLoading: false });
                        return false;
                    }
                }
            }),
            {
                name: "task-store",
            }
        )
    )
);
