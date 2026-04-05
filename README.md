# TaskFlow — Task Management System

A full-stack task management application built with **Node.js + TypeScript** on the backend and **Next.js 15 + React 19** on the frontend.

Users can register, log in, and manage their personal tasks with full CRUD operations, filtering, search, and pagination — all secured with JWT authentication and automatic token refresh.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 24 LTS |
| Backend framework | Express 4 |
| Language | TypeScript 5 (strict mode, frontend + backend) |
| ORM | Prisma 6 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Frontend framework | Next.js 15 (App Router) |
| UI library | React 18 |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (with silent refresh interceptor) |
| Notifications | react-hot-toast |

---

## Features

### Authentication
- Register and login with **bcrypt** password hashing (cost factor 12)
- **JWT Access Tokens** (15-minute expiry) for protected API access
- **JWT Refresh Tokens** (7-day expiry) with automatic rotation on every refresh
- Silent token refresh via Axios interceptor — users stay logged in seamlessly
- Secure logout with server-side refresh token invalidation
- Rate limiting on `/auth/register` and `/auth/login` (20 requests per 15 minutes)

### Task Management
- Create, read, update, and delete personal tasks
- Toggle task status: `PENDING` → `IN_PROGRESS` → `COMPLETED`
- Set task **priority** (`LOW`, `MEDIUM`, `HIGH`) and optional **due date**
- Paginated task list with server-side **status/priority filtering** and **title search**
- All tasks are scoped to the authenticated user — no cross-user data access

### Frontend
- Dark editorial UI — Syne + DM Sans fonts, fully responsive (mobile + desktop)
- Shimmer skeleton loading states
- Toast notifications for all operations (create, update, delete, toggle)
- Debounced search input
- Logged-in users are automatically redirected away from login/register pages

---

## Project Structure

```
Task_Management_System/
├── .gitignore
├── README.md
├── backend/
│   ├── .gitignore
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── index.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   └── task.controller.ts
│       ├── middleware/
│       │   ├── auth.ts
│       │   └── errorHandler.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   └── task.routes.ts
│       ├── utils/
│       │   ├── jwt.ts
│       │   └── prisma.ts
│       └── types/
│           └── index.ts
└── frontend/
    ├── .gitignore
    ├── .env.local.example
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── globals.css
        │   ├── auth/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   └── dashboard/
        │       └── page.tsx
        ├── components/
        │   ├── TaskCard.tsx
        │   ├── TaskModal.tsx
        │   ├── DeleteDialog.tsx
        │   └── TaskSkeleton.tsx
        ├── lib/
        │   ├── api.ts
        │   ├── auth-context.tsx
        │   ├── storage.ts
        │   └── utils.ts
        └── types/
            └── index.ts
```

---

## Getting Started

### Prerequisites

- Node.js 24 LTS — [nodejs.org](https://nodejs.org)
- npm 11+ (bundled with Node 24)

### 1. Clone the repository

```bash
git clone https://github.com/Amit-netizen/Task_Management_System.git
cd Task_Management_System
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in your JWT secrets:

```env
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="your-random-hex-string-here"
JWT_REFRESH_SECRET="your-different-random-hex-string-here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
CLIENT_URL="http://localhost:3000"
```

Generate secure secrets (run twice, use different values for each):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set up the database and start:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs on **http://localhost:4000**

### 3. Frontend setup

Open a new terminal tab:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register. Body: `{ name, email, password }` |
| `POST` | `/auth/login` | — | Login. Body: `{ email, password }` |
| `POST` | `/auth/refresh` | — | Rotate tokens. Body: `{ refreshToken }` |
| `POST` | `/auth/logout` | — | Invalidate token. Body: `{ refreshToken }` |

### Tasks

All task endpoints require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | List tasks (pagination, filter, search) |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks/:id` | Get single task |
| `PATCH` | `/tasks/:id` | Update task |
| `DELETE` | `/tasks/:id` | Delete task |
| `PATCH` | `/tasks/:id/toggle` | Toggle PENDING ↔ COMPLETED |

### GET /tasks — Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 10, max: 50) |
| `status` | string | `PENDING` \| `IN_PROGRESS` \| `COMPLETED` |
| `priority` | string | `LOW` \| `MEDIUM` \| `HIGH` |
| `search` | string | Search by title |

### Example Response — GET /tasks

```json
{
  "tasks": [
    {
      "id": "clxyz123",
      "title": "Build REST API",
      "description": "Node.js + Express + Prisma",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2026-04-30T00:00:00.000Z",
      "createdAt": "2026-04-04T10:00:00.000Z",
      "updatedAt": "2026-04-04T10:30:00.000Z",
      "userId": "clxyz456"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Database Schema

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  passwordHash  String
  tasks         Task[]
  refreshTokens RefreshToken[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `file:./dev.db` | SQLite path or PostgreSQL URL |
| `JWT_ACCESS_SECRET` | Yes | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | — | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiry |
| `PORT` | No | `4000` | API server port |
| `CLIENT_URL` | Yes | `http://localhost:3000` | Frontend URL (for CORS) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000` | Backend API base URL |

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Prisma Studio GUI |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Production Deployment

### Switch to PostgreSQL

In `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Update `DATABASE_URL` and run:

```bash
npx prisma migrate deploy
```

### Production environment checklist

- [ ] Strong unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (32+ byte hex strings)
- [ ] `CLIENT_URL` set to your deployed frontend domain
- [ ] `NEXT_PUBLIC_API_URL` set to your deployed backend URL
- [ ] PostgreSQL database provisioned
- [ ] `NODE_ENV=production` set on the server

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- Refresh tokens stored in database — fully invalidated on logout
- Token rotation on every refresh — stolen tokens expire after one use
- All task queries filter by `userId` from JWT — no cross-user data access
- Zod validation on all request bodies — invalid input rejected at 400 before hitting the database
- CORS restricted to `CLIENT_URL` origin only
- Rate limiting on auth endpoints — 20 requests per 15 minutes per IP
