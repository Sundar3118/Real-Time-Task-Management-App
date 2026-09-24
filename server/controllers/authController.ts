import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dataStore } from '../dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'student_task_manager_secret_key_2026';

// Helper to generate JWT token (valid for 7 days)
function generateToken(user: { _id: string; name: string; email: string; role?: string }) {
  return jwt.sign(
    {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    // 1. Simple validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    // 2. Check if user already exists
    const existingUser = await dataStore.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const newUser = await dataStore.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role ? role.trim() : 'Team Member',
    });

    const userObj = {
      _id: (newUser._id as any).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    // 5. Generate token
    const token = generateToken(userObj);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: userObj,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
}

/**
 * Log in an existing user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please enter both email and password.',
      });
      return;
    }

    // 2. Check user existence
    const user = await dataStore.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const userObj = {
      _id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 4. Generate token
    const token = generateToken(userObj);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: userObj,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await dataStore.findUserById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        _id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
}

/**
 * Get all users (to assign tasks)
 * GET /api/auth/users
 */
export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await dataStore.getAllUsers();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users list',
      error: error.message,
    });
  }
}
