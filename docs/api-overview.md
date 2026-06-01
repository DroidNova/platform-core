# API Overview

Base URL (default):

```text
http://localhost:3000/api/v1
```

All examples below omit the base prefix for readability.

---

## Standard response behavior

This project uses a global success interceptor and global exception filter, so responses are standardized.

When integrating from Flutter/web, always inspect:

- success data payload
- HTTP status code
- error payload shape from exception filter

(Exact wrapper fields may evolve; rely on HTTP status + payload content, not hardcoded assumptions.)

---

## Authentication endpoints

## `POST /auth/register`

### Purpose
Create a new user account.

### Request body

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "password": "StrongPass123"
}
```

Notes:

- `email` is optional
- `phone` is optional
- at least one of email or phone should be provided

### Response (example)

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "status": "ACTIVE",
    "roles": ["USER"],
    "permissions": []
  }
}
```

---

## `POST /auth/login`

### Purpose
Authenticate a user and issue tokens.

### Request body

```json
{
  "emailOrPhone": "jane@example.com",
  "password": "StrongPass123",
  "deviceName": "iPhone 15"
}
```

### Response (example)

```json
{
  "user": {
    "id": "uuid",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "status": "ACTIVE",
    "roles": ["USER"],
    "permissions": []
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "accessTokenExpiresIn": 900
  }
}
```

---

## `POST /auth/refresh`

### Purpose
Issue a new access/refresh token pair using a valid refresh token.

### Request body

```json
{
  "refreshToken": "<jwt_refresh_token>"
}
```

### Response
Same structure as login response (user + new tokens).

---

## `POST /auth/logout`

### Purpose
Invalidate the matching session.

### Request body

```json
{
  "refreshToken": "<jwt_refresh_token>"
}
```

### Response (example)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## `GET /auth/me`

### Purpose
Return current authenticated user profile.

### Headers

```http
Authorization: Bearer <access_token>
```

### Response

```json
{
  "id": "uuid",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "ACTIVE",
  "roles": ["USER"],
  "permissions": []
}
```

---

## Admin endpoints

All admin endpoints require:

- valid access token
- required permission(s)

Route base:

```text
/admin/users
```

## `GET /admin/users`

### Purpose
List users with pagination and optional search.

### Query params

- `page` (default 1)
- `limit` (default 10, max 100)
- `search` (optional)

Example:

```text
/admin/users?page=1&limit=10&search=jane
```

### Required permission

- `users.read`

### Response (example)

```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+15551234567",
      "status": "ACTIVE",
      "createdAt": "2026-04-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## `GET /admin/users/:id`

### Purpose
Get details for one user, including assigned roles.

### Required permission

- `users.read`

### Response (example)

```json
{
  "id": "uuid",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "ACTIVE",
  "createdAt": "2026-04-01T00:00:00.000Z",
  "updatedAt": "2026-04-01T00:00:00.000Z",
  "roles": ["USER"]
}
```

---

## `PATCH /admin/users/:id/status`

### Purpose
Update user status (ACTIVE / INACTIVE / SUSPENDED).

### Required permission

- `users.update`

### Request body

```json
{
  "status": "SUSPENDED"
}
```

### Response (example)

```json
{
  "id": "uuid",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "SUSPENDED",
  "updatedAt": "2026-04-01T00:00:00.000Z"
}
```

---

## `POST /admin/users/:id/roles`

### Purpose
Replace user role assignments with provided role list.

### Required permission

- `roles.assign`

### Request body

```json
{
  "roleNames": ["ADMIN", "USER"]
}
```

### Response
Returns same shape as `GET /admin/users/:id` with updated role names.

---

## Integration notes for Flutter/frontend

- Store access token in secure storage (never plain shared prefs)
- Use refresh token workflow when access token expires
- On refresh failure, force logout and redirect to login
- Handle 401/403 separately:
  - 401 = authentication invalid/expired
  - 403 = authenticated but not authorized
