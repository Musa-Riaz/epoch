import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { taskApi } from "@/lib/api";
import { ITaskResponse, CreateTaskRequest, UpdateTaskRequest } from "@/interfaces/api";
import { getErrorMessage } from "@/utils/helpers.utils";

interface TaskState {
    task: ITaskResponse | null;
    tasks: ITaskResponse[];
    isLoading: boolean;
    error: string | null;
}

interface TaskActions {
    createTask: (taskData: CreateTaskRequest) => Promise<ITaskResponse | null>;
    updateTask: (id: string, taskData: UpdateTaskRequest) => Promise<ITaskResponse | null>;
    deleteTask: (id: string) => Promise<boolean>;
    getTasks: () => Promise<ITaskResponse[] | null>;
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
                        (await taskApi.deleteTask(id)).data.data;
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
                }
            }),
            {
                name: "task-store",
            }
        )
    )
);
