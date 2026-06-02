# Project Structure

This document explains how the source code is organized and why the separation matters.

## Top-level source layout

Primary code lives in `src/`.

```text
src/
  common/
  config/
  prisma/
  modules/
    platform-core/
    domain/ (future)
  app.module.ts
  main.ts
```

---

## `src/common/`

Shared building blocks used across modules.

Typical contents in this project:

- `decorators/` → metadata decorators (`@Permissions`, `@Roles`)
- `guards/` → authorization checks (roles/permissions guards)
- `filters/` → global exception formatting
- `interceptors/` → logging + standardized success responses
- `dto/` → shared DTOs (pagination)
- `utils/` and `types/` → reusable helpers and types

### Why this separation exists

If a utility is used by multiple modules, it should not live inside one module. `common/` prevents duplication and circular dependencies.

---

## `src/config/`

Reserved for configuration modules and config-provider patterns.

In this codebase, environment values are currently read directly where needed (for example in auth strategy/service and bootstrap scripts), but this folder exists to support future centralized config patterns.

### Why keep it

It creates a clear location for future growth (feature flags, external provider configs, environment mapping, etc.).

---

## `src/prisma/`

Application-level Prisma wiring.

- `prisma.module.ts` exposes Prisma integration to Nest modules
- `prisma.service.ts` manages lifecycle and DB client access

### Why this separation exists

Business modules should not initialize DB clients directly. A dedicated Prisma layer keeps DB lifecycle concerns centralized.

---

## `src/modules/`

Feature modules are grouped by product boundary. Reusable foundation modules live under `src/modules/platform-core/`. Future domain-specific products can add a sibling folder such as `src/modules/domain/` so product code stays separate from the reusable platform foundation.

Each module generally contains:

- `*.module.ts` (wiring)
- `*.controller.ts` (HTTP layer)
- `*.service.ts` (business logic)
- `dto/` (input contracts)
- optional `guards/`, `strategies/`, `types/`

### Current module organization

Core modules are stored under `src/modules/platform-core/`:

- `platform-core/auth/` → register/login/refresh/logout/me
- `platform-core/admin/` → protected user management endpoints
- `platform-core/users/` → user-domain operations
- `platform-core/roles/` and `platform-core/permissions/` → access-control data
- `platform-core/sessions/` → session-domain operations
- `platform-core/health/` → health checks
- `platform-core/settings/` → settings endpoints

For future domain websites, create a sibling group such as `src/modules/domain/` and place product-specific modules there.

### Why module boundaries matter

- Easier onboarding (feature code grouped together)
- Safer refactoring (changes isolated by module)
- Better ownership (teams can own modules)

---

## Naming conventions

Use consistent names so developers can predict where code belongs.

- Files: kebab-case (e.g., `auth-response.dto.ts`)
- Classes: PascalCase (e.g., `AuthService`)
- DTOs: suffix with `Dto` (e.g., `RegisterDto`)
- Guards: suffix with `Guard` (e.g., `PermissionsGuard`)
- Services: suffix with `Service`
- Controllers: suffix with `Controller`

### API route naming

- Route groups are resource-based (`auth`, `admin/users`)
- Use nouns for resources, verbs only when action-specific (`refresh`, `logout`)

---

## Request lifecycle (high-level)

1. Controller receives request
2. Validation pipe validates/transforms DTO
3. Guards check auth/permissions
4. Service executes business logic
5. Prisma persists/queries data
6. Interceptor wraps success response
7. Exception filter formats errors consistently

This shared lifecycle keeps behavior predictable across all modules.
