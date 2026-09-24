import { Request, Response } from 'express';
import { dataStore } from '../dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { notifyClients } from '../socket.js';

/**
 * Get all tasks with optional search, status, and priority filtering
 * GET /api/tasks?status=Todo&priority=High&search=auth
 */
export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const { status, priority, search } = req.query;

    const tasks = await dataStore.getAllTasks(
      search ? String(search) : undefined,
      status ? String(status) : undefined,
      priority ? String(priority) : undefined
    );

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks',
      error: error.message,
    });
  }
}

/**
 * Get a single task by ID
 * GET /api/tasks/:id
 */
export async function getTaskById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const task = await dataStore.getTaskById(id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message,
    });
  }
}

/**
 * Create a new task
 * POST /api/tasks
 */
export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, description, priority, status, dueDate, assignedTo } = req.body;

    // 1. Basic validation
    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
      return;
    }

    // 2. Identify assignee details if provided
    let assignedUserData = null;
    if (assignedTo) {
      const user = await dataStore.findUserById(assignedTo);
      if (user) {
        assignedUserData = {
          _id: (user._id as any).toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    }

    // 3. Creator information from JWT auth
    const createdByData = {
      _id: req.user!._id,
      name: req.user!.name,
      email: req.user!.email,
    };

    // 4. Save to database / store
    const newTask = await dataStore.createTask({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      status: status || 'Todo',
      dueDate: dueDate || '',
      assignedTo: assignedUserData,
      createdBy: createdByData,
    });

    // 5. Emit real-time Socket.IO event to all connected clients!
    notifyClients('task:created', {
      task: newTask,
      actionBy: req.user!.name,
      timestamp: new Date().toISOString(),
      message: `${req.user!.name} created new task: "${newTask.title}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task: newTask,
    });
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task.',
      error: error.message,
    });
  }
}

/**
 * Update an existing task
 * PUT /api/tasks/:id
 */
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assignedTo } = req.body;

    const existingTask = await dataStore.getTaskById(id);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Resolve assigned user if updated
    let assignedUserData = existingTask.assignedTo;
    if (assignedTo !== undefined) {
      if (!assignedTo) {
        assignedUserData = null;
      } else {
        const user = await dataStore.findUserById(assignedTo);
        if (user) {
          assignedUserData = {
            _id: (user._id as any).toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
      }
    }

    const updatePayload: any = {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate }),
      assignedTo: assignedUserData,
    };

    const updatedTask = await dataStore.updateTask(id, updatePayload);

    // Emit real-time Socket.IO event
    notifyClients('task:updated', {
      task: updatedTask,
      actionBy: req.user!.name,
      timestamp: new Date().toISOString(),
      message: `${req.user!.name} updated task: "${updatedTask.title}" (${updatedTask.status})`,
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      task: updatedTask,
    });
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task.',
      error: error.message,
    });
  }
}

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existingTask = await dataStore.getTaskById(id);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const success = await dataStore.deleteTask(id);
    if (!success) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete task',
      });
      return;
    }

    // Emit real-time Socket.IO event
    notifyClients('task:deleted', {
      taskId: id,
      title: existingTask.title,
      actionBy: req.user!.name,
      timestamp: new Date().toISOString(),
      message: `${req.user!.name} deleted task: "${existingTask.title}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully!',
    });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task.',
      error: error.message,
    });
  }
}
