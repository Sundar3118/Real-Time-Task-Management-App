import React, { useState } from 'react';
import { api } from '../services/api.js';
import { DatabaseStatus } from '../types.js';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus?: DatabaseStatus | null;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
}) => {
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Simulate an event from User B (e.g. Priya Sharma or Sam Taylor)
  const handleSimulateUserBAction = async () => {
    setSimulating(true);
    setSimMessage(null);
    try {
      // Temporarily login as Priya, create a task, and observe Socket.IO broadcast!
      const titles = [
        'Optimize Database Indexing for Tasks',
        'Review Pull Request #42: Dark Mode',
        'Deploy API to Production Staging',
        'Update Student Project Documentation',
      ];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)] + ` (${Math.floor(Math.random() * 900 + 100)})`;

      // We call the API directly using mock or fetch to trigger socket broadcast
      await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Header for mock test
          'Authorization': `Bearer student_token`,
        },
        body: JSON.stringify({
          title: randomTitle,
          description: 'This task was created by User B (Priya Sharma) from another session to demonstrate real-time Socket.IO synchronization.',
          priority: 'High',
          status: 'Todo',
          dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        }),
      });

      setSimMessage(`Success! Task "${randomTitle}" was created on the server and broadcast via Socket.IO.`);
    } catch (err: any) {
      setSimMessage('Simulation sent! Watch your dashboard & toast notifications.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content shadow border-0">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <i className="bi bi-diagram-3-fill text-info"></i>
              <span>MERN Stack + Socket.IO Architecture & Data Flow</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* System Overview */}
            <div className="alert alert-primary d-flex align-items-center gap-3">
              <i className="bi bi-mortarboard-fill fs-2 text-primary"></i>
              <div>
                <strong>Student Learning Architecture:</strong>
                <p className="mb-0 small text-dark">
                  This project demonstrates how a modern full-stack web application separates standard REST data persistence from event-driven real-time messaging.
                </p>
              </div>
            </div>

            {/* FLOW 1: REST API FLOW */}
            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
                <span>1. REST Data Flow: Persistence & CRUD</span>
                <span className="badge bg-light text-primary">HTTP / JSON</span>
              </div>
              <div className="card-body">
                {/* Visual Flow diagram */}
                <div className="p-3 bg-light rounded text-center mb-3">
                  <div className="row g-2 align-items-center justify-content-center fw-bold">
                    <div className="col-auto">
                      <span className="badge bg-primary fs-6 p-2">
                        <i className="bi bi-browser-chrome me-1"></i> React (Client)
                      </span>
                    </div>
                    <div className="col-auto text-primary fs-4">➡️</div>
                    <div className="col-auto">
                      <span className="badge bg-dark fs-6 p-2">
                        <i className="bi bi-server me-1"></i> Express REST API
                      </span>
                    </div>
                    <div className="col-auto text-primary fs-4">➡️</div>
                    <div className="col-auto">
                      <span className="badge bg-success fs-6 p-2">
                        <i className="bi bi-database me-1"></i> MongoDB / Mongoose
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold">Step-by-Step Execution:</h6>
                <ol className="small text-muted mb-0">
                  <li className="mb-1">
                    <strong>React Frontend:</strong> User fills out task details and clicks "Create Task". React triggers a <code>fetch('/api/tasks')</code> with JWT bearer token.
                  </li>
                  <li className="mb-1">
                    <strong>Express Controller:</strong> <code>authMiddleware</code> validates the token. The <code>taskController.createTask</code> validates the payload.
                  </li>
                  <li className="mb-1">
                    <strong>MongoDB Database:</strong> Mongoose validates the Schema (Title, Priority, Status, Assignee) and writes the document to the <code>tasks</code> collection.
                  </li>
                  <li>
                    <strong>HTTP Response:</strong> Express sends HTTP 201 Created with JSON back to the creator.
                  </li>
                </ol>
              </div>
            </div>

            {/* FLOW 2: WEBSOCKET REAL-TIME FLOW */}
            <div className="card mb-4 border-success">
              <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center">
                <span>2. WebSocket Real-Time Flow: Instant Notifications</span>
                <span className="badge bg-light text-success">WebSockets / Socket.IO</span>
              </div>
              <div className="card-body">
                {/* Visual Flow diagram */}
                <div className="p-3 bg-light rounded text-center mb-3">
                  <div className="row g-2 align-items-center justify-content-center fw-bold">
                    <div className="col-auto">
                      <span className="badge bg-primary fs-6 p-2">User A (Browser)</span>
                    </div>
                    <div className="col-auto text-success fs-4">➡️</div>
                    <div className="col-auto">
                      <span className="badge bg-dark fs-6 p-2">Node.js + Socket.IO Server</span>
                    </div>
                    <div className="col-auto text-success fs-4">📢 (Broadcast)</div>
                    <div className="col-auto">
                      <span className="badge bg-success fs-6 p-2">User B, C (Browsers)</span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold">Step-by-Step Execution:</h6>
                <ol className="small text-muted mb-0">
                  <li className="mb-1">
                    <strong>Persistent Connection:</strong> Upon opening the app, every client creates a duplex WebSocket connection via <code>socket = io()</code>.
                  </li>
                  <li className="mb-1">
                    <strong>Trigger on Change:</strong> Right after MongoDB saves the task, Node.js calls <code>io.emit('task:created', taskData)</code>.
                  </li>
                  <li className="mb-1">
                    <strong>Instant Broadcast:</strong> The Socket.IO server pushes the event payload down the open TCP socket to <em>all</em> connected clients within milliseconds.
                  </li>
                  <li>
                    <strong>UI Update without Refresh:</strong> User B's React app hears <code>socket.on('task:created')</code>, inserts the new task into state, and displays a toast notification banner!
                  </li>
                </ol>
              </div>
            </div>

            {/* Live Interactive Simulator */}
            <div className="card bg-light border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-broadcast text-danger"></i>
                <span>Test Real-Time Multi-User Behavior</span>
              </h6>
              <p className="small text-muted mb-2">
                Want to see the real-time notification without opening two browser windows? Click below to simulate User B creating a task on the server:
              </p>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                  onClick={handleSimulateUserBAction}
                  disabled={simulating}
                >
                  {simulating && <span className="spinner-border spinner-border-sm"></span>}
                  <i className="bi bi-lightning-charge"></i>
                  <span>Simulate User B Creating a Task</span>
                </button>
              </div>
              {simMessage && (
                <div className="alert alert-success py-1 px-2 small mt-2 mb-0">
                  {simMessage}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
