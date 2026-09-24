import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types.js';

interface StatsCardsProps {
  tasks: Task[];
  activeStatus: string;
  onSelectStatus: (status: string) => void;
  activePriority: string;
  onSelectPriority: (priority: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  tasks,
  activeStatus,
  onSelectStatus,
  activePriority,
  onSelectPriority,
}) => {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'Todo').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const highPriority = tasks.filter((t) => t.priority === 'High').length;

  return (
    <div className="row g-3 mb-4">
      {/* Total Tasks */}
      <div className="col-6 col-md-4 col-lg">
        <div
          className={`card h-100 border-0 shadow-sm cursor-pointer transition ${
            activeStatus === 'All' && activePriority === 'All' ? 'border-start border-primary border-4 bg-primary-subtle' : 'bg-white'
          }`}
          onClick={() => {
            onSelectStatus('All');
            onSelectPriority('All');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold">Total Tasks</div>
              <h3 className="mb-0 fw-bold">{total}</h3>
            </div>
            <div className="rounded-circle p-2 bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-list-task fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Todo */}
      <div className="col-6 col-md-4 col-lg">
        <div
          className={`card h-100 border-0 shadow-sm transition ${
            activeStatus === 'Todo' ? 'border-start border-secondary border-4 bg-secondary-subtle' : 'bg-white'
          }`}
          onClick={() => onSelectStatus('Todo')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold">To Do</div>
              <h3 className="mb-0 fw-bold text-secondary">{todo}</h3>
            </div>
            <div className="rounded-circle p-2 bg-secondary bg-opacity-10 text-secondary">
              <i className="bi bi-clock fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress */}
      <div className="col-6 col-md-4 col-lg">
        <div
          className={`card h-100 border-0 shadow-sm transition ${
            activeStatus === 'In Progress' ? 'border-start border-warning border-4 bg-warning-subtle' : 'bg-white'
          }`}
          onClick={() => onSelectStatus('In Progress')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold">In Progress</div>
              <h3 className="mb-0 fw-bold text-warning-emphasis">{inProgress}</h3>
            </div>
            <div className="rounded-circle p-2 bg-warning bg-opacity-10 text-warning-emphasis">
              <i className="bi bi-hourglass-split fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="col-6 col-md-4 col-lg">
        <div
          className={`card h-100 border-0 shadow-sm transition ${
            activeStatus === 'Completed' ? 'border-start border-success border-4 bg-success-subtle' : 'bg-white'
          }`}
          onClick={() => onSelectStatus('Completed')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold">Completed</div>
              <h3 className="mb-0 fw-bold text-success">{completed}</h3>
            </div>
            <div className="rounded-circle p-2 bg-success bg-opacity-10 text-success">
              <i className="bi bi-check2-circle fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority */}
      <div className="col-6 col-md-4 col-lg">
        <div
          className={`card h-100 border-0 shadow-sm transition ${
            activePriority === 'High' ? 'border-start border-danger border-4 bg-danger-subtle' : 'bg-white'
          }`}
          onClick={() => {
            onSelectPriority(activePriority === 'High' ? 'All' : 'High');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold">High Priority</div>
              <h3 className="mb-0 fw-bold text-danger">{highPriority}</h3>
            </div>
            <div className="rounded-circle p-2 bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-exclamation-triangle fs-4"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
