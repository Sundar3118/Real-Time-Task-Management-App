import React from 'react';
import { Task, TaskPriority, TaskStatus, User } from '../types.js';

interface TaskCardProps {
  task: Task;
  currentUser: User | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, title: string) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onEdit,
  onDelete,
  onQuickStatusChange,
}) => {
  // Priority badge styling
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return <span className="badge bg-danger-subtle text-danger border border-danger">High</span>;
      case 'Medium':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning">Medium</span>;
      case 'Low':
        return <span className="badge bg-info-subtle text-info-emphasis border border-info">Low</span>;
      default:
        return <span className="badge bg-secondary">{priority}</span>;
    }
  };

  // Status badge styling
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="badge bg-success-subtle text-success border border-success"><i className="bi bi-check2-circle me-1"></i>Completed</span>;
      case 'In Progress':
        return <span className="badge bg-primary-subtle text-primary border border-primary"><i className="bi bi-arrow-repeat me-1"></i>In Progress</span>;
      case 'Todo':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary"><i className="bi bi-circle me-1"></i>To Do</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Check if due date is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === 'Completed') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Border highlight depending on status
  const getCardBorder = () => {
    if (task.status === 'Completed') return 'border-start border-success border-4';
    if (task.status === 'In Progress') return 'border-start border-primary border-4';
    return 'border-start border-secondary border-4';
  };

  return (
    <div className={`card h-100 border-0 shadow-sm ${getCardBorder()} bg-white`}>
      <div className="card-body p-3 d-flex flex-column">
        {/* Header: Priority & Status Badges */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            {getPriorityBadge(task.priority)}
            {getStatusBadge(task.status)}
          </div>

          {/* Quick status dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light border-0 py-0 px-1 text-muted"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="Change Status"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              <li className="dropdown-header small text-uppercase">Move Status</li>
              <li>
                <button
                  className={`dropdown-item small d-flex align-items-center gap-2 ${task.status === 'Todo' ? 'active' : ''}`}
                  onClick={() => onQuickStatusChange(task._id, 'Todo')}
                >
                  <i className="bi bi-circle"></i> To Do
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item small d-flex align-items-center gap-2 ${task.status === 'In Progress' ? 'active' : ''}`}
                  onClick={() => onQuickStatusChange(task._id, 'In Progress')}
                >
                  <i className="bi bi-arrow-repeat"></i> In Progress
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item small d-flex align-items-center gap-2 ${task.status === 'Completed' ? 'active' : ''}`}
                  onClick={() => onQuickStatusChange(task._id, 'Completed')}
                >
                  <i className="bi bi-check2-circle text-success"></i> Completed
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => onEdit(task)}>
                  <i className="bi bi-pencil"></i> Edit Task
                </button>
              </li>
              <li>
                <button className="dropdown-item small text-danger d-flex align-items-center gap-2" onClick={() => onDelete(task._id, task.title)}>
                  <i className="bi bi-trash"></i> Delete Task
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Task Title */}
        <h6 className={`card-title fw-bold mb-2 ${task.status === 'Completed' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
          {task.title}
        </h6>

        {/* Task Description */}
        <p className="card-text text-muted small flex-grow-1 mb-3" style={{ whiteSpace: 'pre-wrap' }}>
          {task.description || <em className="text-secondary">No description provided.</em>}
        </p>

        {/* Task Meta details */}
        <div className="pt-2 border-top mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2 small">
            {/* Due date */}
            <div className="d-flex align-items-center gap-1">
              <i className={`bi bi-calendar3 ${isOverdue() ? 'text-danger' : 'text-muted'}`}></i>
              {task.dueDate ? (
                <span className={isOverdue() ? 'text-danger fw-semibold' : 'text-secondary'}>
                  {task.dueDate} {isOverdue() && <span className="badge bg-danger ms-1">Overdue</span>}
                </span>
              ) : (
                <span className="text-muted">No due date</span>
              )}
            </div>

            {/* Assignee */}
            <div>
              {task.assignedTo ? (
                <span
                  className="badge bg-light text-dark border d-inline-flex align-items-center gap-1"
                  title={`Assigned to: ${task.assignedTo.name} (${task.assignedTo.email})`}
                >
                  <i className="bi bi-person-check-fill text-primary"></i>
                  <span>{task.assignedTo.name}</span>
                </span>
              ) : (
                <span className="badge bg-light text-muted border">Unassigned</span>
              )}
            </div>
          </div>

          {/* Footer: Creator & Actions */}
          <div className="d-flex justify-content-between align-items-center pt-1 small text-muted">
            <span className="small" title={`Created by ${task.createdBy?.name || 'Unknown'}`}>
              <i className="bi bi-pencil-square me-1"></i>
              by {task.createdBy?.name?.split(' ')[0] || 'Member'}
            </span>

            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary btn-sm py-0 px-2"
                onClick={() => onEdit(task)}
                title="Edit Task"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                className="btn btn-outline-danger btn-sm py-0 px-2"
                onClick={() => onDelete(task._id, task.title)}
                title="Delete Task"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
