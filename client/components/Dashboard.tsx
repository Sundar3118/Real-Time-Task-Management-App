import React, { useEffect, useMemo, useState } from 'react';
import { api, authStorage } from '../services/api.js';
import { initClientSocket } from '../services/socket.js';
import { DatabaseStatus, RealtimeNotification, Task, TaskPriority, TaskStatus, User } from '../types.js';
import { ArchitectureModal } from './ArchitectureModal.js';
import { AuthModal } from './AuthModal.js';
import { Navbar } from './Navbar.js';
import { NotificationToast } from './NotificationToast.js';
import { StatsCards } from './StatsCards.js';
import { TaskCard } from './TaskCard.js';
import { TaskFilterBar } from './TaskFilterBar.js';
import { TaskModal } from './TaskModal.js';

export const Dashboard: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(authStorage.getUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);

  // Modals & UI State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Socket.IO & Notification State
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);

  // Server & DB Status
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Helper to add toast notification
  const addNotification = (
    type: 'created' | 'updated' | 'deleted' | 'info',
    message: string,
    actionBy: string,
    taskTitle?: string
  ) => {
    const newNotification: RealtimeNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      message,
      actionBy,
      taskTitle,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Fetch all tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
      });
      setTasks(res.tasks || []);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch registered users (for assignment dropdown)
  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch Database health info
  const fetchHealth = async () => {
    try {
      const res = await api.getStatus();
      setDbStatus(res.database);
    } catch (err) {
      console.error('Failed to fetch server status:', err);
    }
  };

  // Initialize on mount
  useEffect(() => {
    // Check if authenticated user token is valid
    if (authStorage.getToken()) {
      api
        .getMe()
        .then((res) => {
          setCurrentUser(res.user);
          authStorage.setUser(res.user);
        })
        .catch(() => {
          // If token expired, clear
          authStorage.clear();
          setCurrentUser(null);
        });
    }

    fetchUsers();
    fetchHealth();
  }, []);

  // Fetch tasks whenever filters change
  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, searchQuery]);

  // Connect Socket.IO client and listen to live events
  useEffect(() => {
    const socket = initClientSocket({
      onStatusChange: (connected, id) => {
        setSocketConnected(connected);
        if (id) setSocketId(id);
      },
      onTaskCreated: (data) => {
        // Real-time notification: User A created a task -> User B sees it!
        addNotification('created', data.message, data.actionBy, data.task.title);

        // Instantly add task to state if it isn't already present
        setTasks((prev) => {
          const exists = prev.some((t) => t._id === data.task._id);
          if (exists) return prev;
          return [data.task, ...prev];
        });
      },
      onTaskUpdated: (data) => {
        addNotification('updated', data.message, data.actionBy, data.task.title);

        // Update task in state without needing manual reload
        setTasks((prev) =>
          prev.map((t) => (t._id === data.task._id ? data.task : t))
        );
      },
      onTaskDeleted: (data) => {
        addNotification('deleted', data.message, data.actionBy, data.title);

        // Remove deleted task from state
        setTasks((prev) => prev.filter((t) => t._id !== data.taskId));
      },
    });

    return () => {
      // Keep socket open
    };
  }, []);

  // Switch demo user
  const handleSwitchUser = async (email: string) => {
    try {
      const res = await api.login(email, 'student123');
      setCurrentUser(res.user);
      addNotification('info', `Switched active user to ${res.user.name}`, 'System');
      fetchUsers();
    } catch (err: any) {
      alert(`Could not switch user: ${err.message}`);
    }
  };

  // Logout
  const handleLogout = () => {
    authStorage.clear();
    setCurrentUser(null);
    addNotification('info', 'Logged out successfully', 'System');
  };

  // Filter tasks in UI by "Assigned to Me" if active
  const filteredTasks = useMemo(() => {
    if (!assignedToMeOnly || !currentUser) {
      return tasks;
    }
    return tasks.filter((t) => t.assignedTo && t.assignedTo._id === currentUser._id);
  }, [tasks, assignedToMeOnly, currentUser]);

  // Create or Update task handler
  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    assignedTo: string | null;
  }) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      throw new Error('Please log in before creating or editing tasks.');
    }

    setIsSubmittingTask(true);
    try {
      if (editingTask) {
        await api.updateTask(editingTask._id, taskData);
      } else {
        await api.createTask(taskData);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      // fetchTasks will also be confirmed via socket, but refetching guarantees consistency
      await fetchTasks();
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Quick status change from card dropdown
  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      await api.updateTask(taskId, { status: newStatus });
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Open edit modal
  const handleOpenEdit = (task: Task) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Delete task confirmation and action
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      await api.deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light text-dark">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        socketConnected={socketConnected}
        socketId={socketId}
        dbStatus={dbStatus}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        notificationCount={notifications.length}
        onToggleNotificationHistory={() => setShowNotificationHistory((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="container-fluid px-3 px-lg-4 py-4 flex-grow-1">
        {/* Welcome & Multi-user instructions banner */}
        <div className="card border-0 shadow-sm mb-4 bg-white">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div>
                <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                  <span>Student Task Dashboard</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary fs-7">
                    Full-Stack MERN
                  </span>
                </h4>
                <p className="text-muted small mb-0">
                  {currentUser ? (
                    <>
                      Welcome back, <strong>{currentUser.name}</strong> ({currentUser.role || 'Student'})!
                      Changes you make broadcast via <strong>Socket.IO</strong> to all other connected users in real time.
                    </>
                  ) : (
                    <>
                      You are in guest preview mode. <a href="#" onClick={(e) => { e.preventDefault(); setIsAuthOpen(true); }} className="text-primary fw-semibold">Log in or select a demo student</a> to create, assign, and update tasks!
                    </>
                  )}
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => setIsArchitectureOpen(true)}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                >
                  <i className="bi bi-info-circle"></i>
                  <span>How Real-Time Works</span>
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm px-3"
                >
                  <i className="bi bi-plus-lg"></i>
                  <span>New Task</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatsCards
          tasks={tasks}
          activeStatus={statusFilter}
          onSelectStatus={(status) => setStatusFilter(status)}
          activePriority={priorityFilter}
          onSelectPriority={(priority) => setPriorityFilter(priority)}
        />

        {/* Search & Filter Toolbar */}
        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          assignedToMeOnly={assignedToMeOnly}
          onToggleAssignedToMe={() => setAssignedToMeOnly((prev) => !prev)}
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          isLoggedIn={!!currentUser}
        />

        {/* Task Cards Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading tasks...</span>
            </div>
            <p className="mt-2 text-muted small">Loading tasks from Express API...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center bg-white my-3">
            <div className="py-4">
              <div className="rounded-circle p-3 bg-light d-inline-flex text-muted mb-3">
                <i className="bi bi-inbox fs-1"></i>
              </div>
              <h5 className="fw-bold">No tasks found</h5>
              <p className="text-muted small mb-3">
                {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || assignedToMeOnly
                  ? 'No tasks match your current filter and search criteria.'
                  : 'Get started by creating your first task!'}
              </p>
              <div className="d-flex justify-content-center gap-2">
                {(searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || assignedToMeOnly) && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                      setPriorityFilter('All');
                      setAssignedToMeOnly(false);
                    }}
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                >
                  <i className="bi bi-plus-lg me-1"></i> Create Task
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredTasks.map((task) => (
              <div key={task._id} className="col-12 col-md-6 col-xl-4">
                <TaskCard
                  task={task}
                  currentUser={currentUser}
                  onEdit={handleOpenEdit}
                  onDelete={(id, title) => setDeleteTarget({ id, title })}
                  onQuickStatusChange={handleQuickStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <span>
              <strong>Real-Time Task Management App</strong> • Built with React, Bootstrap, Express, MongoDB & Socket.IO
            </span>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-light text-dark border">
                <i className="bi bi-hdd-network me-1"></i>
                {socketConnected ? 'WebSocket Live' : 'Connecting'}
              </span>
              <span className="badge bg-light text-dark border">
                <i className="bi bi-database me-1"></i>
                {dbStatus?.type || 'MongoDB'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        users={users}
        isSubmitting={isSubmittingTask}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          fetchUsers();
          addNotification('info', `Welcome, ${user.name}!`, 'Auth');
        }}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        dbStatus={dbStatus}
      />

      {/* Real-time Toasts & History Drawer */}
      <NotificationToast
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
        showHistory={showNotificationHistory}
        onCloseHistory={() => setShowNotificationHistory(false)}
        onClearHistory={() => setNotifications([])}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-danger text-white py-2">
                <h6 className="modal-title fw-bold">Confirm Deletion</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setDeleteTarget(null)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <p className="small mb-1">Are you sure you want to delete this task?</p>
                <div className="fw-semibold text-danger small p-2 bg-light rounded border mb-2">
                  "{deleteTarget.title}"
                </div>
                <small className="text-muted">This will remove the task for all users in real time.</small>
              </div>
              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={confirmDelete}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
