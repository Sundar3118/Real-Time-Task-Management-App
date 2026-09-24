import { io, Socket } from 'socket.io-client';
import { Task } from '../types.js';

let socket: Socket | null = null;

export interface TaskSocketEvents {
  onTaskCreated?: (data: { task: Task; actionBy: string; message: string; timestamp: string }) => void;
  onTaskUpdated?: (data: { task: Task; actionBy: string; message: string; timestamp: string }) => void;
  onTaskDeleted?: (data: { taskId: string; title: string; actionBy: string; message: string; timestamp: string }) => void;
  onStatusChange?: (connected: boolean, socketId?: string) => void;
}

export function initClientSocket(handlers: TaskSocketEvents = {}): Socket {
  if (socket) {
    return socket;
  }

  // Connect to the same origin server
  socket = io({
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('⚡ [Socket.IO Client] Connected to server, ID:', socket?.id);
    handlers.onStatusChange?.(true, socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 [Socket.IO Client] Disconnected from server');
    handlers.onStatusChange?.(false);
  });

  socket.on('connect_error', (error) => {
    console.warn('⚠️ [Socket.IO Client] Connection error:', error.message);
    handlers.onStatusChange?.(false);
  });

  // Real-time task events emitted by server
  socket.on('task:created', (data) => {
    console.log('📬 [Socket.IO Event Received] task:created', data);
    handlers.onTaskCreated?.(data);
  });

  socket.on('task:updated', (data) => {
    console.log('📬 [Socket.IO Event Received] task:updated', data);
    handlers.onTaskUpdated?.(data);
  });

  socket.on('task:deleted', (data) => {
    console.log('📬 [Socket.IO Event Received] task:deleted', data);
    handlers.onTaskDeleted?.(data);
  });

  return socket;
}

export function getClientSocket(): Socket | null {
  return socket;
}

export function disconnectClientSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
