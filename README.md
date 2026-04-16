# WorkSpace — Kanban Board App

A full-stack project management tool built with **Angular 19** and **NestJS**. Organize work in Kanban boards, drag tasks across columns, and leave comments on any card — all with a polished dark-tech UI that supports light/dark mode.

---

## Tech Stack

### Frontend
| | |
|---|---|
| **Framework** | Angular 19 — standalone components, no NgModule |
| **State management** | Angular Signals (`signal`, `effect`, `computed`) |
| **Drag & drop** | Angular CDK (`@angular/cdk/drag-drop`) |
| **HTTP** | Angular `HttpClient` |
| **Styling** | Vanilla CSS with design tokens (CSS custom properties) |
| **Fonts** | Syne (display) · Outfit (body) · JetBrains Mono (code) |
| **Language** | TypeScript 5.7, strict mode |

### Backend
| | |
|---|---|
| **Framework** | NestJS 10 |
| **ORM** | Prisma 5 |
| **Database** | SQLite (dev) |
| **Validation** | class-validator + class-transformer |
| **Language** | TypeScript 5.3 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│   ┌───────────────────────────────────────────────────┐    │
│   │              Angular 19 SPA  :4200                │    │
│   │                                                   │    │
│   │  ┌─────────────────┐   ┌──────────────────────┐  │    │
│   │  │  BoardService   │   │   CommentService     │  │    │
│   │  │  (Signals +     │   │   (HttpClient →      │  │    │
│   │  │   in-memory     │   │    REST API)         │  │    │
│   │  │   mock data)    │   └──────────┬───────────┘  │    │
│   │  └─────────────────┘              │               │    │
│   └───────────────────────────────────┼───────────────┘    │
│                                       │ HTTP                │
└───────────────────────────────────────┼─────────────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │     NestJS API  :3000        │
                         │                              │
                         │  GET  /api/cards/:id/comments│
                         │  POST /api/cards/:id/comments│
                         │                              │
                         │  ┌────────────────────────┐  │
                         │  │   Prisma ORM           │  │
                         │  └──────────┬─────────────┘  │
                         └─────────────┼────────────────┘
                                       │
                         ┌─────────────▼────────────────┐
                         │       SQLite  dev.db          │
                         │   User table · Comment table  │
                         └──────────────────────────────┘
```

> **Note:** Boards, lists and tasks live entirely in client-side memory (Angular Signals). Only comments are persisted to the database.

---

## Features

- **Board dashboard** — view all boards with task counts, overdue indicators and a live search filter
- **Kanban columns** — each board displays its lists as columns; tasks show color-coded due date badges
- **Drag & drop** — move tasks between columns or reorder within a column; state updates immediately via Signals
- **Add boards** — modal with a name field and 6 accent color options; navigates to the new board on creation
- **Add lists & tasks** — inline forms directly in the board view; confirm with Enter, cancel with Escape
- **Task comments** — click any card to open a modal; comments are fetched from the API and posted back in real time
- **Relative timestamps** — comment times show as "just now", "5m ago", "2h ago", etc.
- **Light / dark mode** — toggle in the header; preference is saved to `localStorage`
- **404 page** — custom not-found page for any unknown route
- **Responsive layout** — CSS grid that adapts from desktop to mobile; columns stack vertically on small screens

---

## Project Structure

```
Claude-exercise/
│
├── src/                                  # Angular frontend
│   ├── app/
│   │   ├── app.component.*               # Root shell — header, theme toggle, router outlet
│   │   ├── app.config.ts                 # provideRouter, provideHttpClient, zone coalescing
│   │   ├── app.routes.ts                 # Lazy-loaded routes + wildcard 404
│   │   │
│   │   ├── features/
│   │   │   ├── boards-list/              # Dashboard — all boards, search, stats
│   │   │   ├── board-detail/             # Kanban view — lists, tasks, drag & drop
│   │   │   ├── board-create-modal/       # New board modal — name + color picker
│   │   │   ├── task-modal/               # Task detail overlay — comments section
│   │   │   └── not-found/               # 404 page
│   │   │
│   │   ├── models/
│   │   │   └── board.model.ts            # Board, List, Task, Comment, BoardStats interfaces
│   │   │
│   │   ├── services/
│   │   │   ├── board.service.ts          # In-memory state via Signals (CRUD for boards/lists/tasks)
│   │   │   └── comment.service.ts        # HTTP calls to NestJS comments API
│   │   │
│   │   └── utils/
│   │       └── relative-time.ts          # relativeTime(date) → "5m ago"
│   │
│   ├── index.html                        # Theme FOUC-prevention inline script
│   ├── main.ts                           # bootstrapApplication entry point
│   └── styles.css                        # Global design system — CSS variables, keyframes
│
└── server/                               # NestJS backend
    ├── src/
    │   ├── main.ts                       # Bootstrap — port 3000, CORS, global validation pipe
    │   ├── app.module.ts                 # Root module — imports Prisma + Comments modules
    │   │
    │   ├── prisma/
    │   │   ├── prisma.module.ts          # Global Prisma provider
    │   │   └── prisma.service.ts         # PrismaClient wrapper with onModuleInit
    │   │
    │   └── comments/
    │       ├── comments.module.ts
    │       ├── comments.controller.ts    # GET + POST /api/cards/:cardId/comments
    │       ├── comments.service.ts       # findAll (ordered DESC) · create (with user include)
    │       └── dto/
    │           └── create-comment.dto.ts # { text: string, userId: string }
    │
    └── prisma/
        ├── schema.prisma                 # User + Comment models, SQLite datasource
        ├── seed.ts                       # Seeds 3 test users
        └── migrations/                  # Migration history
```

---

## Database Schema

```prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  comments  Comment[]
  createdAt DateTime  @default(now())
}

model Comment {
  id        String   @id @default(cuid())
  text      String
  createdAt DateTime @default(now())
  cardId    String               // matches task id from frontend (e.g. "t1")
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### 1 — Frontend

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
npm start
```

### 2 — Backend

```bash
cd server

# Install dependencies
npm install

# Apply database migrations
npx prisma migrate dev

# Seed test users
npx ts-node prisma/seed.ts

# Start API server (http://localhost:3000)
npm run start:dev
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/cards/:cardId/comments` | Returns all comments for a task, newest first |
| `POST` | `/api/cards/:cardId/comments` | Creates a new comment — body: `{ text, userId }` |

---

## Design System

The UI is built on a set of CSS custom properties defined in `src/styles.css`. Both dark (default) and light themes are supported via a `[data-theme="light"]` attribute on `<html>`.

| Token | Dark | Light |
|---|---|---|
| `--bg-base` | `#060810` | `#F1F5F9` |
| `--accent-indigo` | `#6366F1` | `#6366F1` |
| `--accent-cyan` | `#22D3EE` | `#22D3EE` |
| `--text-primary` | `#E2E8F0` | `#0F172A` |
| `--font-display` | Syne | Syne |
| `--font-sans` | Outfit | Outfit |
| `--font-mono` | JetBrains Mono | JetBrains Mono |
