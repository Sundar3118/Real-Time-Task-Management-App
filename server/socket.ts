import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

/**
 * Initialize Socket.IO with HTTP server
 */
export function initSocket(server: http.Server): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ [Socket.IO] New client connected: ${socket.id}`);

    // Client sends user identity upon connecting (optional)
    socket.on('user:join', (userData) => {
      console.log(`👤 [Socket.IO] User registered on socket: ${userData?.name || 'Anonymous'} (${socket.id})`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
}

/**
 * Get active Socket.IO server instance
 */
export function getIO(): SocketIOServer | null {
  return ioInstance;
}

/**
 * Helper to broadcast task events to all connected clients
 */
export function notifyClients(event: 'task:created' | 'task:updated' | 'task:deleted', data: any) {
  if (ioInstance) {
    console.log(`📢 [Socket.IO Broadcast] Emitting event "${event}":`, data.message || '');
    ioInstance.emit(event, data);
  } else {
    console.warn('⚠️ [Socket.IO] ioInstance not ready yet for event:', event);
  }
}
