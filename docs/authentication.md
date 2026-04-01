# Authentication

This project uses JWT-based authentication with session-backed refresh-token rotation.

## Core goals of this auth design

- Keep API authentication stateless for normal requests (access token)
- Keep long-lived login continuity secure (refresh token + hashed session storage)
- Make token misuse harder through rotation and validation rules

---

## Auth endpoints

Under global prefix `/api/v1`:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

---

## Full auth flow

## 1) Register

**Input**: full name, password, and either email or phone.

What happens:

- Input is validated via DTO rules
- Email/phone uniqueness checks are performed
- Password is hashed with bcrypt
- User is created
- Default `USER` role is assigned if role exists
- Safe user object is returned (without password hash)

Why this approach:

- Avoid duplicate identity records
- Ensure credentials are never persisted in plain text

---

## 2) Login

**Input**: `emailOrPhone`, `password`, optional `deviceName`.

What happens:

- User is found by email or phone
- Password is verified via bcrypt compare
- User must be `ACTIVE`
- Access token + refresh token are generated
- Session row is created/updated with hashed refresh token and expiry

Why this approach:

- Separates short-lived auth (access token) from long-lived continuity (refresh token)
- Creates session traceability per login context

---

## 3) Access token usage

Client sends:

```http
Authorization: Bearer <access_token>
```

Used for protected APIs like `/auth/me` and admin routes.

Validated by JWT strategy:

- Signature and expiry are checked
- User must still exist and be `ACTIVE`
- Roles and permissions are loaded into request context

---

## 4) Refresh token flow

When access token expires, client sends refresh token to `/auth/refresh`.

What happens:

- Refresh token signature is verified with refresh secret
- Active, non-expired sessions are loaded
- Provided token is compared against hashed session tokens
- On match: new access + refresh tokens are issued
- Refresh hash is rotated in DB

Why rotation matters:

- Limits replay window if a token is stolen
- Ensures old refresh tokens become obsolete quickly

---

## 5) Logout

Client sends refresh token to `/auth/logout`.

What happens:

- System tries to identify matching session by comparing token hash
- Matching session is deleted
- Success response is returned even if token already invalid (safe/idempotent behavior)

---

## 6) Session storage model

Session table stores:

- hashed refresh token
- user linkage
- expiry time
- optional device/user agent metadata

This allows token revocation and auditing without storing sensitive raw tokens.

---

## Why access token is short-lived

Short-lived access tokens reduce risk.

If an access token leaks:

- Its usable window is small
- Attacker cannot keep using it for long

The refresh mechanism then provides continuity for legitimate clients.

---

## Why refresh token is stored hashed

A refresh token is equivalent to long-lived auth privilege. Storing it hashed means database leakage does not directly reveal reusable tokens.

Principle: **treat refresh tokens like passwords**.

---

## Security best practices implemented

- Strong validation via DTO + global `ValidationPipe`
- Password hashing using bcrypt
- Refresh token hashing in session table
- Token expiry enforcement
- Role/permission evaluation on protected requests
- Status checks (`ACTIVE` only) before granting auth context

Recommended operational additions (future hardening):

- Store IP address for sessions and anomaly checks
- Add brute-force protection/rate limits on login endpoints
- Add token family/reuse-detection strategy for advanced refresh protection

---

## Text flow diagram

```text
[Register]
Client -> /auth/register -> validate -> create user (hash password) -> assign USER role -> success

[Login]
Client -> /auth/login -> validate credentials -> create session (hash refresh token) -> return access+refresh

[Authorized API Call]
Client -> Bearer access token -> JwtStrategy validates -> route guard passes -> controller/service

[Refresh]
Client -> /auth/refresh (refresh token)
       -> verify refresh JWT
       -> find active session by hash match
       -> rotate refresh token hash
       -> return new access+refresh

[Logout]
Client -> /auth/logout (refresh token)
       -> find matching session
       -> delete session
       -> success
```
