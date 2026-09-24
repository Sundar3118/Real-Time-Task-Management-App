export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RealtimeNotification {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'info';
  message: string;
  actionBy: string;
  taskTitle?: string;
  timestamp: string;
  read?: boolean;
}

export interface DatabaseStatus {
  type: string;
  connected: boolean;
  usingFallback: boolean;
  message: string;
}
