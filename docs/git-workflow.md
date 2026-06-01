# Git Workflow

This document defines how changes should flow across related repositories.

## Repository hierarchy

Expected ecosystem:

1. `platform-core` (base reusable backend)
2. `edutech-core` (future domain layer cloned from platform-core)
3. Client repositories (project-specific layer)

Direction of reuse:

```text
platform-core -> edutech-core -> client repos
```

---

## Core rule: fix upstream first

When a bug/issue is reusable across projects:

1. Fix it in `platform-core`
2. Merge and validate
3. Propagate to `edutech-core`
4. Propagate to client repos

Why this rule matters:

- Prevents repeated bug implementations
- Keeps security fixes consistent
- Avoids architecture drift

---

## Practical bug-fix propagation flow

## Step 1: implement in platform-core

- Create a focused branch (e.g., `fix/session-refresh-rotation`)
- Make minimal, tested change
- Commit with clear message

## Step 2: copy commit to downstream

In downstream repo:

```bash
git cherry-pick <commit_sha>
```

If conflicts happen:

- Resolve with minimal domain-specific adjustments
- Keep security/business logic aligned with upstream intent

## Step 3: verify downstream behavior

- Run tests/lint
- Run key manual API checks (auth/admin paths)

---

## Cherry-pick guidelines

Use cherry-pick when:

- The change is reusable and should stay semantically identical
- You want clear traceability to upstream commit

Avoid cherry-pick when:

- Downstream architecture differs significantly
- Change requires broad domain redesign

In those cases, re-implement intentionally while referencing upstream rationale.

---

## Branching recommendations

- `main` (or default branch): stable production-ready history
- Feature/fix branches: short-lived, focused scope

Branch naming examples:

- `feat/auth-session-audit`
- `fix/admin-role-validation`
- `docs/setup-guide-improvements`

---

## Commit message conventions

Use conventional style where possible:

```text
type(scope): short summary
```

Examples:

- `feat(auth): rotate refresh token on each refresh`
- `fix(admin): validate role names before assignment`
- `docs(project): add architecture and setup documentation`

Recommended types:

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

Commit quality rules:

- One logical change per commit
- Explain *what* and *why*
- Avoid vague messages like `update` or `changes`

---

## Pull request checklist (recommended)

Before opening PR:

- [ ] Change is in correct repo layer
- [ ] Lint/tests pass locally
- [ ] Docs updated if behavior changed
- [ ] Security-sensitive changes reviewed carefully
- [ ] Propagation plan to downstream repos identified (if needed)

This workflow keeps `platform-core` reliable as the source of truth.
