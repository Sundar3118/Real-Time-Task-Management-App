import { DatabaseStatus, Task, User } from '../types.js';

const TOKEN_KEY = 'mern_task_manager_token';
const USER_KEY = 'mern_task_manager_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

/**
 * Standard fetch helper with automatic Authorization header
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth endpoints
  async register(name: string, email: string, password: string, role?: string) {
    const res = await request<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      }
    );
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async login(email: string, password: string) {
    const res = await request<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async getMe() {
    return await request<{ success: boolean; user: User }>('/api/auth/me');
  },

  async getUsers() {
    return await request<{ success: boolean; users: User[] }>('/api/auth/users');
  },

  // Task endpoints
  async getTasks(params?: { status?: string; priority?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params?.search && params.search.trim()) query.append('search', params.search.trim());

    const qs = query.toString();
    const endpoint = `/api/tasks${qs ? `?${qs}` : ''}`;
    return await request<{ success: boolean; count: number; tasks: Task[] }>(endpoint);
  },

  async getTaskById(id: string) {
    return await request<{ success: boolean; task: Task }>(`/api/tasks/${id}`);
  },

  async createTask(taskData: {
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate: string;
    assignedTo: string | null;
  }) {
    return await request<{ success: boolean; message: string; task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(
    id: string,
    taskData: Partial<{
      title: string;
      description: string;
      priority: string;
      status: string;
      dueDate: string;
      assignedTo: string | null;
    }>
  ) {
    return await request<{ success: boolean; message: string; task: Task }>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async deleteTask(id: string) {
    return await request<{ success: boolean; message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Status & Health endpoint
  async getStatus() {
    return await request<{
      status: string;
      timestamp: string;
      database: DatabaseStatus;
      counts: { users: number; tasks: number };
    }>('/api/status/health');
  },
};
