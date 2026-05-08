# ⚡ TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control, built for the Internship Assignment.

**Live Demo:** `https://taskflow-production.up.railway.app` *(replace with your deployed URL)*
**GitHub:** `https://github.com/yourusername/taskflow` *(replace with your repo)*

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-based signup/login, protected routes |
| 📁 Projects | Create projects, invite members, manage team |
| ✅ Tasks | Create, assign, update status, set priority & due dates |
| 🎭 Role-based Access | Admin: full control · Member: view & update own tasks |
| 📊 Dashboard | Live stats, progress bar, overdue alerts, my tasks feed |
| 🗂️ Kanban View | Tasks organized by To Do / In Progress / Done columns |
| 🔍 Filters | Filter tasks by status and priority |

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js + Express
- **Database:** SQLite (via Prisma ORM)
- **Auth:** JWT + bcryptjs
- **Validation:** express-validator

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Fonts:** Google Fonts (Syne + DM Sans)

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
npm install
npm run db:generate   # generate Prisma client
npm run db:push       # create database tables
npm run db:seed       # seed demo data
npm start             # start on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev           # start on port 5173
```

App runs at **http://localhost:5173**

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@taskflow.dev | password123 |
| Member | member@taskflow.dev | password123 |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Login, get JWT |
| GET | `/api/auth/me` | ✓ | Get current user |

### Projects
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/projects` | Member | List my projects |
| POST | `/api/projects` | Any | Create project |
| GET | `/api/projects/:id` | Member | Project details + tasks |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Admin | Remove member |
| PATCH | `/api/projects/:id/members/:uid/role` | Admin | Change role |

### Tasks
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/tasks/dashboard` | Any | Dashboard stats |
| GET | `/api/tasks/my` | Any | My assigned tasks |
| GET | `/api/tasks/project/:id` | Member | Project tasks |
| POST | `/api/tasks/project/:id` | Member | Create task |
| PUT | `/api/tasks/project/:id/:taskId` | Member | Update task |
| DELETE | `/api/tasks/project/:id/:taskId` | Admin | Delete task |

---

## 🚂 Railway Deployment

### Deploy Backend

1. Push code to GitHub
2. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Set environment variables:
   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=<strong-random-string>
   CLIENT_URL=https://your-frontend.up.railway.app
   PORT=5000
   ```
5. Set start command: `cd backend && npm run setup && npm start`
6. Deploy!

### Deploy Frontend

1. In Railway, add a new service → same repo
2. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app
   ```
3. Set build command: `cd frontend && npm install && npm run build`
4. Set start command: `cd frontend && npm run preview -- --host 0.0.0.0 --port $PORT`
5. Update `vite.config.js` to use `VITE_API_URL` env var for production

---

## 🗄️ Database Schema

```
User ──< ProjectMember >── Project
                               │
                           Task (assignee → User, creator → User)
```

### Roles
- **ADMIN**: Full project control (add/remove members, delete tasks, edit project)
- **MEMBER**: View tasks, create tasks, update their own tasks

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/schema.prisma     # DB schema
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT + RBAC middleware
│   │   ├── routes/              # Express routers
│   │   ├── prisma/seed.js       # Demo data seeder
│   │   └── index.js             # App entry
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   └── ProjectDetail.jsx
    │   ├── components/layout/
    │   ├── utils/api.js
    │   └── App.jsx
    └── package.json
```

---

## 🔒 Security Considerations
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 7 days
- All protected routes require valid Bearer token
- RBAC enforced server-side, not just client-side
- Input validation on all POST/PUT endpoints
- CORS restricted to frontend origin

---

*Built with ❤️ for the internship assignment*
