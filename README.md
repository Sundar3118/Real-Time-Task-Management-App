# Real-Time Task Management App (MERN Stack + Socket.IO)

A beginner-to-intermediate full-stack web application designed as a realistic college student project. It demonstrates how to build a collaborative task management tool using **React, Vite, Bootstrap, Node.js, Express, MongoDB, and Socket.IO**.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [Data Flow Diagrams](#data-flow-diagrams)
  - [1. REST Data Flow (React → Express → MongoDB)](#1-rest-data-flow-react--express--mongodb)
  - [2. Real-Time Flow (React → Socket.IO → Connected Clients)](#2-real-time-flow-react--socketio--connected-clients)
- [Database Models (MongoDB / Mongoose)](#database-models-mongodb--mongoose)
- [Authentication & Security](#authentication--security)
- [Validation & Error Handling](#validation--error-handling)
- [API Documentation](#api-documentation)
- [Socket.IO Events](#socketio-events)
- [Setup & Installation Instructions](#setup--installation-instructions)
- [Testing the Multi-User Real-Time Feature](#testing-the-multi-user-real-time-feature)

---

## 🎯 Project Overview

In teamwork environments, team members need to know when tasks are added, updated, or completed without repeatedly pressing the browser's refresh button.

This project solves that by combining:
1. **REST APIs** for persistent CRUD operations.
2. **Socket.IO** for instantaneous bi-directional event notifications across multiple browser sessions.

### Core Features:
- 🔐 **User Authentication**: Register & Login with password hashing (`bcryptjs`) and JWT token authentication.
- 👥 **Multi-User Collaboration**: Assign tasks to team members; switch active users quickly to test notifications.
- 📋 **Complete Task CRUD**: Create, read, edit, and delete tasks.
- 🏷️ **Task Fields**: Title, Description, Priority (Low, Medium, High), Status (Todo, In Progress, Completed), Due Date, Assigned User, Created By, and Timestamps.
- 🔍 **Search & Filters**: Search by keyword; filter by status (All, Todo, In Progress, Completed); filter by priority; filter by "Assigned to Me".
- ⚡ **Real-Time Notifications**: Instant toast alerts when any user creates, updates, or deletes a task without page reload.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Client** | React 19 + Vite | Fast frontend SPA |
| **Styling** | Bootstrap 5 | Clean, responsive, responsive components & layout |
| **Runtime** | Node.js | Backend JavaScript runtime |
| **Server** | Express.js | REST API routing and middleware |
| **Database** | MongoDB + Mongoose | Document database with schemas & validation |
| **Real-Time** | Socket.IO (`socket.io` & `socket.io-client`) | WebSocket-style event communication |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` | Bearer token authentication & password encryption |

---

## 📂 Project Architecture & Directory Structure

```text
├── client/                     # Frontend Application
│   ├── components/
│   │   ├── ArchitectureModal.tsx   # Interactive flow explanation modal
│   │   ├── AuthModal.tsx           # Login / Register with 1-click student demo logins
│   │   ├── Dashboard.tsx           # Main workspace coordinating tasks & socket state
│   │   ├── Navbar.tsx              # Navigation, user switcher & connection badges
│   │   ├── NotificationToast.tsx   # Real-time toast alerts & socket event log
│   │   ├── StatsCards.tsx          # Statistics summary counters
│   │   ├── TaskCard.tsx            # Card component with quick status changes
│   │   ├── TaskFilterBar.tsx       # Search bar and status/priority filters
│   │   └── TaskModal.tsx           # Modal for creating and editing tasks
│   ├── services/
│   │   ├── api.ts                  # REST API client with Authorization header handling
│   │   └── socket.ts               # Socket.IO client connection & event subscribers
│   └── types.ts                    # TypeScript interfaces for User, Task, and Notifications
│
├── server/                     # Backend Application
│   ├── config/
│   │   └── db.ts                   # MongoDB connection logic (with auto-fallback store)
│   ├── controllers/
│   │   ├── authController.ts       # Registration, login, and user queries
│   │   └── taskController.ts       # Task CRUD logic and Socket.IO event emission
│   ├── middleware/
│   │   └── auth.ts                 # JWT verification middleware (req.user)
│   ├── models/
│   │   ├── Task.ts                 # Mongoose schema for Task collection
│   │   └── User.ts                 # Mongoose schema for User collection
│   ├── routes/
│   │   ├── authRoutes.ts           # /api/auth endpoints
│   │   ├── statusRoutes.ts         # /api/status health and DB checks
│   │   └── taskRoutes.ts           # /api/tasks endpoints
│   ├── dataStore.ts                # Unified data layer supporting MongoDB & memory store
│   └── socket.ts                   # Socket.IO server initialization & broadcast helpers
│
├── server.ts                   # Root full-stack entry point (Express + Socket.IO + Vite)
├── .env.example                # Environment variable templates
└── README.md                   # Complete documentation
```

---

## 🔄 Data Flow Diagrams

### 1. REST Data Flow (React → Express API → MongoDB)
Used for reliable, persistent data storage (CRUD operations):

```
+-------------------------------------------------------------------+
|                        1. React Client                             |
|  - User fills out task form                                       |
|  - Calls api.createTask({ title, priority, status, ... })         |
|  - Sends HTTP POST /api/tasks with "Authorization: Bearer <jwt>"  |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     2. Express Web Server                         |
|  - authMiddleware verifies JWT token and extracts req.user        |
|  - taskController validates required fields (title, etc.)         |
|  - Creates new Mongoose Task document                             |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                   3. MongoDB / Mongoose Model                     |
|  - Enforces schema rules (types, enums, required constraints)      |
|  - Saves record in "tasks" collection                             |
|  - Returns populated task document                                |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                   4. HTTP Response to Client                      |
|  - Express returns HTTP 201 Created with JSON payload             |
|  - React updates local component state                            |
+-------------------------------------------------------------------+
```

---

### 2. Real-Time Flow (React → Socket.IO → Connected Clients)
Used for live notifications without polling or page reloads:

```
[ User A (Browser) ]
        |
        | 1. HTTP POST /api/tasks (Creates task)
        v
[ Node.js + Express API ] === saves to ===> [ MongoDB ]
        |
        | 2. notifyClients('task:created', { task, actionBy: "User A" })
        v
[ Socket.IO Server Instance ]
        |
        +=========================== Broadcast via WebSockets ===========================+
        |                                                                                |
        v                                                                                v
[ User A's Browser ]                                                            [ User B's Browser ]
(Receives event acknowledgment)                                                 - socket.on('task:created') fires
                                                                                - Inserts task into state immediately
                                                                                - Pops up toast notification:
                                                                                  "User A created task: 'Fix auth bug'"
```

---

## 🗄 Database Models (MongoDB / Mongoose)

### 1. User Model (`server/models/User.ts`)
```typescript
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    default: 'Team Member',
  },
}, { timestamps: true });
```

### 2. Task Model (`server/models/Task.ts`)
```typescript
const TaskSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Completed'],
    default: 'Todo',
  },
  dueDate: {
    type: String,
    default: '',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });
```

---

## 🔐 Authentication & Security

- **Password Hashing**: Stored passwords are salted and hashed using `bcryptjs` with 10 salt rounds. Passwords are never stored in plain text.
- **JSON Web Tokens (JWT)**: Upon login or registration, the server issues a signed JWT containing the user's `_id`, `name`, and `email`.
- **Protected Routes**: Protected endpoints use `authMiddleware` to inspect `req.headers.authorization`.
- **Client Storage**: The JWT is stored in `localStorage` and sent automatically on requests via the `Authorization: Bearer <token>` header.

---

## 🛡️ Validation & Error Handling

- **Client Validation**: Required fields (e.g., Task Title, User Email) are checked before submission with clear visual feedback.
- **Server Validation**: The server validates payload types and constraints, returning descriptive HTTP status codes (e.g., `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`).
- **Resilient Database Layer**: If MongoDB is not running locally, the server smoothly falls back to an embedded in-memory store pre-populated with student demo data, allowing zero-config testing.

---

## 📡 API Documentation

### Authentication Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | No | Log in with `email` and `password`, receives JWT |
| `GET` | `/api/auth/me` | Yes | Get the current authenticated user's profile |
| `GET` | `/api/auth/users` | No | Get list of registered users for task assignment |

### Task Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | No | List tasks (supports query params: `status`, `priority`, `search`) |
| `GET` | `/api/tasks/:id` | No | Get single task details by ID |
| `POST` | `/api/tasks` | Yes | Create task and broadcast `task:created` via Socket.IO |
| `PUT` | `/api/tasks/:id` | Yes | Update task and broadcast `task:updated` via Socket.IO |
| `DELETE`| `/api/tasks/:id` | Yes | Delete task and broadcast `task:deleted` via Socket.IO |

### Status Endpoint
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/status/health` | No | Check MongoDB connection status and task counts |

---

## ⚡ Socket.IO Events

| Event Name | Direction | Payload Example | Description |
|---|---|---|---|
| `connection` | Client → Server | N/A | Triggered when a browser opens a WebSocket connection |
| `task:created` | Server → All Clients | `{ task: {...}, actionBy: "Alex", message: "..." }` | Emitted after a task is saved |
| `task:updated` | Server → All Clients | `{ task: {...}, actionBy: "Priya", message: "..." }` | Emitted when task fields or status change |
| `task:deleted` | Server → All Clients | `{ taskId: "...", title: "...", actionBy: "Sam" }` | Emitted when a task is deleted |

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- (Optional) MongoDB local daemon or a free MongoDB Atlas URI

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd real-time-task-manager

# Install npm dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```ini
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=my_super_secret_jwt_key_2026
```
*(Note: If you do not have MongoDB running, the application will automatically run using its built-in store so you can evaluate the project immediately).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Multi-User Real-Time Feature

To test the real-time notification scenario (**User A creates a task → User B receives a notification without refreshing**):

### Method 1: Using Two Browser Windows (Recommended)
1. Open [http://localhost:3000](http://localhost:3000) in Window 1. Use the **Quick Switch Demo User** dropdown in the navigation bar to select **Alex Rivera**.
2. Open [http://localhost:3000](http://localhost:3000) in Window 2 (or an Incognito window). Switch to **Priya Sharma**.
3. In Window 1 (Alex), click **"Create Task"** and submit a new task.
4. Look at Window 2 (Priya): A real-time toast alert will appear in the bottom-right corner and the task will appear in the dashboard automatically, without reloading!

### Method 2: Using the In-App Simulator
1. Click the **"Architecture Guide"** button in the top navigation bar.
2. Scroll to the bottom and click **"Simulate User B Creating a Task"**.
3. Close the guide to see the real-time toast banner and the new task appear immediately on your dashboard.
