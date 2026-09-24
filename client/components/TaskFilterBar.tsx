import React from 'react';
import { TaskPriority, TaskStatus } from '../types.js';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  assignedToMeOnly: boolean;
  onToggleAssignedToMe: () => void;
  onOpenCreateModal: () => void;
  isLoggedIn: boolean;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  assignedToMeOnly,
  onToggleAssignedToMe,
  onOpenCreateModal,
  isLoggedIn,
}) => {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-3">
        <div className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search tasks by title, description, or assignee..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => onSearchChange('')}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="col-12 col-md-4 d-flex justify-content-center">
            <div className="btn-group w-100" role="group" aria-label="Status filter">
              {(['All', 'Todo', 'In Progress', 'Completed'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`btn btn-sm ${
                    statusFilter === status
                      ? 'btn-primary active fw-semibold'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => onStatusFilterChange(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Select & Assigned to Me & Create Button */}
          <div className="col-12 col-md-4 d-flex gap-2 justify-content-md-end align-items-center">
            {/* Priority filter */}
            <select
              className="form-select form-select-sm w-auto"
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              title="Filter by Priority"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Assigned To Me Toggle (if logged in) */}
            {isLoggedIn && (
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-1 ${
                  assignedToMeOnly ? 'btn-secondary text-white' : 'btn-outline-secondary'
                }`}
                onClick={onToggleAssignedToMe}
                title="Filter tasks assigned to me"
              >
                <i className="bi bi-person"></i>
                <span className="d-none d-xl-inline">My Tasks</span>
              </button>
            )}

            {/* Create Task Button */}
            <button
              onClick={onOpenCreateModal}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1 text-nowrap px-3 shadow-sm"
            >
              <i className="bi bi-plus-lg"></i>
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
