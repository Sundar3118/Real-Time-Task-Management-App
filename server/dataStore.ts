import bcrypt from 'bcryptjs';
import { dbStatus } from './config/db.js';
import { TaskModel } from './models/Task.js';
import { UserModel } from './models/User.js';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

export interface TaskDoc {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Completed';
  dueDate: string;
  assignedTo: {
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

// In-memory store used when MongoDB is not connected
class InMemoryStore {
  private users: UserDoc[] = [];
  private tasks: TaskDoc[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('student123', salt);

    const userAlex: UserDoc = {
      _id: 'user_alex_101',
      name: 'Alex Rivera',
      email: 'alex@university.edu',
      password: hashedPassword,
      role: 'Frontend Developer',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    };

    const userPriya: UserDoc = {
      _id: 'user_priya_102',
      name: 'Priya Sharma',
      email: 'priya@university.edu',
      password: hashedPassword,
      role: 'Backend Developer',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    };

    const userSam: UserDoc = {
      _id: 'user_sam_103',
      name: 'Sam Taylor',
      email: 'sam@university.edu',
      password: hashedPassword,
      role: 'Team Lead',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    };

    this.users = [userAlex, userPriya, userSam];

    const today = new Date();
    const formatDate = (daysAhead: number) => {
      const d = new Date();
      d.setDate(today.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    this.tasks = [
      {
        _id: 'task_001',
        title: 'Design Dashboard UI using Bootstrap',
        description: 'Create responsive task cards, filter buttons, and navigation bar using Bootstrap 5 classes.',
        priority: 'High',
        status: 'In Progress',
        dueDate: formatDate(2),
        assignedTo: {
          _id: userAlex._id,
          name: userAlex.name,
          email: userAlex.email,
          role: userAlex.role,
        },
        createdBy: {
          _id: userSam._id,
          name: userSam.name,
          email: userSam.email,
        },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        _id: 'task_002',
        title: 'Build Express REST API & Mongoose Models',
        description: 'Define User and Task schemas in Mongoose, setup CRUD endpoints, and implement JWT auth.',
        priority: 'High',
        status: 'Completed',
        dueDate: formatDate(-1),
        assignedTo: {
          _id: userPriya._id,
          name: userPriya.name,
          email: userPriya.email,
          role: userPriya.role,
        },
        createdBy: {
          _id: userSam._id,
          name: userSam.name,
          email: userSam.email,
        },
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: 'task_003',
        title: 'Connect Socket.IO for Real-Time Updates',
        description: 'Emit "task:created" and "task:updated" events from Node.js so clients receive live notifications without reloading.',
        priority: 'Medium',
        status: 'Todo',
        dueDate: formatDate(3),
        assignedTo: {
          _id: userAlex._id,
          name: userAlex.name,
          email: userAlex.email,
          role: userAlex.role,
        },
        createdBy: {
          _id: userPriya._id,
          name: userPriya.name,
          email: userPriya.email,
        },
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        _id: 'task_004',
        title: 'Write Full Project Documentation & Diagrams',
        description: 'Document system data flow (React -> Express -> MongoDB, React -> Socket.IO -> Clients) and setup guide.',
        priority: 'Low',
        status: 'Todo',
        dueDate: formatDate(5),
        assignedTo: {
          _id: userSam._id,
          name: userSam.name,
          email: userSam.email,
          role: userSam.role,
        },
        createdBy: {
          _id: userSam._id,
          name: userSam.name,
          email: userSam.email,
        },
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];
  }

  // User operations
  async findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string) {
    return this.users.find((u) => u._id === id);
  }

  async getAllUsers() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  async createUser(userData: { name: string; email: string; password: string; role?: string }) {
    const newUser: UserDoc = {
      _id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'Team Member',
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Task operations
  async getAllTasks(search?: string, status?: string, priority?: string) {
    let result = [...this.tasks];

    if (status && status !== 'All') {
      result = result.filter((t) => t.status === status);
    }

    if (priority && priority !== 'All') {
      result = result.filter((t) => t.priority === priority);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.assignedTo && t.assignedTo.name.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTaskById(id: string) {
    return this.tasks.find((t) => t._id === id);
  }

  async createTask(taskData: any) {
    const newTask: TaskDoc = {
      _id: `task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'Todo',
      dueDate: taskData.dueDate || '',
      assignedTo: taskData.assignedTo || null,
      createdBy: taskData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  async updateTask(id: string, updateData: any) {
    const index = this.tasks.findIndex((t) => t._id === id);
    if (index === -1) return null;

    const existing = this.tasks[index];
    const updated: TaskDoc = {
      ...existing,
      ...updateData,
      assignedTo: updateData.assignedTo !== undefined ? updateData.assignedTo : existing.assignedTo,
      updatedAt: new Date().toISOString(),
    };
    this.tasks[index] = updated;
    return updated;
  }

  async deleteTask(id: string) {
    const index = this.tasks.findIndex((t) => t._id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }
}

export const inMemoryStore = new InMemoryStore();

/**
 * Unified data access service.
 * If MongoDB is connected, queries Mongoose UserModel & TaskModel.
 * If not connected, utilizes inMemoryStore.
 */
export const dataStore = {
  async findUserByEmail(email: string) {
    if (dbStatus.connected) {
      return await UserModel.findOne({ email: email.toLowerCase() });
    }
    return inMemoryStore.findUserByEmail(email);
  },

  async findUserById(id: string) {
    if (dbStatus.connected) {
      return await UserModel.findById(id).select('-password');
    }
    return inMemoryStore.findUserById(id);
  },

  async getAllUsers() {
    if (dbStatus.connected) {
      return await UserModel.find().select('-password').sort({ name: 1 });
    }
    return inMemoryStore.getAllUsers();
  },

  async createUser(userData: { name: string; email: string; password: string; role?: string }) {
    if (dbStatus.connected) {
      const user = new UserModel(userData);
      return await user.save();
    }
    return inMemoryStore.createUser(userData);
  },

  async getAllTasks(search?: string, status?: string, priority?: string) {
    if (dbStatus.connected) {
      const query: any = {};
      if (status && status !== 'All') {
        query.status = status;
      }
      if (priority && priority !== 'All') {
        query.priority = priority;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: regex }, { description: regex }];
      }
      const tasks = await TaskModel.find(query)
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      return tasks;
    }
    return inMemoryStore.getAllTasks(search, status, priority);
  },

  async getTaskById(id: string) {
    if (dbStatus.connected) {
      return await TaskModel.findById(id)
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email');
    }
    return inMemoryStore.getTaskById(id);
  },

  async createTask(taskData: any) {
    if (dbStatus.connected) {
      const task = new TaskModel(taskData);
      const saved = await task.save();
      return await TaskModel.findById(saved._id)
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email');
    }
    return inMemoryStore.createTask(taskData);
  },

  async updateTask(id: string, updateData: any) {
    if (dbStatus.connected) {
      const updated = await TaskModel.findByIdAndUpdate(id, updateData, { new: true })
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email');
      return updated;
    }
    return inMemoryStore.updateTask(id, updateData);
  },

  async deleteTask(id: string) {
    if (dbStatus.connected) {
      const result = await TaskModel.findByIdAndDelete(id);
      return !!result;
    }
    return inMemoryStore.deleteTask(id);
  },
};
