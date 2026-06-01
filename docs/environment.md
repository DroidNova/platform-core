# Environment Variables

This project relies on environment variables for security-sensitive and deployment-specific configuration.

## Why env variables are important

- Keep secrets out of source code
- Allow different values per environment (dev/staging/prod)
- Make deployments reproducible and safer

---

## Required variables

## `DATABASE_URL`

### What it does
Connection string used by Prisma to connect to PostgreSQL.

### Why needed
Without it, migrations, seed scripts, and runtime DB access cannot work.

### Example

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/platform_core_dev"
```

---

## `JWT_ACCESS_SECRET`

### What it does
Secret key for signing/verifying access tokens.

### Why needed
Access token validation must be cryptographically secure. If weak/leaked, attackers can forge tokens.

### Recommendation
Use a long random value in each environment.

---

## `JWT_REFRESH_SECRET`

### What it does
Secret key for signing/verifying refresh tokens.

### Why needed
Refresh tokens are high-impact; they should use a dedicated secret separate from access secret.

### Recommendation
Different from access secret, long and random.

---

## `JWT_ACCESS_EXPIRES_IN`

### What it does
Defines access token TTL (time to live).

### Accepted format
`<number><unit>` where unit is one of: `s`, `m`, `h`, `d`

Examples: `900s`, `15m`, `1h`

### Why needed
Short-lived access tokens reduce risk if stolen.

---

## `JWT_REFRESH_EXPIRES_IN`

### What it does
Defines refresh token/session TTL.

### Accepted format
Same format as access TTL, e.g. `30d`.

### Why needed
Controls how long a login can continue without re-entering credentials.

---

## `SUPER_ADMIN_FULL_NAME`

### What it does
Display name used by super-admin bootstrap script.

### Why needed
Allows reproducible admin account provisioning across environments.

---

## `SUPER_ADMIN_EMAIL`

### What it does
Email for bootstrap super-admin identity.

### Why needed
Script uses email/phone to find or create super-admin account.

---

## `SUPER_ADMIN_PHONE`

### What it does
Phone for bootstrap super-admin identity.

### Why needed
Provides alternate unique identifier and lookup path during bootstrap.

---

## `SUPER_ADMIN_PASSWORD`

### What it does
Initial password used when creating super-admin user.

### Why needed
Enables first login into admin-protected APIs/UI.

### Security notes

- Use strong password in non-local environments
- Rotate immediately after initial setup when appropriate
- Never commit real values into Git

---

## Recommended secret management practices

- Keep `.env` local only; never commit it
- Use secure secret managers in production
- Rotate JWT secrets periodically with a planned strategy
- Use different values for each environment
