import React from 'react';
import { DatabaseStatus, User } from '../types.js';

interface NavbarProps {
  currentUser: User | null;
  socketConnected: boolean;
  socketId?: string;
  dbStatus?: DatabaseStatus | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchUser: (email: string) => void;
  onOpenArchitecture: () => void;
  notificationCount: number;
  onToggleNotificationHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  socketConnected,
  socketId,
  dbStatus,
  onOpenAuth,
  onLogout,
  onSwitchUser,
  onOpenArchitecture,
  notificationCount,
  onToggleNotificationHistory,
}) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container-fluid px-3 px-lg-4">
        {/* Brand */}
        <a className="navbar-brand d-flex align-items-center gap-2 mb-0 fw-bold" href="#">
          <span className="p-1 bg-primary text-white rounded-2 d-inline-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
            <i className="bi bi-kanban-fill fs-5"></i>
          </span>
          <span>TaskFlow <span className="badge bg-primary text-white fs-6 fw-normal ms-1">MERN</span></span>
        </a>

        {/* Real-time Socket status indicator */}
        <div className="d-flex align-items-center gap-2 my-2 my-lg-0">
          {socketConnected ? (
            <span
              className="badge bg-success-subtle text-success border border-success d-inline-flex align-items-center gap-1 py-1 px-2"
              title={`Socket.IO Connected (ID: ${socketId || 'active'})`}
            >
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '0.5rem', height: '0.5rem' }}></span>
              <i className="bi bi-broadcast"></i> Socket.IO Live
            </span>
          ) : (
            <span className="badge bg-secondary-subtle text-secondary border border-secondary d-inline-flex align-items-center gap-1 py-1 px-2">
              <i className="bi bi-broadcast-pin"></i> Socket.IO Connecting...
            </span>
          )}

          {/* Database indicator */}
          <span
            className={`badge d-none d-md-inline-flex align-items-center gap-1 py-1 px-2 ${
              dbStatus?.connected
                ? 'bg-success-subtle text-success border border-success'
                : 'bg-info-subtle text-info-emphasis border border-info'
            }`}
            title={dbStatus?.message || 'Database Status'}
          >
            <i className="bi bi-database-check"></i>
            {dbStatus?.connected ? 'MongoDB Active' : 'Store: Ready'}
          </span>
        </div>

        {/* Navigation Items & User Controls */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Architecture & Flow Guide Button */}
          <button
            onClick={onOpenArchitecture}
            className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
            title="Learn how React, Express, MongoDB, and Socket.IO communicate"
          >
            <i className="bi bi-diagram-3"></i>
            <span className="d-none d-sm-inline">Architecture Guide</span>
          </button>

          {/* Notification History Toggle */}
          <button
            onClick={onToggleNotificationHistory}
            className="btn btn-outline-light btn-sm position-relative d-flex align-items-center gap-1"
            title="Real-Time Socket Event Log"
          >
            <i className="bi bi-bell"></i>
            {notificationCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notificationCount}
                <span className="visually-hidden">unread notifications</span>
              </span>
            )}
          </button>

          {currentUser ? (
            <div className="d-flex align-items-center gap-2">
              {/* Quick User Switcher dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-secondary dropdown-toggle d-flex align-items-center gap-1"
                  type="button"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="d-none d-md-inline fw-semibold">{currentUser.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userMenuButton">
                  <li className="dropdown-header">
                    Logged in as <strong>{currentUser.name}</strong>
                    <div className="small text-muted">{currentUser.role || 'Team Member'}</div>
                    <div className="small text-muted">{currentUser.email}</div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li className="dropdown-header text-uppercase fs-7 text-primary">
                    <i className="bi bi-people me-1"></i> Quick Switch Demo User:
                  </li>
                  <li>
                    <button
                      className={`dropdown-item d-flex justify-content-between align-items-center ${
                        currentUser.email === 'alex@university.edu' ? 'active' : ''
                      }`}
                      onClick={() => onSwitchUser('alex@university.edu')}
                    >
                      <span>Alex Rivera</span>
                      <small className="badge bg-light text-dark">Frontend</small>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item d-flex justify-content-between align-items-center ${
                        currentUser.email === 'priya@university.edu' ? 'active' : ''
                      }`}
                      onClick={() => onSwitchUser('priya@university.edu')}
                    >
                      <span>Priya Sharma</span>
                      <small className="badge bg-light text-dark">Backend</small>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item d-flex justify-content-between align-items-center ${
                        currentUser.email === 'sam@university.edu' ? 'active' : ''
                      }`}
                      onClick={() => onSwitchUser('sam@university.edu')}
                    >
                      <span>Sam Taylor</span>
                      <small className="badge bg-light text-dark">Lead</small>
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={onLogout}>
                      <i className="bi bi-box-arrow-right"></i> Log Out
                    </button>
                  </li>
                </ul>
              </div>

              <button onClick={onLogout} className="btn btn-outline-danger btn-sm d-none d-sm-inline-flex" title="Log Out">
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
              <i className="bi bi-box-arrow-in-right"></i> Log In / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
