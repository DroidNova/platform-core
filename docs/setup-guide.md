# Setup Guide

This guide is intentionally beginner-friendly. Follow steps in order.

## 1) Prerequisites

Install the following first:

- **Node.js** (LTS recommended, e.g. 20.x or newer)
- **npm** (comes with Node.js)
- **PostgreSQL** (local or remote instance)
- **Git**

Optional but helpful:

- VS Code with TypeScript + ESLint extensions
- Postman/Insomnia for API testing

---

## 2) Clone and enter project

```bash
git clone <your-repo-url>
cd platform-core
```

---

## 3) Install dependencies

```bash
npm install
```

---

## 4) Configure PostgreSQL

Create a database for local dev, for example:

```sql
CREATE DATABASE platform_core_dev;
```

Make sure your PostgreSQL user has access to that database.

---

## 5) Configure environment variables

Create `.env` in project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/platform_core_dev"
JWT_ACCESS_SECRET="replace-with-strong-access-secret"
JWT_REFRESH_SECRET="replace-with-strong-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
SUPER_ADMIN_FULL_NAME="Platform Super Admin"
SUPER_ADMIN_EMAIL="admin@example.com"
SUPER_ADMIN_PHONE="+15550000000"
SUPER_ADMIN_PASSWORD="ChangeMe123!"
```

See [environment.md](./environment.md) for detailed explanations.

---

## 6) Generate Prisma client (if needed)

Usually automatic in some workflows, but safe to run explicitly:

```bash
npm run prisma:generate
```

---

## 7) Run migrations

```bash
npm run prisma:migrate
```

This creates/updates DB tables based on Prisma schema + migrations.

---

## 8) Seed roles and permissions

```bash
npm run prisma:seed
```

This seeds:

- Roles (`SUPER_ADMIN`, `ADMIN`, `USER`)
- Permission catalog
- Role-permission mappings

---

## 9) Bootstrap super admin user

```bash
npm run bootstrap:super-admin
```

This script:

- Creates `SUPER_ADMIN` role if missing
- Creates super admin user if not existing
- Assigns `SUPER_ADMIN` role
- Activates user if previously inactive

---

## 10) Start the server

Development mode:

```bash
npm run start:dev
```

App defaults:

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`

---

## 11) Verify setup quickly

Try these checks:

1. Open Swagger UI (`/docs`)
2. Call health endpoint (if exposed in your build)
3. Register/login using auth endpoints
4. Access `/auth/me` with Bearer token

---

## Common beginner issues and fixes

## Error: `DATABASE_URL is required`

- Ensure `.env` exists in project root
- Confirm variable name is exactly `DATABASE_URL`

## Migration fails with connection error

- Check PostgreSQL is running
- Verify host/port/user/password in `DATABASE_URL`

## JWT secret errors at startup

- Set both `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Do not use empty values

## Permission denied on admin routes

- Ensure authenticated user has required permissions
- For easiest local testing, use super-admin account
