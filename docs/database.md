# Database

## Why PostgreSQL?

PostgreSQL is used because the platform needs strong relational consistency for identity and access control data.

Key reasons:

- Users, roles, permissions, and sessions are relational by nature
- We need constraints (unique email/phone, role mappings, etc.)
- Reliable transactional behavior is important for auth/admin flows
- Mature indexing and performance for growth

---

## Why Prisma?

Prisma gives this project:

- Type-safe database access in TypeScript
- Schema-defined models and migrations
- Cleaner developer workflow for evolving DB structure

For a growing team, this reduces runtime query mistakes and speeds onboarding.

---

## Core models

This section focuses on the main models requested.

## 1) `User`

Represents a person/account that can authenticate.

Important fields:

- `id` (UUID primary key)
- `fullName`
- `email` (unique, optional)
- `phone` (unique, optional)
- `passwordHash` (never store plain passwords)
- `status` (`ACTIVE | INACTIVE | SUSPENDED`)
- verification flags and timestamps

Relations:

- One user → many `UserRole` rows
- One user → many `Session` rows

---

## 2) `Role`

Represents a grouped access profile (e.g., `SUPER_ADMIN`, `ADMIN`, `USER`).

Important fields:

- `name` is unique
- optional description

Relations:

- One role → many `UserRole` rows
- One role → many `RolePermission` rows

---

## 3) `UserRole` (join table)

`UserRole` connects users and roles (many-to-many relationship).

Why a join table is used:

- A user can have multiple roles
- A role can be assigned to many users
- Future metadata can be stored on assignment (e.g., assignment source/time already partly modeled)

Constraints:

- Unique pair `[userId, roleId]` prevents duplicate assignments
- Indexes on foreign keys for lookup performance

---

## 4) `Session`

Represents a refresh-token session for a user login context.

Important fields:

- `userId`
- `refreshTokenHash`
- optional `deviceName`, `ipAddress`, `userAgent`
- `expiresAt`

Why sessions exist:

- Track active login states per user/device
- Support refresh-token rotation
- Enable targeted logout/session invalidation

---

## Additional access-control models (important context)

Although your focus is User/Role/UserRole/Session, this codebase also has:

- `Permission`
- `RolePermission` (join table Role ↔ Permission)

These are essential for fine-grained admin authorization.

---

## Relationship summary

```text
User 1 --- * UserRole * --- 1 Role
Role 1 --- * RolePermission * --- 1 Permission
User 1 --- * Session
```

This structure supports both broad role-based access and fine-grained permission checks.

---

## Why we hash refresh tokens

Refresh tokens are long-lived and powerful. If leaked in plain form from DB, an attacker can generate new access tokens.

So we:

- Store only `refreshTokenHash`
- Compare incoming token with bcrypt compare
- Rotate refresh tokens on each refresh

This follows the same security principle as password hashing.

---

## How sessions work (practical lifecycle)

1. User logs in successfully
2. Access + refresh JWT tokens are generated
3. Refresh token hash is stored in `Session`
4. On refresh request:
   - Verify refresh JWT signature
   - Load active sessions
   - Compare provided token with stored hashes
   - Rotate token and update session hash + expiry
5. On logout:
   - Locate matching session by hash
   - Delete that session

This design balances security and user experience.
