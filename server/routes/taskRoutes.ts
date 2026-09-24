import { Router } from 'express';
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public read routes (tasks can be viewed)
router.get('/', getTasks);
router.get('/:id', getTaskById);

// Protected routes (requires login)
router.post('/', authMiddleware as any, createTask as any);
router.put('/:id', authMiddleware as any, updateTask as any);
router.delete('/:id', authMiddleware as any, deleteTask as any);

export default router;
