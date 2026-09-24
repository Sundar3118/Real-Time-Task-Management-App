import React, { useState } from 'react';
import { api } from '../services/api.js';
import { User } from '../types.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Frontend Developer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (userEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(userEmail, 'student123');
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        onAuthSuccess(res.user);
        onClose();
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        const res = await api.register(name.trim(), email.trim(), password, role);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              {mode === 'login' ? '🔑 Log In to TaskFlow' : '📝 Create Student Account'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Quick Demo Login Box */}
            <div className="card bg-primary-subtle border-primary-subtle mb-3">
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold text-primary">
                    <i className="bi bi-lightning-charge-fill me-1"></i> Quick 1-Click Demo Logins:
                  </span>
                  <span className="badge bg-primary text-white">Student Demo</span>
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm text-start d-flex justify-content-between align-items-center bg-white"
                    onClick={() => handleQuickLogin('alex@university.edu')}
                    disabled={loading}
                  >
                    <span>👤 <strong>Alex Rivera</strong> (alex@university.edu)</span>
                    <span className="badge bg-secondary">Frontend</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm text-start d-flex justify-content-between align-items-center bg-white"
                    onClick={() => handleQuickLogin('priya@university.edu')}
                    disabled={loading}
                  >
                    <span>👩‍💻 <strong>Priya Sharma</strong> (priya@university.edu)</span>
                    <span className="badge bg-secondary">Backend</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm text-start d-flex justify-content-between align-items-center bg-white"
                    onClick={() => handleQuickLogin('sam@university.edu')}
                    disabled={loading}
                  >
                    <span>👨‍💼 <strong>Sam Taylor</strong> (sam@university.edu)</span>
                    <span className="badge bg-secondary">Lead</span>
                  </button>
                </div>
                <div className="text-muted text-center mt-2" style={{ fontSize: '0.75rem' }}>
                  Default password for demo accounts: <code>student123</code>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1 my-0" />
              <span className="px-2 text-muted small">OR ENTER CREDENTIALS</span>
              <hr className="flex-grow-1 my-0" />
            </div>

            {/* Mode Switcher Tabs */}
            <ul className="nav nav-pills nav-fill mb-3 bg-light p-1 rounded">
              <li className="nav-item">
                <button
                  className={`nav-link py-1 small fw-semibold ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  type="button"
                >
                  Log In
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 small fw-semibold ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  type="button"
                >
                  Register New User
                </button>
              </li>
            </ul>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Jordan Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Role / Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Mobile Developer, QA Tester"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 mt-4"
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
