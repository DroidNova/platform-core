# Roles and Permissions

This project uses **both roles and permissions** for authorization.

## Role vs Permission

## Role

A role is a high-level label/group, such as:

- `SUPER_ADMIN`
- `ADMIN`
- `USER`

Roles are easy to reason about and assign.

## Permission

A permission is a fine-grained capability, such as:

- `users.read`
- `users.update`
- `roles.assign`

Permissions are precise and map directly to protected actions.

---

## Why we use both

Using only roles becomes rigid over time.

Example problem:

- Two admins both have role `ADMIN`
- But one should update users and the other should only read

If we use role + permission:

- Role gives broad grouping
- Permission gives exact action control

This improves security and operational flexibility.

---

## Data model summary

- `Role` table stores role definitions
- `Permission` table stores action definitions
- `RolePermission` maps permissions to each role
- `UserRole` maps roles to each user

At runtime, user permissions are derived from assigned roles.

---

## How permissions are checked

1. User authenticates and gets access token
2. JWT strategy loads user + roles + rolePermissions
3. Request user context includes `roles[]` and `permissions[]`
4. `PermissionsGuard` reads required permissions from route metadata
5. Guard allows request only if all required permissions are present

In this codebase, `@Permissions('...')` decorator defines required permissions at endpoint level.

---

## How guards work

## `JwtAuthGuard`

- Verifies access token and authentication state
- Blocks anonymous/invalid requests

## `PermissionsGuard`

- Checks endpoint-required permissions
- Compares required permissions with request user permissions
- Uses `every` match semantics in this implementation

## `RolesGuard`

- Available in common layer
- Checks role metadata if used on routes
- Useful for high-level role restrictions

---

## How admin APIs are protected

Admin controller uses:

- `@UseGuards(JwtAuthGuard, PermissionsGuard)` at controller level
- `@Permissions(...)` per endpoint

Examples:

- `GET /admin/users` requires `users.read`
- `PATCH /admin/users/:id/status` requires `users.update`
- `POST /admin/users/:id/roles` requires `roles.assign`

So a valid token alone is not enough; user must also have specific permissions.

---

## Practical assignment strategy

Recommended operational pattern:

- Keep number of roles small and meaningful
- Attach granular permissions to roles
- Assign roles to users through admin APIs
- Avoid hardcoding permission logic in random services

This keeps authorization centralized and auditable.
