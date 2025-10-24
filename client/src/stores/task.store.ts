import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { taskApi } from "@/lib/api";
import { CreateTaskRequest, UpdateTaskRequest } from "@/interfaces/api";
import { ITask } from "@/interfaces/api";
import { getErrorMessage } from "@/utils/helpers.utils";

interface TaskState {
    task: ITask | null;
    tasks: ITask[];
    isLoading: boolean;
    error: string | null;
}

interface TaskActions {
    createTask: (taskData: CreateTaskRequest) => Promise<ITask | null>;
    updateTask: (id: string, taskData: UpdateTaskRequest) => Promise<ITask | null>;
    deleteTask: (id: string) => Promise<boolean>;
    getTasks: () => Promise<ITask[] | null>;
    getTasksByProject: (projectId: string) => Promise<ITask[] | null>;
    getUserByTask: (taskId: string) => Promise<any | null>;
}

export const useTaskStore = create<TaskState & TaskActions>()(
    devtools(
        persist(
            (set) => ({
                task: null,
                tasks: [],
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
                getTasks: async () => {
                    set({ isLoading: true });
                    try {
                        const response = (await taskApi.getTasks()).data.data;
                        set({ tasks: response, isLoading: false });
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
                getUserByTask: async (taskId : string) => {
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
                }
            }),
            {
                name: "task-store",
            }
        )
    )
);
