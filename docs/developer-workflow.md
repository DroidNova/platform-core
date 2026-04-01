# Developer Workflow Guide (platform-core)

This guide explains how to run and maintain the **platform-core** NestJS backend in day-to-day development.

It is written for:
- new developers
- interns
- backend developers
- QA engineers who need to test APIs

---

## 1) Project startup overview

Before you can run this project locally, make sure these pieces are ready:

### Node.js
- Install **Node.js LTS** (Node 20+ recommended).
- Why: NestJS, Prisma CLI, scripts, and TypeScript build tools all run on Node.

### npm
- npm is included with Node.js.
- Why: all project dependencies and scripts are managed with npm.

### PostgreSQL
- You need a running PostgreSQL instance (local, Docker, or remote).
- Why: the app stores users, roles, sessions, permissions, and other domain data in PostgreSQL.

### Environment variables
- You must provide environment values in a `.env` file.
- Critical values include:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `JWT_ACCESS_EXPIRES_IN`
  - `JWT_REFRESH_EXPIRES_IN`
  - `SUPER_ADMIN_FULL_NAME`
  - `SUPER_ADMIN_EMAIL`
  - `SUPER_ADMIN_PHONE`
  - `SUPER_ADMIN_PASSWORD`
- Why: application startup, auth, seeding, and bootstrap scripts depend on these values.

---

## 2) First-time project setup (step-by-step)

Follow these steps in order the first time you set up the project.

### Step 1: Clone the repository
```bash
git clone <repo-url>
cd platform-core
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create `.env` from `.env.example`
If `.env.example` exists:
```bash
cp .env.example .env
```

Then edit `.env` with your local values.

If `.env.example` does not exist in your clone, create `.env` manually with the required keys.

### Step 4: Configure PostgreSQL
Create a local database (example):
```sql
CREATE DATABASE platform_core_dev;
```

Set `DATABASE_URL` in `.env`, for example:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/platform_core_dev"
```

### Step 5: Generate Prisma client
```bash
npx prisma generate
```

### Step 6: Run Prisma migrations
```bash
npx prisma migrate dev
```

This creates/updates database tables based on migration history.

### Step 7: Seed base roles/permissions
```bash
npm run prisma:seed
```

### Step 8: Bootstrap super admin user
```bash
npm run bootstrap:super-admin
```

### Step 9: Start the server
```bash
npm run start:dev
```

Default local URLs:
- API base: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`

---

## 3) Daily development commands

Use these commands regularly during development.

### `npm install`
Installs dependencies from `package.json`.

Use when:
- first setup
- after pulling changes that modified dependencies

### `npm run start:dev`
Starts NestJS in watch mode (auto-restarts on code changes).

Use when:
- active coding
- local API testing

### `npm run build`
Compiles TypeScript into `dist/` for production-style build validation.

Use when:
- checking compile health before commit/PR

### `npm run lint`
Runs ESLint (configured with `--fix` in this project).

Use when:
- before commit
- after major refactors

### `npm run test`
Runs unit/integration tests configured through Jest.

Use when:
- validating behavior after code changes

### `npx prisma generate`
Regenerates Prisma client from `prisma/schema.prisma`.

Use when:
- schema changes
- client seems outdated

### `npx prisma migrate dev`
Creates/applies migrations in development.

Use when:
- you changed Prisma models and need DB updates

### `npm run prisma:seed`
Runs seed script to upsert roles, permissions, and role-permission mapping.

Use when:
- first setup
- you changed permission catalog

### `npm run bootstrap:super-admin`
Creates or updates super admin identity and role assignment.

Use when:
- first local setup
- resetting admin access for test environments

---

## 4) Prisma usage guide

### What Prisma is
Prisma is the ORM/tooling layer that connects this TypeScript backend to PostgreSQL with:
- schema-driven modeling
- generated type-safe client
- migration history

### Where `schema.prisma` is located
`prisma/schema.prisma`

### How models map to database tables
Each `model` in `schema.prisma` maps to a PostgreSQL table.
Examples:
- `User` model -> `User` table
- `Role` model -> `Role` table
- `Session` model -> `Session` table
- join models (`UserRole`, `RolePermission`) -> join tables

Fields map to columns, relations define foreign keys, and `@@index` / `@@unique` define DB indexes and constraints.

### How to update schema
1. Edit `prisma/schema.prisma`.
2. Save model/field/relation changes.
3. Create/apply migration with `npx prisma migrate dev`.
4. Regenerate client with `npx prisma generate` (usually automatic, but safe to run explicitly).

### How to generate client
```bash
npx prisma generate
```
Generated client output is configured under `src/generated/prisma`.

### How to create and run migrations
```bash
npx prisma migrate dev --name <describe_change>
```
Example:
```bash
npx prisma migrate dev --name add-user-status-index
```

### When to use `migrate dev`
Use `migrate dev` in local/development workflows when evolving schema.

Do **not** skip migrations after schema changes. The schema file and DB state must stay aligned.

### How seed works
`npm run prisma:seed` runs `prisma/seed.ts`.

It upserts:
- roles (`SUPER_ADMIN`, `ADMIN`, `USER`)
- permissions
- role-permission assignments

It is designed to be repeatable (safe to re-run in dev).

---

## 5) Database workflow

### How PostgreSQL is connected via `DATABASE_URL`
The app and Prisma use `DATABASE_URL` from `.env` to connect to PostgreSQL.

Typical format:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
```

### How schema changes are applied
1. Update `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration_name>`.
3. Prisma creates SQL migration files under `prisma/migrations/`.
4. Migration is applied to local DB.

### Safe workflow before changing DB structure
Before changing DB schema:
1. Pull latest branch changes.
2. Ensure local migration history is clean.
3. Back up any important local data if needed.
4. Make small, focused schema changes.
5. Generate a clearly named migration.
6. Test app flows affected by the change.

### Example migration workflow
```bash
# 1) Edit schema
# (update prisma/schema.prisma)

# 2) Create + apply migration
npx prisma migrate dev --name add-session-ip-index

# 3) Regenerate client (safe explicit step)
npx prisma generate

# 4) Run tests/lint
npm run lint
npm run test
```

---

## 6) Swagger usage guide

### What Swagger is
Swagger UI is interactive API documentation generated from NestJS decorators and DTO metadata.

### Why we use it
- Fast API exploration
- Shared contract visibility for backend, frontend, and QA
- Easy manual endpoint testing without writing custom client code

### Docs URL
When server is running:
- `http://localhost:3000/docs`

### How to test APIs from Swagger
1. Start server (`npm run start:dev`).
2. Open `/docs`.
3. Expand an endpoint section.
4. Click **Try it out**.
5. Fill request body/path/query values.
6. Click **Execute**.
7. Review status code and response payload.

### How to add Bearer token for protected endpoints
1. Login to get an access token.
2. Click **Authorize** in Swagger.
3. Enter token as: `Bearer <access_token>` (or just token if UI expects raw value).
4. Confirm authorization.
5. Call protected endpoints.

### How frontend team can use Swagger
Frontend developers can use Swagger to:
- inspect endpoint paths and request/response structures
- validate required fields
- verify auth requirements
- test integration assumptions before wiring UI flows

---

## 7) Auth testing workflow

Use this sequence when validating authentication behavior.

### 1. Register user
Call `POST /api/v1/auth/register` with required fields.

### 2. Login
Call `POST /api/v1/auth/login` with `emailOrPhone` + `password`.

### 3. Copy access token
From login response, copy `accessToken`.

### 4. Authorize in Swagger
Use **Authorize** button and add the bearer token.

### 5. Test protected routes
Try endpoints that require JWT, such as `GET /api/v1/auth/me` and admin-protected routes (role/permission dependent).

### 6. Test refresh token flow
- Call `POST /api/v1/auth/refresh` with the refresh token.
- Confirm new access token (and rotated refresh token) is returned.
- Re-test protected endpoint with new access token.

### 7. Logout
Call `POST /api/v1/auth/logout` with refresh token.

After logout:
- refresh token should no longer be valid for future refresh calls

---

## 8) Seed and bootstrap explanation

### What seed does
Seed (`npm run prisma:seed`) initializes authorization foundation data:
- roles
- permission records
- role-permission mappings

### What bootstrap super admin does
Bootstrap (`npm run bootstrap:super-admin`) ensures there is a super admin user and role assignment using environment values.

### When to run each one
- Run **seed** when permissions/roles need baseline setup or refresh.
- Run **bootstrap super admin** when you need an admin account for local/manual testing.

### Why they are separate
They solve different problems:
- seed = shared catalog/configuration data
- bootstrap = environment-specific administrative identity

Separating them keeps workflows safer and clearer across dev/staging/prod.

---

## 9) Common troubleshooting

### Problem: Database connection failed
Possible causes:
- PostgreSQL not running
- wrong host/port/user/password
- invalid `DATABASE_URL`

Fix:
1. Check PostgreSQL service status.
2. Validate `DATABASE_URL` format and credentials.
3. Test DB connection manually with your SQL client.

### Problem: Migration error
Possible causes:
- schema drift
- conflicting migration history
- invalid SQL generated by a complex change

Fix:
1. Pull latest migrations.
2. Re-run `npx prisma migrate dev`.
3. If needed, reset local DB only (dev environments) and re-apply migrations.

### Problem: Prisma client outdated
Symptoms:
- TypeScript errors for Prisma model fields
- runtime errors after schema changes

Fix:
```bash
npx prisma generate
```
Restart dev server after generation.

### Problem: Port already in use
Symptoms:
- app fails to bind on `3000`

Fix options:
- stop the conflicting process
- or run API with a different port:
```bash
PORT=3001 npm run start:dev
```

### Problem: Swagger not opening
Possible causes:
- server not running
- wrong URL/path
- startup failure before Swagger setup

Fix:
1. Confirm app boots successfully in terminal.
2. Open `http://localhost:3000/docs`.
3. Confirm no local proxy/firewall issue.

### Problem: Auth token not working
Possible causes:
- expired token
- malformed `Authorization` header
- used refresh token instead of access token on protected routes

Fix:
1. Login again to get fresh access token.
2. Ensure header format is `Bearer <access_token>`.
3. For expired access token, use refresh flow then retry.

---

## 10) Best practices

- **Always run migrations after schema changes.**
  - Why: keeps DB and code in sync for everyone.

- **Keep `.env` secrets private.**
  - Why: leaked JWT/db secrets are security incidents.

- **Do not edit generated Prisma client manually.**
  - Why: generated files are overwritten by `prisma generate`.

- **Test protected APIs via Swagger or Postman.**
  - Why: catches auth header, role, and permission issues early.

- **Keep commits small and clear.**
  - Why: easier reviews, safer rollbacks, cleaner history.

---

## 11) Quick command reference

```bash
# Install dependencies
npm install

# Start dev server
npm run start:dev

# Build project
npm run build

# Lint code
npm run lint

# Run tests
npm run test

# Prisma: generate client
npx prisma generate

# Prisma: create/apply migrations in dev
npx prisma migrate dev

# Seed roles/permissions
npm run prisma:seed

# Ensure super admin account exists
npm run bootstrap:super-admin
```

---

If you are new to the project, follow Section 2 exactly once, then use Section 3 + Section 11 for daily work.
