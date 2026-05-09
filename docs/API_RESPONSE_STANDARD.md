# API Response Standard

## Success response
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

## Error response
```json
{
  "success": false,
  "message": "Readable message for frontend",
  "errorCode": "MACHINE_READABLE_ERROR_CODE",
  "errors": {}
}
```

`errors` is optional and primarily used for validation/field-level failures.

## Error codes
Source of truth: `src/common/constants/error-codes.constant.ts`

- `INVALID_CREDENTIALS`
- `SESSION_EXPIRED`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `BAD_REQUEST`
- `INTERNAL_SERVER_ERROR`

## Examples
### Login success
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {}
  }
}
```

### Invalid credentials
```json
{
  "success": false,
  "message": "Invalid username or password",
  "errorCode": "INVALID_CREDENTIALS"
}
```

### Session expired
```json
{
  "success": false,
  "message": "Your session has expired. Please login again.",
  "errorCode": "SESSION_EXPIRED"
}
```

### Validation error
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "email": ["Email is required", "Email must be valid"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Flutter integration guidance
- Use HTTP status for high-level flow (success/failure class).
- Use `errorCode` for exact behavior and messages.
- Frontend can copy/share constants from: `src/common/constants/error-codes.constant.ts`.

> Do not depend only on HTTP 401 for logout behavior.
>
> - `INVALID_CREDENTIALS`: show login form error.
> - `SESSION_EXPIRED`: logout and redirect to login.
> - `UNAUTHORIZED`: generic authentication issue.
> - `FORBIDDEN`: authenticated but no permission.
