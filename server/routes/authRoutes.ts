import { Router } from 'express';
import { getAllUsers, getMe, login, register } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers);

// Protected route
router.get('/me', authMiddleware as any, getMe);

export default router;
