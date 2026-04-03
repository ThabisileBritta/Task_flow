export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
