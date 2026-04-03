import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // Send cookies with every request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json.error || 'Something went wrong');
  }

  return json;
}

// Auth
export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ data: { user: User } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ data: { user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ data: { user: User } }>('/auth/me'),
};

// Tasks
export const tasksApi = {
  getAll: (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.order) params.set('order', filters.order);

    const query = params.toString();
    return request<{ data: { tasks: Task[] } }>(`/tasks${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) =>
    request<{ data: { task: Task } }>(`/tasks/${id}`),

  create: (input: CreateTaskInput) =>
    request<{ data: { task: Task } }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateTaskInput) =>
    request<{ data: { task: Task } }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
};

export { ApiError };
