# Platform Core Documentation

Welcome to the documentation hub for **platform-core**, a reusable NestJS backend foundation for authentication, user management, role/permission authorization, and shared platform behaviors.

This documentation is written for:

- New developers joining the backend team
- Interns learning production-ready backend structure
- Backend engineers extending platform capabilities
- Flutter/frontend engineers integrating with backend APIs
- Future contributors who need architectural context before coding

---

## What is platform-core?

`platform-core` is the base backend repository that centralizes cross-product backend capabilities such as:

- User registration, login, refresh, logout, and profile retrieval
- Session management with refresh-token rotation
- Role-based and permission-based authorization
- Admin user management APIs
- Standardized API responses, validation, logging, and exception handling

It is intentionally designed as a **shared core** so multiple product teams can reuse stable backend logic instead of rebuilding the same foundations repeatedly.

---

## Why this project exists

Without a shared core, teams often duplicate auth and user-management logic across projects, which causes:

- Inconsistent security implementations
- Repeated bugs in multiple repositories
- Slower delivery for new client/domain projects
- Higher long-term maintenance cost

`platform-core` exists to solve that by offering one reliable implementation of core backend features, then propagating stable improvements to downstream repos.

---

## High-level features

- **Auth system**: register, login, JWT access/refresh flow, logout, `/auth/me`
- **Session security**: refresh tokens are hashed before storage
- **Authorization**: role + permission model with guards
- **Admin controls**: list users, view user details, update status, assign roles
- **Developer ergonomics**: Prisma migrations/seed scripts, bootstrap super-admin script
- **Operational defaults**: global validation, global error handling, structured success format

---

## Who should use this repo?

Use this repo if you are:

- Building domain-specific backend layers on top of shared core features
- Maintaining authentication, account, role, and permission logic
- Integrating frontend clients with the core identity APIs
- Standardizing backend behavior across multiple products

---

## Documentation map

Start here, then follow this order:

1. [Architecture](./architecture.md)
2. [Tech Stack](./tech-stack.md)
3. [Project Structure](./project-structure.md)
4. [Database](./database.md)
5. [Authentication](./authentication.md)
6. [Roles & Permissions](./roles-permissions.md)
7. [API Overview](./api-overview.md)
8. [Setup Guide](./setup-guide.md)
9. [Environment Variables](./environment.md)
10. [Coding Guidelines](./coding-guidelines.md)
11. [Git Workflow](./git-workflow.md)

---

## Quick start

```bash
# 1) Install dependencies
npm install

# 2) Create .env (see docs/environment.md)
cp .env.example .env  # if available, otherwise create manually

# 3) Run migrations
npm run prisma:migrate

# 4) Seed default roles + permissions
npm run prisma:seed

# 5) Bootstrap super admin (optional but recommended for admin APIs)
npm run bootstrap:super-admin

# 6) Start dev server
npm run start:dev
```

Base API URL (default):

- `http://localhost:3000/api/v1`

Swagger UI (default):

- `http://localhost:3000/docs`

For complete installation details, see [Setup Guide](./setup-guide.md).
