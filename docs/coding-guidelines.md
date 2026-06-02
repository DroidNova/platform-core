# Coding Guidelines

These guidelines help maintain consistency, readability, and long-term maintainability.

## 1) DTO guidelines

DTOs are the contract between clients and backend.

Rules:

- Put endpoint input DTOs inside module `dto/` folders
- Use `class-validator` decorators for each field
- Use `class-transformer` only when transformation is necessary (e.g., pagination query numbers)
- Keep DTOs focused: one DTO per request shape
- Never expose sensitive fields in response DTOs

Example principles:

- `RegisterDto` validates full name, email/phone, password
- `ListAdminUsersDto` transforms `page` and `limit` to numbers

Why: strict DTOs prevent malformed requests and reduce service-level defensive code.

---

## 2) Service structure guidelines

Services should contain business logic, not HTTP concerns.

Do:

- Keep controllers thin; delegate to services quickly
- Normalize user input in service layer when needed
- Use Prisma queries with explicit `select/include`
- Throw meaningful Nest exceptions (`NotFoundException`, `ForbiddenException`, etc.)

Avoid:

- Putting heavy business rules in controllers
- Returning raw DB entities when sensitive fields exist

Why: clear service boundaries improve testing and refactoring safety.

---

## 3) Naming conventions

- Class names: PascalCase (`AuthService`, `AdminController`)
- File names: kebab-case (`update-user-status.dto.ts`)
- DTO classes: suffix `Dto`
- Guards: suffix `Guard`
- Types/interfaces: descriptive names (`JwtPayload`, `AuthenticatedUser`)

Endpoint naming:

- Use resource-oriented routes
- Keep actions explicit where needed (`/auth/refresh`, `/auth/logout`)

---

## 4) Error handling standards

Use framework-native exceptions in services.

Common mapping:

- Bad input/business rule violation → `BadRequestException`
- Duplicate resources → `ConflictException`
- Unauthorized credentials/token → `UnauthorizedException`
- Authenticated but forbidden action → `ForbiddenException`
- Missing record → `NotFoundException`

Why: consistent exception types lead to predictable API behavior.

---

## 5) Validation usage

Global validation is already enabled with:

- `whitelist: true`
- `transform: true`
- `forbidNonWhitelisted: true`

Contributor rules:

- Always define DTOs for input endpoints
- Add explicit validators (don’t rely on implicit assumptions)
- Prefer strict constraints (`MinLength`, `IsEnum`, `IsEmail`, etc.)

Why: this enforces API contracts and blocks unexpected payloads early.

---

## 6) Modular design rules

When adding features:

1. Create/extend reusable foundation features under `src/modules/platform-core`
2. Create domain-specific product features under a sibling group such as `src/modules/domain`
3. Keep module public API through controller(s)
4. Keep business logic in service(s)
5. Put shared/reusable concerns in `src/common`
6. Inject dependencies via constructor (avoid manual instantiation)

Do not:

- Mix unrelated domains in one module
- Add cross-module logic through copy/paste
- Bypass guards/validation for “quick fixes”

---

## 7) Security coding practices

- Never log passwords or raw tokens
- Hash passwords and refresh tokens before storage
- Validate user status before granting access
- Apply permission checks on admin-sensitive routes

---

## 8) Testing expectations (recommended)

Before merging meaningful changes:

- Run lint and tests
- Add/update tests for changed business behavior
- Verify auth/permission regressions manually when needed

This prevents accidental breakage in shared core logic.
