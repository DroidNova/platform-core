# Architecture

## 1) Architectural style: Modular Monolith

`platform-core` follows a **modular monolith** architecture.

That means:

- It runs as a single deployable backend service
- But internally it is split into clear modules (auth, admin, users, roles, etc.)
- Each module has focused responsibilities and can evolve independently

### Why this is good now

- Faster delivery for a small-to-mid engineering team
- Easier local development (one service, one database)
- Simpler operations compared to multi-service systems
- Better code discoverability for newcomers
- Lower infrastructure cost and complexity

---

## 2) Why we are NOT using microservices yet

Microservices can be useful, but introducing them too early usually creates avoidable overhead:

- Service-to-service communication complexity
- Distributed tracing and debugging challenges
- More deployment pipelines and runtime infrastructure
- Contract/version management between services

At this stage, core requirements (auth, user, role, permission, sessions) are tightly related and benefit from shared transactions and centralized ownership.

**Decision**: keep a modular monolith until there is proven scale/organizational pressure that justifies splitting services.

---

## 3) Layered repository strategy

The intended ecosystem has three layers:

## Layer A: `platform-core`

- The source of truth for reusable backend fundamentals
- Contains hardened auth, session, and authorization logic
- Should remain domain-agnostic when possible

## Layer B: `edutech-core` (future)

- Cloned/forked from `platform-core`
- Adds domain-level capabilities specific to education products
- Still reusable across multiple education clients

## Layer C: client repositories

- Product/client-specific customization
- UI-specific workflows, business exceptions, partner integrations
- Should reuse upstream core logic rather than rewriting it

---

## 4) Cloning strategy and propagation model

The expected propagation direction is:

1. Implement/fix reusable logic in `platform-core`
2. Propagate same commit(s) into `edutech-core`
3. Propagate into client repositories

This keeps lower layers aligned with core security and reliability improvements.

### Why this strategy exists

- Prevents bug divergence between projects
- Keeps security fixes consistent
- Reduces duplicate effort
- Provides predictable upgrade path

---

## 5) How bug fixes propagate

Recommended flow:

1. **Fix in `platform-core` first** (the root source)
2. Create a clear commit with a focused message
3. Use `git cherry-pick` in downstream repo(s)
4. Resolve conflicts with minimal domain-specific edits
5. Re-test downstream behavior

This avoids “fixing the same problem differently” in each repo.

---

## 6) Responsibility separation

To keep code healthy over time, separate responsibilities explicitly:

- **Core responsibility (`platform-core`)**
  - Authentication mechanisms
  - Session security model
  - Generic user lifecycle and access control rules
  - Shared backend conventions

- **Domain responsibility (`edutech-core`)**
  - Education-specific entities and workflows
  - Domain-level permission bundles
  - Product-family integrations

- **Client responsibility (client repos)**
  - Tenant/client-specific customization
  - Product behavior differences
  - External service wiring unique to that client

---

## 7) Practical rule for contributors

Before adding any feature, ask:

- Is this reusable by multiple projects? → implement in `platform-core`
- Is this reusable only by one domain family? → implement in `edutech-core`
- Is this specific to one client/product? → keep in client repo

This single rule prevents architectural drift.
