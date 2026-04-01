# Tech Stack

This project uses a stack chosen for maintainability, developer speed, and production readiness.

## NestJS

**What it is:** A TypeScript-first backend framework for Node.js.

**Why we use it:**

- Enforces modular structure (modules, controllers, services)
- Built-in dependency injection makes code testable and clean
- Excellent fit for enterprise APIs and long-lived projects
- Strong ecosystem (guards, interceptors, pipes, Swagger integration)

In simple terms: NestJS gives us a predictable architecture so teams can scale code safely.

---

## Node.js

**What it is:** JavaScript/TypeScript runtime.

**Why we use it:**

- Efficient I/O model for API workloads
- Huge package ecosystem
- Great compatibility with NestJS, Prisma, and modern tooling

In simple terms: Node.js runs our server and handles HTTP requests efficiently.

---

## Prisma

**What it is:** Type-safe ORM and schema/migration tool.

**Why we use it:**

- Strong TypeScript integration and safer queries
- Clear schema-as-code approach
- Migration workflow helps track DB changes reliably
- Good developer experience for team onboarding

In simple terms: Prisma lets us work with the database in a safer, structured way.

---

## PostgreSQL

**What it is:** Relational database.

**Why we use it:**

- Excellent reliability and consistency
- Strong support for relational modeling (users, roles, permissions, sessions)
- Mature indexing/query performance
- Production-proven and widely supported

In simple terms: PostgreSQL is a solid, trustworthy database for structured business data.

---

## JWT (JSON Web Token)

**What it is:** Token format used for stateless authentication.

**Why we use it:**

- Access tokens allow fast auth checks per request
- Refresh tokens enable secure session continuation without repeated login
- Widely supported by mobile/web clients (including Flutter)

In simple terms: JWT lets clients prove identity without storing server-side auth state for every request.

---

## bcrypt

**What it is:** Password/token hashing library.

**Why we use it:**

- Passwords must never be stored as plain text
- Hashing refresh tokens reduces damage if DB data leaks
- Industry-standard approach for credential protection

In simple terms: bcrypt converts sensitive values into secure hashes so originals are not stored.

---

## class-validator (+ class-transformer)

**What it is:** Request validation/transformation libraries used with DTOs.

**Why we use it:**

- Rejects invalid request payloads early
- Keeps controllers/services clean
- Produces predictable API contracts
- Helps prevent subtle runtime bugs

In simple terms: validation makes sure incoming data is correct before business logic runs.

---

## Supporting tooling worth knowing

- **Swagger (`@nestjs/swagger`)** for API docs endpoint (`/docs`)
- **ESLint + Prettier** for code consistency
- **Jest** for testing
- **Prisma seed/bootstrap scripts** for environment initialization
