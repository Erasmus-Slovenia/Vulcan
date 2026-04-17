# Vulcan — Technical Overview

**Version:** 1.0  
**Date:** April 2026  
**Author:** Jakob, Domen, Patrik

---

## 1. What Is Vulcan?

Vulcan is an internal project management and task collaboration platform. It allows teams to organize work into projects, assign tasks to one or more team members, track progress across statuses, and communicate through comments — all from a single web interface.

Key capabilities:

- Create and manage projects with active/archived lifecycle
- Create tasks with priority, due date, and status tracking
- Assign tasks to **multiple users** (many-to-many)
- View work on a **Kanban board** with drag-and-drop
- Filter and sort tasks by project, status, priority, or assignee
- Leave and manage **comments** on tasks
- **Admin panel** for user creation and management
- **Profile editing** (name, email, password)

---

## 2. Technology Stack

| Layer               | Technology              | Version       |
| ------------------- | ----------------------- | ------------- |
| Frontend Framework  | React                   | 19.2          |
| Frontend Language   | TypeScript              | 5.9           |
| Frontend Build Tool | Vite                    | 8.0           |
| CSS Framework       | Tailwind CSS            | 4.2           |
| Routing             | React Router DOM        | 7.13          |
| Backend Framework   | Laravel                 | 13            |
| Backend Language    | PHP                     | 8.4           |
| Database            | MySQL                   | 8.0           |
| Auth Library        | Laravel Sanctum         | (token-based) |
| Containerization    | Docker + Docker Compose | —             |

---

## 3. System Architecture

```
Browser (localhost:5173)
        │
        │  HTTP/JSON  (Authorization: Bearer <token>)
        ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  React Frontend  │◄──────►│  Laravel Backend │◄──────►│    MySQL DB      │
│  (Vite / Node)   │        │  (PHP artisan)   │        │  (port 3306)     │
│  port 5173       │        │  port 8000       │        │                  │
└──────────────────┘        └──────────────────┘        └──────────────────┘

All services run in isolated Docker containers on a shared internal network.
```

### Container Services

| Container           | Image          | Port | Role                   |
| ------------------- | -------------- | ---- | ---------------------- |
| `vulcan-frontend`   | Node 22 Alpine | 5173 | Serves Vite dev server |
| `vulcan-backend`    | PHP 8.4 Alpine | 8000 | Runs Laravel API       |
| `vulcan-db`         | MySQL 8.0      | 3306 | Persistent data store  |
| `vulcan-phpmyadmin` | phpMyAdmin     | 8080 | Database web UI        |

Start the full stack with one command:

```bash
make up
```

---

## 4. Application Pages & Routes

| Route           | Page                                       | Access        |
| --------------- | ------------------------------------------ | ------------- |
| `/login`        | Login                                      | Public        |
| `/dashboard`    | Dashboard — stats + task overview          | Authenticated |
| `/projects`     | Projects list + create/edit/archive        | Authenticated |
| `/projects/:id` | Project detail — tasks filtered to project | Authenticated |
| `/tasks`        | All tasks — filter, sort, create, edit     | Authenticated |
| `/kanban`       | Kanban board — drag tasks between columns  | Authenticated |
| `/admin`        | User management                            | Admin only    |

---

## 5. Backend API Reference

Base URL: `http://localhost:8000/api`

### Authentication

| Method | Endpoint   | Description                                |
| ------ | ---------- | ------------------------------------------ |
| POST   | `/login`   | Username + password → returns Bearer token |
| POST   | `/logout`  | Invalidates current token                  |
| GET    | `/user`    | Returns authenticated user object          |
| PUT    | `/profile` | Update name, email, or password            |

### Projects

| Method | Endpoint        | Description                                   |
| ------ | --------------- | --------------------------------------------- |
| GET    | `/projects`     | List projects (admins see all, users see own) |
| POST   | `/projects`     | Create project (admin only)                   |
| GET    | `/projects/:id` | Project detail with tasks and assignees       |
| PUT    | `/projects/:id` | Update project                                |
| DELETE | `/projects/:id` | Delete (blocked if active tasks exist)        |

### Tasks

| Method | Endpoint     | Query Params                                                 | Description                    |
| ------ | ------------ | ------------------------------------------------------------ | ------------------------------ |
| GET    | `/tasks`     | `project_id`, `status`, `priority`, `user_id`, `sort`, `dir` | Filtered task list             |
| POST   | `/tasks`     | —                                                            | Create task with `user_ids[]`  |
| GET    | `/tasks/:id` | —                                                            | Task detail with comments      |
| PUT    | `/tasks/:id` | —                                                            | Update task and reassign users |
| DELETE | `/tasks/:id` | —                                                            | Delete task                    |

### Comments

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | `/tasks/:id/comments` | List comments on a task |
| POST   | `/tasks/:id/comments` | Post a comment          |
| DELETE | `/comments/:id`       | Delete a comment        |

### Users (Admin)

| Method | Endpoint     | Description                                  |
| ------ | ------------ | -------------------------------------------- |
| GET    | `/users`     | List all users (id, name, role)              |
| POST   | `/users`     | Create user (admin only)                     |
| DELETE | `/users/:id` | Delete user (admin only, cannot self-delete) |

---

## 6. Database Schema

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    users    │       │   projects   │       │    tasks    │
│─────────────│       │──────────────│       │─────────────│
│ id (PK)     │──┐    │ id (PK)      │──┐    │ id (PK)     │
│ name        │  │    │ name         │  │    │ title       │
│ email       │  └───►│ user_id (FK) │  └───►│ project_id  │
│ password    │       │ description  │       │ description │
│ role        │       │ status       │       │ status      │
│ created_at  │       │ created_at   │       │ priority    │
│ updated_at  │       │ updated_at   │       │ due_date    │
└─────────────┘       └──────────────┘       │ created_at  │
       │                                     └──────┬──────┘
       │                                            │
       │         ┌───────────────┐                  │
       │         │   task_user   │                  │
       │         │ (pivot table) │                  │
       └────────►│ user_id (FK)  │◄─────────────────┘
                 │ task_id (FK)  │
                 │ created_at    │
                 │ updated_at    │
                 └───────────────┘

                 ┌──────────────┐
                 │   comments   │
                 │──────────────│
                 │ id (PK)      │
                 │ content      │
                 │ task_id (FK) │──► tasks.id
                 │ user_id (FK) │──► users.id
                 │ created_at   │
                 └──────────────┘
```

### Key Design Decisions

- **Many-to-many task assignment** — tasks are linked to users through a `task_user` pivot table, allowing a single task to be assigned to multiple team members simultaneously
- **Cascade deletes** — deleting a project cascades to its tasks and their comments
- **Active task guard** — projects cannot be deleted while they have tasks in `todo` or `in_progress` status (returns HTTP 422)
- **Archived project guard** — tasks cannot be created in or marked complete in an archived project

---

## 7. Authentication & Security

**Mechanism:** Laravel Sanctum token authentication (stateless API)

**Login flow:**

1. User submits username + password to `POST /api/login`
2. Backend validates against bcrypt-hashed password
3. Returns a personal access token (stored in `personal_access_tokens` table)
4. Frontend stores token in `localStorage`, sends it as `Authorization: Bearer <token>` on all API requests

**Authorization levels:**

- **Unauthenticated** — login only
- **Authenticated user** — manage own projects and tasks, view/edit assigned tasks
- **Admin** — full access to all projects, all tasks, user management

**Security measures:**

- Login endpoint rate-limited to 5 requests/minute
- Passwords hashed with bcrypt via Laravel's `Hash::make()`
- Profile password changes require current password verification
- Users cannot delete their own admin account
- CORS restricted to `http://localhost:5173`

---

## 8. Key Features in Detail

### Kanban Board

The Kanban board provides a visual three-column layout (To Do / In Progress / Done). Tasks can be dragged between columns using the browser's native HTML5 Drag and Drop API — no third-party dependencies. Dropping a card calls `PUT /api/tasks/:id` to persist the status change, with optimistic UI updates that revert on error.

### Multi-User Task Assignment

Tasks support assignment to multiple users through a many-to-many relationship. The frontend provides a custom multi-select dropdown showing all team members. Assigned users are displayed as stacked avatar initials with overflow indicators (e.g. `+2`). On save, the backend syncs the `task_user` pivot table using Laravel's `sync()` method.

### Dashboard

The dashboard displays four live statistics cards:

- Active projects count
- Pending tasks (status: todo)
- Overdue tasks (past due date, not done)
- Tasks assigned to the current user

Below the stats, a filterable list of recent tasks is shown.

### Admin Panel

Admins have access to a dedicated user management page where they can create new accounts (with role selection) and delete existing users. Admins also see all projects system-wide rather than only their own.

---

## 9. Project Structure

```
Vulcan/
├── compose.yaml              # Docker Compose (4 services)
├── Makefile                  # Developer shortcuts (make up, make reset, etc.)
├── docker/
│   ├── Dockerfile.backend    # PHP 8.4 + Composer + Laravel serve
│   └── Dockerfile.frontend   # Node 22 + Vite dev server
├── backend/                  # Laravel 13 application
│   ├── app/
│   │   ├── Http/Controllers/ # AuthController, ProjectController,
│   │   │                     # TaskController, CommentController,
│   │   │                     # UserController, ProfileController
│   │   └── Models/           # User, Project, Task, Comment
│   ├── database/migrations/  # All schema migrations
│   └── routes/api.php        # All API route definitions
└── frontend/                 # React 19 + TypeScript application
    └── src/
        ├── lib/api.ts        # API client, types, all fetch helpers
        ├── context/          # AuthContext (global auth state)
        ├── components/       # Layout (navbar, profile modal)
        └── pages/            # Dashboard, Projects, Tasks,
                              # Kanban, ProjectDetail, Admin, Login
```

---

## 10. Running the Project

**Prerequisites:** Docker and Docker Compose installed.

```bash
git clone <repo>
cd Vulcan
make up
```

| Service     | URL                              |
| ----------- | -------------------------------- |
| Frontend    | http://localhost:5173            |
| Backend API | http://localhost:8000            |
| phpMyAdmin  | http://localhost:8080            |
| API Health  | http://localhost:8000/api/health |

Default credentials (seeded on first run):

| Username | Password | Role  |
| -------- | -------- | ----- |
| Admin    | password | admin |
