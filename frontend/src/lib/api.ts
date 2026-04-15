const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'vulcan_token';

let authToken: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(token: string | null) {
  authToken = token;
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);
}

export function getToken() { return authToken; }

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}/api${endpoint}`, { ...options, headers });

  if (res.status === 401) { setToken(null); window.location.href = '/login'; throw new Error('Unauthenticated'); }
  if (res.status === 204)  return null as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    if (err.errors) throw new Error((Object.values(err.errors).flat()[0] as string) || err.message);
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface User { id: number; name: string; email: string; role: string; }

export interface Project {
  id: number; name: string; description: string | null;
  status: 'active' | 'archived'; user_id: number;
  tasks_count: number; created_at: string;
}

export interface TaskUser { id: number; name: string; }

export interface Task {
  id: number; title: string; description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null; project_id: number;
  project: { id: number; name: string };
  users: TaskUser[];
  created_at: string;
}

export interface Comment {
  id: number; content: string; task_id: number; user_id: number;
  user: { id: number; name: string }; created_at: string;
}

// ── API helpers ────────────────────────────────────────────────────────────────

export const profileApi = {
  update: (data: { name?: string; email?: string; current_password?: string; password?: string; password_confirmation?: string }) =>
    api<User>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

export const projectsApi = {
  list:   ()                        => api<Project[]>('/projects'),
  create: (d: Partial<Project>)     => api<Project>('/projects', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: number, d: Partial<Project>) => api<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (id: number)              => api<void>(`/projects/${id}`, { method: 'DELETE' }),
  show:   (id: number)              => api<Project & { tasks: Task[] }>(`/projects/${id}`),
};

export interface TaskFilters { project_id?: number; status?: string; priority?: string; user_id?: number; sort?: string; dir?: string; }
export const tasksApi = {
  list: (f: TaskFilters = {}) => {
    const q = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v !== undefined && v !== '' && v !== 0 && q.set(k, String(v)));
    return api<Task[]>(`/tasks${q.toString() ? '?' + q : ''}`);
  },
  create: (d: Omit<Partial<Task>, 'users'> & { user_ids?: number[] }) =>
    api<Task>('/tasks', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: number, d: Omit<Partial<Task>, 'users'> & { user_ids?: number[] }) =>
    api<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (id: number) => api<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

export const commentsApi = {
  list:   (taskId: number)                   => api<Comment[]>(`/tasks/${taskId}/comments`),
  create: (taskId: number, content: string)  => api<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  remove: (id: number)                       => api<void>(`/comments/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  list:   ()                => api<User[]>('/users'),
  create: (d: Partial<User> & { password: string; password_confirmation: string }) =>
    api<User>('/users', { method: 'POST', body: JSON.stringify(d) }),
  resetPassword: (id: number, password: string, password_confirmation: string) =>
    api<{ message: string }>(`/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ password, password_confirmation }) }),
  remove: (id: number)      => api<void>(`/users/${id}`, { method: 'DELETE' }),
};
