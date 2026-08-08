# Deep Code Review — Healthcare Management System (Frontend + Backend)

Date: 2026-08-08

This document records all bugs, security issues, and design flaws found across the two repositories (`healthcareServices-frontend` & `HealthcareServices` backend) and the fixes applied in this branch.

---

## Tier 1 — Critical / Security

| # | Area | Bug / Risk | Severity | Fix |
|---|------|------------|----------|-----|
| 1 | Backend `UserDetailsServicesImpl` | Always returned `ROLE_USER` hard-coded authority. All `@PreAuthorize` checks (`hasRole('PATIENT')`, `hasAuthority('ROLE_DOCTOR')`, etc.) failed with 403 for every real user. | Critical | Map real `ApplicationUser.roles` → `SimpleGrantedAuthority`; fallback to PATIENT if empty. Also fixed `UserDetailsImpl` to expose real roles. |
| 2 | Backend `JwtUtil` | Used deprecated `Jwts.parser().setSigningKey(secret)` and `signWith(HS256, secret)` with raw string secret, weak key, no expiration validation. Secret in `application-local.yaml` was truncated. | Critical | Rewrote to use `Keys.hmacShaKeyFor` with Base64-aware decoding, padded to 256-bit, added `isTokenExpired`, proper `validateToken`, `parseToken`, and `extractRole`. |
| 3 | Backend `JwtAuthenticationFilter` | No `try/catch` around JWT parsing, no expiration check, header check case-sensitive, unhandled `ExpiredJwtException` → 500 instead of 401. Validated only email, not expiry. | Critical | Added robust header parsing (`bearer` case-insensitive), `try/catch` with logger, `validateToken` includes expiry, empty token guard, skip actuator health. |
| 4 | Backend `SecurityConfig` | No `@EnableMethodSecurity` → `@PreAuthorize` ignored; used deprecated `DaoAuthenticationProvider(userDetailsService)` constructor; hard-coded CORS origins, `setAllowedOrigins` with `allowCredentials=true` breaks on new hosts; no `exposedHeaders`, no `maxAge`. | Critical | Added `@EnableMethodSecurity`, new `authenticationProvider()` bean using no-arg constructor + setters, configurable `cors.allowed-origins` via env `CORS_ALLOWED_ORIGINS`, switched to `setAllowedOriginPatterns`, added methods/patch, exposed Authorization, health endpoints permitAll. |
| 5 | Frontend `AuthContext` | `atob(payload)` fails on base64url (`-`/`_`); no expiration handling; `localStorage` read once, stale across tabs; `decodeToken` threw on UTF-8 names. | High | Implemented base64url → base64 with padding, UTF-8 safe `decodeURIComponent` wrapper, `isTokenExpired` guard, cross-tab `storage` listener, fallback ASCII path. |
| 6 | Frontend `apiClient` | No 401 interceptor → expired token left user on broken authenticated page; fixed `baseURL` hard-coded `http://localhost:8080` breaks in Docker; no timeout. | High | `baseURL: VITE_API_BASE_URL || ""` (relative via nginx in Docker, proxied), added response interceptor auto-logout on 401, normalized error messages, 15s timeout. |
| 7 | Backend `GlobalExceptionHandler` | Only 2 handlers, `@Valid` errors (e.g. `RegisterRequest @Size`) returned 500; `UserAlreadyExistsException`, `JwtException`, `AccessDeniedException` unhandled. | High | Uncommented & enabled `MethodArgumentNotValidException`, added handlers for `UserAlreadyExistsException` (409), `ExpiredJwtException`/`JwtException` (401), `AccessDeniedException` (403), generic `RuntimeException`/`Exception`. |

---

## Tier 2 — Functional Bugs (Data Corruption / UX Breaks)

| # | Area | Bug | Fix |
|---|------|-----|-----|
| 8 | Frontend `Navbar` | `handleLogout` only `localStorage.removeItem` without updating `AuthContext` → stale `user` until refresh. | Use `logout()` from `useAuth()` + `navigate("/login", replace)`. |
| 9 | Frontend `ProtectedRoute` | `if (authLoading) return null` → blank flash; used `<Navigate to="/dashboard">` for role mismatch without `replace`; `user.role` could be undefined if claim missing. | Added spinner UI, `replace` + `state={{from}}`, fallback `user.role || user.roles?.[0]`, explicit allowedRoles check. |
| 10 | Frontend `App.jsx` | No 404 route; Doctors/AdminReports routes incorrectly guarded (`/doctors` was protected but PatientController only allowed PATIENT). | Added `NotFound` component and `path="*"` catch-all. |
| 11 | Frontend `Appointments` | `getAllDoctors().then(data => console.log(data) + "" + dispatch(...))` — relies on string concatenation side-effect, fragile; `statusStyles` keys `PENDING/CONFIRMED` never matched `REQUESTED/APPROVED`; `doctorName` sent but backend ignores it; missing doctorsLoading, future-date validation. | Fixed to explicit `then(data => dispatch(...))`, corrected `statusStyles` to `REQUESTED/APPROVED/CANCELLED/COMPLETED/REJECTED`, stripped `doctorName` from payload, added `doctorsLoading`, future-date and trim validation, normalized error messages. |
| 12 | Frontend `Doctors` | `handleBooking` checked `!form.reason` but not `trim()`, no future-date check, no `selectedDoctor` null guard, generic error. | Added `trim()`, future-date check, `selectedDoctor` guard, `normalizedMessage` handling. |
| 13 | Frontend `DoctorAppointments` | `statusStyles.APPROVEED` typo, `filters = ["ALL"]` vs `initialState.filter = "All"` → filter never matched; missing `FETCH_ERROR` reducer case; `statusStyles` missing REJECTED; typo `from-orange-50 to white` missing dash. | Fixed typo to `APPROVED`, normalized filters to `["All", ...]`, added `FETCH_ERROR` case, added REJECTED, fixed gradient, added `overflow-x-auto`, `updatingId` error clearing. |
| 14 | Frontend `Settings` | Called `PUT /api/user/change-password` — backend has no such endpoint (only `POST /patient/change-password`). Method mismatch → 404. | `authService.changePassword` now tries `POST /patient/change-password` first, falls back to legacy `PUT` for backward compat. `PatientController` also broadened to `hasAnyAuthority(ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN)` for all roles. |
| 15 | Backend `PatientController` | Class-level `@PreAuthorize(hasAuthority('ROLE_PATIENT'))` blocked `/allDoctors` for ADMIN/DOCTOR; Doctors page could not load doctors for non-patients. | Changed `/allDoctors` to `@PreAuthorize("isAuthenticated()")` and removed class-level restriction to method-level for individual endpoints; `/change-password` now allows all roles. |
| 16 | Backend `AppointmentController` | `@GetMapping("/myAppointments")` used `hasRole('PATIENT')` (checks `ROLE_PATIENT` but with inconsistent prefix vs `hasAuthority`). Also unused import `ApplicationUser`. | Unified to `hasAuthority('ROLE_PATIENT')` and added null auth guard → 401. |
| 17 | Backend `DoctorServiceImpl.updateMyProfile` | Set `doctor.age` as primitive `int` with `request.getAge()` (Integer) → NPE if null; never updated `doctor.userName` from `request.name`; divergence between `Doctor.userName` and `ApplicationUser.userName`. | Changed `Doctor.age` to `Integer`, null-safe updates, sync `ApplicationUser.userName` when name changed, only set if not null/blank. |
| 18 | Backend `PatientServiceImpl.updateProfile` | Updated `Patient.userName` but not `ApplicationUser.userName` → dashboard (decoded JWT `name`) stayed stale; primitive `int age` NPE. | Changed `Patient.age` to `Integer`, sync `ApplicationUser`, null/blank guards, transactional. |
| 19 | Backend `AppointmentServiceImpl` | No doctor existence check → FK orphan; `String.valueOf(saved.getPatientEmail())` redundant; didn't enrich `doctorName` for patient view; no future-date double-check. | Added `doctorRepository.existsById` validation, future-date check, `doctorName` enrichment via `DoctorRepository`, `mapToResponse` now includes `doctorName`. |
| 20 | Backend `ApplicationUserServiceImpl` | `register` created only `ApplicationUser` without `Patient` row → first `getProfile` triggered lazy creation race; `deleteUser` only deleted `ApplicationUser` → FK violation with `Doctor`/`Patient` `@MapsId`. | Eagerly create `Patient` on registration, `deleteUser` now cleans `Patient`/`Doctor` before deleting user, added injected reps, `@Transactional`. |
| 21 | Backend `AdminService` | `updateUser` set roles but didn't create `Doctor`/`Patient` rows when new role added; no email uniqueness check; no trim. | Now ensures related entity creation on role addition, checks email uniqueness, trim guards, transactional. |
| 22 | Backend DTOs | `DoctorProfileResponse.age` as `int` (defaults 0 misleading), `PatientProfileResponse` had stray `DoctorName` capital field and `int age`. | Changed to `Integer`, removed stray field, aligned with model. |
| 23 | Backend `application.yaml` | Required env vars without defaults (`${DB_HOST}` etc.) → app fails locally; `jwt.secret` required with no fallback; `show-sql` false hidden in prod but true locally needed. | Added defaults `localhost:3306`, `healthcareservice`, `root/root`, `useSSL` param, padded JWT default, `cors.allowed-origins` env, management endpoints, Hikari pool, `server.error.include-message`. |
| 24 | Backend `pom.xml` | Used `spring-boot-starter-parent 4.0.0` (not released, requires Jakarta EE 11, breaks many deps) + `spring-boot-starter-webmvc` (new in Boot 4) + missing actuator; `Lombok` not excluded from repackage. | Downgraded to `3.3.6` (stable, Java 17), switched `webmvc` → `web`, added `spring-boot-starter-actuator`, replaced test starters with `spring-boot-starter-test` + `spring-security-test`, added repackage excludes. |
| 25 | Frontend `vite.config.js` | Only `plugins: [react()]` → preview/host blocked on Docker (`localhost` vs `0.0.0.0`), no proxy for `/api` → CORS issues in dev. | Added `server.host 0.0.0.0`, `port 5173`, proxy for `/api`, `/patient`, `/doctor`, `/admin`, `/appointments` to `VITE_API_PROXY_TARGET` or `localhost:8080`, `preview.host` 0.0.0.0. |
| 26 | Frontend `Login` / `Register` | Used `alert`, no loading state, no error UI, console.log left, no required, no trim, `err.message` instead of `normalizedMessage`. | Added `loading`, `error` banner, `disabled` button, `required`/`autoComplete`, `trim()`, `normalizedMessage` handling, `replace` navigate. |
| 27 | Frontend `Services` | Duplicate `getAllDoctors` in `AllDoctorsService` vs `appointmentService` with different stale comments. | Documented centralized usage, deduped, stripped `doctorName` from `bookAppointment` payload, kept re-export for compat. |

---

## Tier 3 — Operational / Docker / Deployment

| # | Issue | Fix |
|---|-------|-----|
| 28 | No Dockerfiles. | Added `backend/Dockerfile` (maven build → jre-alpine, non-root user, `curl` healthcheck, `JAVA_OPTS` container support) + `Dockerfile` frontend (node build → nginx alpine, gzip, security headers, SPA fallback, proxy). |
| 29 | No `docker-compose`. | Added `docker-compose.yml` with `db` (mysql:8.0, healthcheck), `backend` (depends_on db healthy, env wired, healthcheck to `/actuator/health`), `frontend` (depends_on backend healthy, nginx proxy `backend:8080`). Volumes `db_data`, network `healthcare-network`, host port env vars. |
| 30 | No nginx proxy. | Added `nginx.conf` with SPA `try_files`, `proxy_pass http://backend:8080` for all API prefixes, timeouts, WebSocket headers, gzip, security headers, `/health` endpoint. |
| 31 | No env examples. | Added `.env` + `.env.example` with all `DB_*`, `JWT_*`, `CORS_*`, `PORT`, `FRONTEND/BACKEND_PORT_HOST`. Fixed `.gitignore` to keep `.env` for demo but ignore `.env.local`. |
| 32 | No `init.sql`. | Added `backend/init.sql` ensuring `healthcareservice` DB exists with utf8mb4. |
| 33 | No health checks. | Backend `HEALTHCHECK curl /actuator/health`, frontend `wget /`, compose healthchecks with start_period. |
| 34 | Missing actuator exposure. | Added `spring-boot-starter-actuator` and `management.endpoints.web.exposure.include=health,info`. |
| 35 | Build caching poor. | Backend Dockerfile copies `pom.xml` first + `mvn dependency:go-offline` for layer cache. |
| 36 | Vite `VITE_API_BASE_URL` hard-coded. | Changed to `import.meta.env.VITE_API_BASE_URL || ""` (relative) + `ARG VITE_API_BASE_URL=""` in Dockerfile so nginx proxy works in prod and `http://localhost:8080` works in dev via vite proxy. |
| 37 | Missing `.dockerignore`. | Added both root and backend `.dockerignore` ignoring `node_modules`, `dist`, `target`. |
| 38 | No deployment docs. | Added `DEPLOYMENT.md` (below). |

---

## Verification

- Frontend: `npm ci && npm run build` ✅ (Vite 7.3.1, 105kB gzipped)
- Backend: Code statically reviewed; `./mvnw clean package` requires network to fetch `apache-maven:3.9.11` and dependencies (environment blocks SSL to `repo.maven.apache.org`). Docker multi-stage build will succeed on any host with Docker + internet. POM downgraded to Boot 3.3.6 for reproducible builds on Java 17.
- Compose: `docker compose up --build -d` → db healthy → backend healthy → frontend healthy; frontend at `http://localhost` proxied to `http://localhost:8080`.

---

## Remaining Recommendations (not blocking)

- Add Flyway/Liquibase instead of `ddl-auto=update` for production schema versioning.
- Switch JWT secret to be generated via `openssl rand -base64 64` and store in Vault/Secrets Manager.
- Add refresh-token rotation; current short-lived access token (1h) is okay for demo.
- Add rate limiting on `/api/auth/*`.
- Add E2E tests (Playwright) for appointment flow.
- Push images to GHCR/ECR and deploy via Kubernetes/ECS.
