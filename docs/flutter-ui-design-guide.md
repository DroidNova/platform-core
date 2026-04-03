# Flutter UI Design Guide (Platform Core)

## 1) Title and Purpose

### What this document is
This document is the **single source of truth for Flutter UI planning and backend integration** for the `platform-core` repository.

### Why it exists
This project is backend-first. If frontend work starts without a shared guide, teams can easily:
- design screens that do not match backend modules,
- assume wrong payload structures,
- build unstable auth handling,
- and duplicate architectural mistakes.

This guide prevents that by aligning Flutter decisions with the current NestJS + Prisma backend.

### Who should use it
- Flutter developers (mobile/web)
- UI/UX developers planning product flows
- Backend engineers reviewing frontend integration
- QA engineers validating API/UI behavior
- New team members, interns, and contractors
- Future ChatGPT/Codex sessions continuing Flutter work

### How it keeps Flutter aligned with backend
- Maps backend modules to UI features and screen responsibilities.
- Defines token/session handling rules based on existing auth APIs.
- Lists current API endpoints and expected frontend usage.
- Separates current platform scope from future domain scope (like `edutech-core`).

---

## 2) Current Project Status

### What is already built in backend
`platform-core` currently provides a generic, reusable backend foundation with:
- Authentication (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`)
- User/role/permission/session foundations
- Admin user management APIs (`/admin/users` and related actions)
- Health and settings status modules
- Shared response handling, validation, and pagination utilities
- PostgreSQL data layer managed via Prisma

### What is ready now
Ready for immediate Flutter integration:
- Full token-based auth flow (access + refresh)
- Protected route access using Bearer token
- Current-user context endpoint (`GET /auth/me`)
- Admin user listing/detail/update-role/status APIs
- Permission-guarded backend actions (e.g., `users.read`, `users.update`, `roles.assign`)

### What is not finalized yet
Still intentionally minimal or evolving:
- Advanced profile management flows
- Rich settings/preferences UI contract
- Complex session management UI
- Product/domain workflows (education/business-specific modules)
- Final design system decisions for frontend

### What is intentionally future scope (not `platform-core` scope)
Deferred for future domain repositories such as `edutech-core`:
- institute/organization hierarchy
- students/teachers/batches/courses
- advanced dashboards and analytics
- tenant/domain-specific business flows

---

## 3) Product Layering Overview (Frontend-Friendly)

| Layer | Purpose | Frontend Impact |
|---|---|---|
| `platform-core` | Generic backend base: auth, users, roles, permissions, admin, health, settings foundation | Flutter must build reusable base flows first (auth, profile, admin basics) |
| `edutech-core` (future) | Domain extension for education workflows | Flutter can later add domain feature modules without rewriting core auth/admin foundations |
| Client product (future) | Customized product layer (branding + specific requirements) | UI can apply custom themes, route exposure, and business screens on top of stable core modules |

### How Flutter should think about this
- Treat `platform-core` as the **base contract**.
- Build feature modules that can grow into `edutech-core` and client-specific products.
- Avoid hardcoding domain assumptions in the core Flutter structure.

---

## 4) Backend Modules Mapped for Frontend Understanding

### Module-to-UI mapping

| Backend Module | Functional Meaning | Possible Screens | Key User Interactions | Audience |
|---|---|---|---|---|
| Auth | Identity + login/session token lifecycle | Splash, Login, Register, Session-expired dialog, Logout action | Register, login, refresh session, logout, fetch current user | End-user + Admin |
| Users | Core user entity foundation | Profile (`/me`), User cards/tables (via admin views) | View user identity, status, contact data | End-user + Admin |
| Roles | Role foundation and assignment support | Role chips/dropdowns in admin user detail | Assign/update role sets (via admin action endpoint) | Admin-facing |
| Permissions | Fine-grained action authorization | UI visibility logic, admin-only actions | Conditionally show actions/pages based on permissions | Mostly Admin-facing |
| Sessions | Session lifecycle backend support | Account/session status panel (future), logout UX | Session invalidation, token refresh-linked behavior | End-user + Admin |
| Admin | User management operations | Admin user list/detail/status/roles screens | Search/list users, view details, update status, assign roles | Admin-facing |
| Health | Service readiness signal | Internal diagnostics/dev tools screen (optional) | Health ping/check | Mostly internal/dev |
| Settings | Platform config/status baseline | Settings status page (initially basic), later app settings | Read status/config, future settings actions | Mixed |

### Practical interpretation for UI teams
- Only Auth and Admin are currently rich enough for immediate feature screens.
- Users/Roles/Permissions/Sessions exist as backend foundations and should be reflected in UI architecture now, even if not all have end-user screens yet.

---

## 5) Flutter Frontend Vision

Recommended direction:
- Build one Flutter codebase that can target **Android, iOS, and Web**.
- Keep architecture **modular, testable, and scalable**.
- Organize frontend by **features/modules**, not by random screen files.
- Mirror backend module boundaries in frontend features to reduce integration drift.

### Design principle
If a backend module/API changes, the frontend impact should be isolated mostly to that feature module.

---

## 6) Recommended Flutter Project Structure

```text
lib/
  app/
    app.dart
    app_bootstrap.dart
    app_config.dart
  core/
    constants/
      api_constants.dart
      app_constants.dart
    theme/
      app_theme.dart
      spacing.dart
      typography.dart
      colors.dart
    utils/
      validators.dart
      formatters.dart
      result.dart
    network/
      api_client.dart
      dio_provider.dart
      interceptors/
        auth_interceptor.dart
        logging_interceptor.dart
        retry_interceptor.dart
      models/
        api_error.dart
        paginated_response.dart
    storage/
      secure_storage_service.dart
      local_storage_service.dart
    routing/
      app_router.dart
      route_names.dart
      route_guards.dart
    widgets/
      app_scaffold.dart
      app_loader.dart
      app_error_view.dart
      app_empty_state.dart
  features/
    auth/
      data/
        datasources/auth_remote_data_source.dart
        models/auth_user_api_model.dart
        models/auth_tokens_api_model.dart
        repositories/auth_repository_impl.dart
      domain/
        entities/auth_user.dart
        entities/session_tokens.dart
        repositories/auth_repository.dart
        usecases/
          login_usecase.dart
          register_usecase.dart
          refresh_token_usecase.dart
          logout_usecase.dart
          get_me_usecase.dart
      presentation/
        controllers/auth_controller.dart
        screens/splash_screen.dart
        screens/login_screen.dart
        screens/register_screen.dart
        widgets/auth_form.dart
    users/
      data/
      domain/
      presentation/
    admin/
      data/
        datasources/admin_remote_data_source.dart
        models/admin_user_api_model.dart
        repositories/admin_repository_impl.dart
      domain/
        entities/admin_user.dart
        repositories/admin_repository.dart
        usecases/
          get_admin_users_usecase.dart
          get_admin_user_detail_usecase.dart
          update_user_status_usecase.dart
          assign_user_roles_usecase.dart
      presentation/
        controllers/admin_users_controller.dart
        screens/admin_user_list_screen.dart
        screens/admin_user_detail_screen.dart
        widgets/user_status_chip.dart
        widgets/roles_assignment_panel.dart
    settings/
      data/
      domain/
      presentation/
  shared/
    models/
    widgets/
    extensions/
```

### Folder intent
- `app/`: entry-level app setup and environment composition.
- `core/`: cross-cutting primitives used by all features (network, storage, routing, theme, reusable widgets).
- `features/`: business features mapped to backend modules.
- `shared/`: reusable UI/domain components that do not belong to one feature only.

### Why feature-based is preferred
- Reduces coupling between unrelated screens.
- Makes API ownership clear by feature.
- Improves onboarding (new engineer can work in one feature slice).
- Supports future migration to `edutech-core` features without refactoring app foundation.

---

## 7) UI-to-Backend Sync Rules (Mandatory)

1. **Check Swagger/docs first** before coding UI integration.
2. **Backend DTO/response schema is source of truth** (not assumptions).
3. **Never guess field names** or response wrappers.
4. **Auth token flow must match backend auth contract**.
5. **Protected endpoints always require `Authorization: Bearer <accessToken>`**.
6. **Pagination UI must follow backend pagination shape** (page/limit/meta/items).
7. **Roles/permissions from backend must control UI visibility/access**.
8. **Backend changes require frontend updates immediately** (API model + mapper + UI logic).
9. Keep API model mapping isolated (do not leak raw response maps directly into widgets).
10. Track integration notes per endpoint in feature docs or code comments.

---

## 8) Authentication Flow for Flutter (Current Reality)

### End-to-end flow
1. **Register** via `POST /auth/register`.
2. **Login** via `POST /auth/login`.
3. Save returned:
   - access token (short-lived)
   - refresh token (longer-lived)
4. Send access token in `Authorization: Bearer ...` for protected APIs.
5. If access token expires and backend returns 401:
   - call `POST /auth/refresh` with refresh token,
   - store new tokens,
   - retry original protected request once.
6. Fetch current user context using `GET /auth/me` after login/refresh/app restore.
7. On logout, call `POST /auth/logout` and clear local auth/session state.

### Important current limitation
- Registration currently does **not** enforce real email/phone verification flow.
- Verification behavior is intentionally deferred to future product/domain decisions.

Frontend implication:
- Do not build mandatory OTP/verification gate as a core requirement in this phase.
- Keep architecture ready to add verification later as optional/feature-flagged flow.

---

## 9) Recommended Flutter Auth Implementation Guidance

### HTTP client
- Use `Dio` (or equivalent with interceptors, request retry, cancellation support).

### Interceptor strategy
- Request interceptor: attach access token automatically.
- Response interceptor: detect 401 -> trigger refresh flow.
- Queue refresh calls to avoid parallel refresh race conditions.

### Token storage
- Store refresh token in secure storage (`flutter_secure_storage` or platform-secure equivalent).
- Access token can be in memory + optionally persisted securely depending on UX requirements.

### Model layering
- Keep separation:
  - API models (exact backend structure)
  - Domain models (app-friendly entities)
  - UI view models/state models

### State ownership
- Centralize auth/session state in controller/notifier/bloc/cubit/provider.
- Expose simple state signals to UI:
  - authenticated
  - unauthenticated
  - refreshing
  - authError

---

## 10) Screen Planning (Initial)

### A) Public/Auth screens

| Screen | Purpose | Backend Dependency | Required API(s) | Expected Data | Possible Actions |
|---|---|---|---|---|---|
| Splash | Decide app entry based on token/session state | Auth + storage state | `POST /auth/refresh` (conditional), `GET /auth/me` | current user + token validity | navigate to login or protected shell |
| Login | Authenticate existing user | Auth module | `POST /auth/login` | user + access/refresh tokens | submit credentials, handle error states, navigate after success |
| Register | Create new account | Auth module | `POST /auth/register` | created user + tokens (based on response) | submit registration form, validation errors, route to app/login |

### B) Authenticated/Common screens

| Screen | Purpose | Backend Dependency | Required API(s) | Expected Data | Possible Actions |
|---|---|---|---|---|---|
| Dashboard/Home (placeholder) | Landing screen after auth | Auth context | `GET /auth/me` | user identity, roles, permissions | quick navigation to profile/admin (if allowed) |
| Profile / Me | Show currently logged-in user context | Auth/User foundation | `GET /auth/me` | id, fullName, email, phone, status, roles, permissions | refresh profile, show role badges |
| Logout action | End session securely | Auth + sessions | `POST /auth/logout` | success state | revoke session, clear tokens, navigate to login |

### C) Admin screens

| Screen | Purpose | Backend Dependency | Required API(s) | Expected Data | Possible Actions |
|---|---|---|---|---|---|
| Admin User List | Search/browse users | Admin + permissions | `GET /admin/users` | paginated user list + meta | search, paginate, open user detail |
| Admin User Detail | Inspect one user profile | Admin | `GET /admin/users/:id` | user detail fields + current status/roles | update status, assign roles |
| Update User Status (panel/dialog) | Change account state | Admin permissions (`users.update`) | `PATCH /admin/users/:id/status` | updated user status payload | activate/suspend/deactivate user |
| Assign Roles (panel/dialog) | Attach roles to user | Admin permissions (`roles.assign`) | `POST /admin/users/:id/roles` | updated role list | add/remove role assignments |

---

## 11) API Sync Reference (Frontend-Oriented)

> Base prefix (default in backend docs): `/api/v1`

### Auth API reference

| Endpoint | Why UI needs it | When to call | Screen/Action | Auth Required | Response data frontend should care about |
|---|---|---|---|---|---|
| `POST /auth/register` | Create account | On register submit | Register screen | No | created user context, initial tokens (if returned), status message |
| `POST /auth/login` | Start authenticated session | On login submit | Login screen | No | `user`, `tokens.accessToken`, `tokens.refreshToken`, expiry info |
| `POST /auth/refresh` | Renew expired session | On 401/expiry or app resume check | Interceptor/session restore | No (uses refresh token in body) | new token pair + user context |
| `POST /auth/logout` | Invalidate session | On explicit logout or forced sign-out cleanup | Profile menu/logout button | Usually yes (plus refresh token payload) depending on backend behavior | logout success confirmation |
| `GET /auth/me` | Get current user and authorization context | After login, on app launch, after refresh | Splash, profile, route guard bootstrapping | Yes (Bearer token) | id, status, roles, permissions, identity fields |

### Admin API reference

| Endpoint | Why UI needs it | When to call | Screen/Action | Auth Requirement | Important response data |
|---|---|---|---|---|---|
| `GET /admin/users` | List/filter users for management | Admin list load, search, pagination changes | Admin User List | Bearer + `users.read` permission | `items`, pagination meta, user summary fields |
| `GET /admin/users/:id` | View full user details | Open user detail page | Admin User Detail | Bearer + `users.read` permission | user profile, status, role-related fields |
| `PATCH /admin/users/:id/status` | Update account status | On status change confirmation | Status update dialog/action | Bearer + `users.update` permission | updated `id`, `status`, server confirmation message |
| `POST /admin/users/:id/roles` | Assign/update user roles | On role assignment save | Assign roles action | Bearer + `roles.assign` permission | updated roles list for selected user |

---

## 12) Role and Permission Impact on UI

### Core rule
Frontend visibility is a UX convenience; backend authorization is the final authority.

### What frontend should use roles/permissions for
- Menu visibility (hide admin navigation for non-admin users)
- Route access checks (block navigation to admin routes)
- Action-level visibility (hide “Assign Role” without `roles.assign`)
- Conditional UI sections (admin panels, moderation tools)

### Example patterns
- If `permissions` includes `users.read`, show “User Management” menu.
- If `permissions` includes `users.update`, show status toggle controls.
- If `permissions` does not include `roles.assign`, keep roles section read-only.

Even if hidden in UI, backend may still reject unauthorized requests, and UI must handle 403 gracefully.

---

## 13) Suggested Route/Navigation Planning for Flutter

### Recommended high-level route map

```text
/splash
/auth/login
/auth/register
/app                (protected shell)
/app/home
/app/profile
/app/settings
/app/admin/users
/app/admin/users/:id
```

### Example guard-oriented pseudo configuration

```dart
final routes = [
  Route(path: '/splash', builder: SplashScreen.new),
  Route(path: '/auth/login', builder: LoginScreen.new),
  Route(path: '/auth/register', builder: RegisterScreen.new),
  GuardedRoute(
    path: '/app',
    guard: isAuthenticated,
    builder: AppShell.new,
    children: [
      Route(path: 'home', builder: HomeScreen.new),
      Route(path: 'profile', builder: ProfileScreen.new),
      Route(path: 'settings', builder: SettingsScreen.new),
      GuardedRoute(
        path: 'admin/users',
        guard: hasPermission('users.read'),
        builder: AdminUserListScreen.new,
      ),
    ],
  ),
];
```

### Guard simulation strategy in Flutter
- Auth guard: check if tokens exist + session is valid.
- Bootstrap guard: on app start, run refresh/me flow before entering protected shell.
- Permission guard: use role/permission data from `/auth/me` to allow/deny routes.
- Denied route behavior: redirect to safe route + show friendly “access denied” state.

---

## 14) State Management Guidance

Use any mature approach (e.g., Riverpod, Bloc/Cubit, Provider + ChangeNotifier) but keep structure consistent.

### Suggested state slices
- **Auth state**: login/register/logout/refresh actions, tokens lifecycle.
- **User session state**: current user (`/auth/me`), roles, permissions.
- **Admin users state**: paginated list, filters/search, selected user detail.
- **UI async state**: loading, success, empty, error per screen/action.

### Practical guidelines
- Keep network side effects in controller/use-case/repository layers, not widgets.
- Use immutable state models for predictable rebuilds.
- Keep one source of truth per feature for request status.
- Normalize error handling (domain-friendly messages + raw error logging).

---

## 15) UI Consistency and Design System Guidance

### Consistency basics
- Define global spacing scale (e.g., 4/8/12/16/24).
- Define typography tokens and semantic color roles.
- Reuse consistent form field and button variants.

### Validation alignment with backend
- Mirror DTO-level expectations in frontend validators (required/format/min length).
- Do not over-validate beyond backend contract unless product requires it.
- Show backend validation errors clearly at field/form level.

### Required UX states per screen
- Loading state (initial + action loading)
- Error state (recoverable retry path)
- Empty state (no data yet)
- Success feedback (snackbar/banner/inline confirmation)

### Reusable widgets to standardize early
- App scaffold/shell wrappers
- Primary/secondary button set
- Form input components with validation/error slot
- Standard table/list/card components
- Empty/error placeholder widgets

### Admin data display strategy
- Mobile: card list with key fields and action menu.
- Web/tablet: data table with sortable columns + row actions.
- Keep shared query/filter components across admin screens.

### Responsive approach
- Use adaptive layout breakpoints for mobile/tablet/web.
- Keep navigation adaptable (bottom nav / rail / sidebar based on width).
- Avoid web-only assumptions in core widgets.

---

## 16) Backend Assumptions Flutter Must NOT Make

Flutter code must **not** assume:
- verification flow already exists (email/phone OTP is not finalized)
- every authenticated user is admin
- roles are fixed forever
- permissions never change
- field names can be guessed
- pagination shape is custom per screen
- protected data is accessible without valid token/permission

If any assumption is uncertain, confirm against Swagger or backend DTO/controller implementation first.

---

## 17) Future-Ready Notes (When `edutech-core` Starts)

The following are future candidates and **not current `platform-core` commitments**:
- organization/institute onboarding and hierarchy
- student lifecycle screens
- teacher lifecycle screens
- batch/class management
- course/catalog management
- domain dashboards and analytics modules

### How to prepare now without overbuilding
- Keep navigation extensible (`/app/domain/...` placeholders later).
- Keep feature boundaries strict so new domain modules can be added cleanly.
- Avoid hardcoding user types that may evolve with domain models.

---

## 18) Handoff Block for Future ChatGPT/Codex Chats

> Copy/paste this block into a new chat when continuing Flutter work.

```text
Project context: This repo is platform-core (NestJS + Prisma + PostgreSQL), a backend foundation repo.
Current stable backend scope includes auth, users foundation, roles/permissions foundation, sessions foundation, admin user management, health, and settings status endpoints.
Active UI-relevant APIs include:
- Auth: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me
- Admin: GET /admin/users, GET /admin/users/:id, PATCH /admin/users/:id/status, POST /admin/users/:id/roles
Flutter integration rules:
- Always align with Swagger/backend DTOs
- Use Bearer access token for protected endpoints
- Implement refresh token flow for 401/expiry
- Drive role/permission-based UI visibility from backend user context
- Match backend pagination contract exactly
Out-of-scope for current repo (future edutech-core): organizations, students, teachers, batches, courses, domain dashboards.
Please continue work with feature-based Flutter structure and backend-first API alignment.
```

---

## 19) Flutter Developer Checklist (Before Starting)

- [ ] Read backend docs in `/docs` and module controllers.
- [ ] Check Swagger/OpenAPI endpoints and schemas.
- [ ] Walk through auth flow end-to-end (register/login/refresh/logout/me).
- [ ] Confirm environment configuration and API base URL.
- [ ] Verify which endpoints are protected and required permissions.
- [ ] Map each planned screen to exact endpoint(s).
- [ ] Plan token storage and refresh interceptor behavior.
- [ ] Define loading/error/empty states before building UI.
- [ ] Separate API models from domain/UI models.
- [ ] Validate form fields according to backend DTO rules.

---

## 20) Working Style and Documentation Standard

This guide is intended to be:
- practical and implementation-focused,
- aligned to current backend truth,
- explicit about current vs future scope,
- easy to reuse in human and AI-assisted workflows.

When updating this file in future:
1. Update API sections whenever controllers/DTOs change.
2. Mark clearly whether a feature is current or future scope.
3. Keep screen planning synchronized with module responsibilities.
4. Avoid vague language—prefer endpoint-level clarity.

---

## Appendix A: Quick Backend Endpoint Snapshot

```text
Auth:
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

Admin:
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PATCH  /api/v1/admin/users/:id/status
POST   /api/v1/admin/users/:id/roles

Status/Foundational modules:
GET    /api/v1/health
GET    /api/v1/settings/status
GET    /api/v1/users/status
GET    /api/v1/roles/status
GET    /api/v1/permissions/status
GET    /api/v1/sessions/status
```

## Appendix B: Minimal Integration Sequence for First Flutter Milestone

1. Implement networking + secure token storage.
2. Implement login/register/refresh/logout/me integration.
3. Implement auth-aware route shell.
4. Implement profile/me screen.
5. Implement admin user list/detail screens.
6. Implement status update and role assignment actions.
7. Add permission-based route and action visibility.
8. Harden loading/error/empty states and responsive layouts.
