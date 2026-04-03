# TaskFlow — SaaS Task Manager

> A full-stack productivity SaaS built with Next.js 14, TypeScript, Node.js/Express, and PostgreSQL.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)

## Features

- **Authentication** — JWT-based auth with httpOnly cookies (secure by default)
- **Task CRUD** — Create, read, update, delete tasks with priority levels
- **Filtering & Sorting** — Filter by status, priority, and due date
- **Server-Side Rendering** — Next.js App Router with SSR for fast initial loads
- **REST API** — Clean Express API with validation middleware
- **PostgreSQL** — Relational DB with proper schema and indexes

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | Zod |

## Project Structure

```
taskflow/
├── frontend/          # Next.js 14 app
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/
│       ├── lib/       # API client, auth helpers
│       ├── hooks/     # Custom React hooks
│       └── types/
└── backend/           # Express API
    └── src/
        ├── routes/
        ├── controllers/
        ├── middleware/
        └── db/
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE taskflow;"

# Run migrations
cd backend
psql -U postgres -d taskflow -f src/db/schema.sql
```

### 3. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Clears auth cookie |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all user tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Key Engineering Decisions

- **App Router over Pages Router** — uses Next.js 14 App Router for SSR/SSG flexibility and React Server Components
- **httpOnly cookies** — JWTs stored in httpOnly cookies, not localStorage, preventing XSS token theft
- **Zod validation** — request bodies validated with Zod before hitting controllers
- **Parameterized queries** — all DB queries use parameterized statements to prevent SQL injection
- **TypeScript end-to-end** — shared types between frontend and backend

## What I Learned / Why This Project Matters

This project demonstrates core full-stack engineering patterns used in production SaaS:
- Secure authentication flow
- RESTful API design
- Database schema design with proper relationships
- Server-side rendering for SEO and performance
- TypeScript for type safety across the stack
