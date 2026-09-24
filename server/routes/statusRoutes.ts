import { Request, Response, Router } from 'express';
import { dbStatus } from '../config/db.js';
import { dataStore } from '../dataStore.js';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const users = await dataStore.getAllUsers();
  const tasks = await dataStore.getAllTasks();

  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.connected ? 'MongoDB (Mongoose)' : 'Local In-Memory Store',
      connected: dbStatus.connected,
      usingFallback: dbStatus.usingFallback,
      message: dbStatus.message,
    },
    counts: {
      users: users.length,
      tasks: tasks.length,
    },
  });
});

export default router;
