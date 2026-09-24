import React, { useEffect, useState } from 'react';
import { Task, TaskPriority, TaskStatus, User } from '../types.js';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    assignedTo: string | null;
  }) => Promise<void>;
  editingTask: Task | null;
  users: User[];
  isSubmitting: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  users,
  isSubmitting,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Synchronize form values whenever modal opens or editingTask changes
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'Medium');
      setStatus(editingTask.status || 'Todo');
      setDueDate(editingTask.dueDate || '');
      setAssignedTo(editingTask.assignedTo ? editingTask.assignedTo._id : '');
    } else {
      // Default new task values
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('Todo');
      // Default due date: 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split('T')[0]);
      setAssignedTo('');
    }
    setError(null);
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
        assignedTo: assignedTo || null,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow border-0">
          {/* Modal Header */}
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className={`bi ${editingTask ? 'bi-pencil-square text-primary' : 'bi-plus-circle text-success'}`}></i>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-octagon-fill"></i>
                  <div>{error}</div>
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Task Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Design responsive navbar with Bootstrap"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                  autoFocus
                />
                <div className="form-text small">Concise summary of what needs to be done.</div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Provide additional details, requirements, or steps to complete..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                {/* Priority */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  >
                    <option value="Low">🟢 Low Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="High">🔴 High Priority</option>
                  </select>
                </div>

                {/* Status */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  >
                    <option value="Todo">⚪ To Do</option>
                    <option value="In Progress">🔵 In Progress</option>
                    <option value="Completed">🟢 Completed</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Assigned To User */}
              <div className="mb-2">
                <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
                  <span>Assign To Team Member</span>
                  <span className="small text-muted fw-normal">{users.length} registered users</span>
                </label>
                <select
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">-- Unassigned --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      👤 {u.name} ({u.role || 'Member'} - {u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
