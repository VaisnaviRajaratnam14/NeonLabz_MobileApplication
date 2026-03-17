export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description: string;
  dueDate: string;
  startTime: string;
  endTime: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
