# Platform Core

Reusable NestJS backend core that can be used as a foundation for future domain products.

## Purpose

`platform-core` is a generic backend template focused on:

- authentication and authorization foundations
- roles/permissions/session management
- consistent API response handling
- Prisma + PostgreSQL baseline setup
- operational readiness (validation, logging, docs, bootstrap scripts)

> This repository intentionally avoids domain-specific business modules so it remains reusable. Core modules live under `src/modules/platform-core`; future domain modules should be added as sibling groups such as `src/modules/domain`.

## Tech Stack

- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT authentication

## API Conventions

- Global API prefix: `/api/v1`
- Swagger docs: `/docs`
- Global success response envelope (for standard JSON responses)
- Global exception filter response envelope

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create a `.env` file and set at least:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000

SUPER_ADMIN_FULL_NAME=Platform Super Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PHONE=+10000000000
SUPER_ADMIN_PASSWORD=ChangeThisStrongPassword
```

## Run the Project

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

## Database Workflow

### Generate Prisma client

```bash
npm run prisma:generate
```

### Run migrations

```bash
npm run prisma:migrate
```

### Seed initial data

```bash
npm run prisma:seed
```

### Bootstrap super admin

```bash
npm run bootstrap:super-admin
```

The bootstrap command is idempotent and uses:

- `SUPER_ADMIN_FULL_NAME`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PHONE`
- `SUPER_ADMIN_PASSWORD`

## Testing

```bash
npm run test
npm run test:e2e
```

## API Documentation

After the app is running:

- Swagger UI: `http://localhost:3000/docs`
- Base API URL: `http://localhost:3000/api/v1`
