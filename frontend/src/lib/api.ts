const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'vulcan_token';

let authToken: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  return authToken;
}

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Unauthenticated');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    if (error.errors) {
      const messages = Object.values(error.errors).flat();
      throw new Error((messages[0] as string) || error.message || 'Request failed');
    }
    throw new Error(error.message || 'Request failed');
  }

  // 204 No Content
  if (response.status === 204) return null as T;

  return response.json();
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'done';
  user_id: number;
  tasks_count: number;
  created_at: string;
}

export interface TaskUser {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_id: number;
  project: { id: number; name: string };
  users: TaskUser[];
  created_at: string;
}

export interface Comment {
  id: number;
  content: string;
  task_id: number;
  user_id: number;
  user: { id: number; name: string };
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Projects
export const projectsApi = {
  list: () => api<Project[]>('/projects'),
  create: (data: Partial<Project>) => api<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Project>) => api<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => api<void>(`/projects/${id}`, { method: 'DELETE' }),
};

// Tasks
export const tasksApi = {
  list: (params?: { project_id?: number; status?: string; priority?: string }) => {
    const q = new URLSearchParams();
    if (params?.project_id) q.set('project_id', String(params.project_id));
    if (params?.status) q.set('status', params.status);
    if (params?.priority) q.set('priority', params.priority);
    return api<Task[]>(`/tasks${q.toString() ? '?' + q : ''}`);
  },
  create: (data: Partial<Task> & { assignee_ids?: number[] }) =>
    api<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Task> & { assignee_ids?: number[] }) =>
    api<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => api<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

// Comments
export const commentsApi = {
  list: (taskId: number) => api<Comment[]>(`/tasks/${taskId}/comments`),
  create: (taskId: number, content: string) =>
    api<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  remove: (commentId: number) => api<void>(`/comments/${commentId}`, { method: 'DELETE' }),
};

// Users (admin)
export const usersApi = {
  list: () => api<User[]>('/users'),
};
