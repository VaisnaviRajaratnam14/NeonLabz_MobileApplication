import { api } from "../../../shared/config/api";
import { ApiResponse, Task, TaskPayload } from "../types/task";

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>("/tasks");
    return response.data.data;
  },

  createTask: async (payload: TaskPayload): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>("/tasks", payload);
    return response.data.data;
  },

  updateTask: async (id: string, payload: TaskPayload): Promise<Task> => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return response.data.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  }
};
