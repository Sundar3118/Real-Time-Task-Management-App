import React from 'react';
import { RealtimeNotification } from '../types.js';

interface NotificationToastProps {
  notifications: RealtimeNotification[];
  onDismiss: (id: string) => void;
  showHistory: boolean;
  onCloseHistory: () => void;
  onClearHistory: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
  showHistory,
  onCloseHistory,
  onClearHistory,
}) => {
  // Latest 4 active toast notifications
  const activeToasts = notifications.slice(0, 4);

  const getIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <i className="bi bi-plus-circle-fill text-success fs-5"></i>;
      case 'updated':
        return <i className="bi bi-arrow-repeat text-primary fs-5"></i>;
      case 'deleted':
        return <i className="bi bi-trash-fill text-danger fs-5"></i>;
      default:
        return <i className="bi bi-bell-fill text-info fs-5"></i>;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-success text-white';
      case 'updated':
        return 'bg-primary text-white';
      case 'deleted':
        return 'bg-danger text-white';
      default:
        return 'bg-info text-white';
    }
  };

  return (
    <>
      {/* Real-Time Floating Toasts (Bottom Right) */}
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1080, maxWidth: '380px' }}
      >
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className="toast show shadow-lg border-0 mb-2 bg-white"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ borderRadius: '10px', overflow: 'hidden' }}
          >
            <div className="toast-header d-flex justify-content-between align-items-center bg-light py-2 px-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className={`badge rounded-pill ${getBadgeClass(toast.type)} px-2 py-1`}>
                  <i className="bi bi-broadcast me-1"></i>
                  {toast.type.toUpperCase()}
                </span>
                <strong className="me-auto text-dark small">Socket.IO Alert</strong>
              </div>
              <div className="d-flex align-items-center gap-1">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </small>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  aria-label="Close"
                  onClick={() => onDismiss(toast.id)}
                ></button>
              </div>
            </div>
            <div className="toast-body d-flex align-items-start gap-2 py-2 px-3">
              <div className="mt-1">{getIcon(toast.type)}</div>
              <div className="flex-grow-1">
                <div className="fw-semibold text-dark small">{toast.message}</div>
                <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                  Action triggered by: <strong>{toast.actionBy}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History Drawer Modal / Offcanvas */}
      {showHistory && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title d-flex align-items-center gap-2 fs-6">
                  <i className="bi bi-broadcast text-success"></i>
                  <span>Real-Time Socket.IO Event Log</span>
                  <span className="badge bg-secondary rounded-pill">{notifications.length}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={onCloseHistory}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="alert alert-info py-2 small mb-3">
                  <i className="bi bi-info-circle me-1"></i>
                  Every time any user creates, updates, or deletes a task, Node.js emits a WebSocket event via Socket.IO to all connected browsers.
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-bell-slash fs-1 d-block mb-2"></i>
                    <p className="mb-0">No socket events received yet.</p>
                    <small>Create or update a task to see real-time events fire!</small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {notifications.map((n) => (
                      <div key={n.id} className="list-group-item px-0 py-2 border-bottom">
                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                          <span className={`badge ${getBadgeClass(n.type)}`}>
                            {n.type.toUpperCase()}
                          </span>
                          <small className="text-muted">
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                        <p className="mb-1 small fw-semibold text-dark">{n.message}</p>
                        <small className="text-muted">
                          Triggered by: <strong>{n.actionBy}</strong>
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light py-2">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={onClearHistory}
                  >
                    Clear History
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onCloseHistory}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
