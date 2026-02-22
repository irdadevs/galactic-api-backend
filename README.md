# Galactic API Backend

Backend API for procedural galaxy simulation with auth, ownership, payments, observability, caching, and maintenance jobs.

## Overview

- Base API path: `/api/v1`
- Runtime: `Node.js 22` + `TypeScript` + `Express 5`
- Data stores: `PostgreSQL` + `Redis`
- Auth: JWT (`access_token`, `refresh_token`) via secure `httpOnly` cookies (or `Authorization: Bearer`)
- Payment provider: Stripe

## Main Capabilities

- User lifecycle: signup, verify, login/refresh/logout, profile changes, soft delete/restore, admin management.
- Procedural galaxy lifecycle with atomic creation/deletion through UoW transactions.
- Nested aggregates: Galaxy -> System -> Star/Planet/Asteroid -> Moon.
- Ownership enforcement for non-admin users on galaxy-owned resources.
- Donations lifecycle with one-time and recurring checkout (Stripe).
- Error/audit logs and performance metrics with API + automatic middleware capture.
- Redis caching across aggregates.
- Automated maintenance jobs (archive and partition planning).

## Tech Stack

- API: Express 5
- Validation: Zod
- DB: PostgreSQL (`pg`)
- Cache: Redis (`redis`)
- Auth/Crypto: `jsonwebtoken`, `bcrypt`
- Payments: `stripe`
- Mail: `nodemailer`
- Security middleware: `cors`, `express-rate-limit`, `hpp`, `compression`
- Tooling: ESLint, Prettier, Jest, Husky, lint-staged, Docker

## Architecture (High Level)

- `src/domain/aggregates`: domain entities and invariants (`User`, `Galaxy`, `System`, `Star`, `Planet`, `Moon`, `Asteroid`, `Donation`, `Log`, `Metric`).
- `src/app/use-cases`: commands and queries (application layer).
- `src/app/app-services`: orchestration/cache services.
- `src/infra/repos`: Postgres/Redis/JWT/Stripe/mailer adapters.
- `src/presentation/controllers` and `src/presentation/routes`: HTTP interface.
- `src/infra/db/migrations`: SQL schema/functions/migrations.

## Security Implementation

- `app.disable("x-powered-by")`.
- `cors` with credentials enabled; `CORS_ORIGIN` allow-list in production.
- `express-rate-limit` global limiter:
  - production: `300 req/min`
  - non-production: `1000 req/min`
- `hpp` enabled against HTTP parameter pollution.
- `compression` enabled.
- JWT validation in `AuthMiddleware`.
- `httpOnly` auth cookies:
  - `access_token` (~15m)
  - `refresh_token` (~1 week)
- Role-based checks via `requireRoles("Admin")`.
- Ownership checks in controllers for Galaxy/System/Star/Planet/Moon/Asteroid and Donation access.
- Request audit logging for key statuses and mutating actions.

## Authorization Rules

- Any authenticated user can create galaxies.
- Non-admin users can only read/mutate/delete their own galaxies and owned nested resources.
- Admin users can access all data.
- Non-supporter users are limited to `max 3 stored galaxies`.
- Supporters and admins can create unlimited galaxies.
- Users auto-archive after inactivity threshold; successful login unarchives user.

## API Endpoints

All endpoints below are prefixed by `/api/v1`.

Common error returns for all endpoints:

- `400`: `{ "ok": false, "error": "INVALID_BODY", "details": ... }` (DTO validation)
- `401`: `{ "ok": false, "error": "UNAUTHORIZED" | "INVALID_TOKEN" }` (auth middleware)
- `403`: `{ "ok": false, "error": "FORBIDDEN" }` (role/ownership)
- `404`: `{ "ok": false, "error": "NOT_FOUND" }` where explicitly handled
- `5xx`: `{ "ok": false, "error": "INTERNAL_ERROR", "message": "Something went wrong." }`

### Health

- `GET /healthz` -> `200` `{ ok, service, environment, at }`
- `GET /readyz` -> `200` `{ ok, dependencies: { db, redis }, at }` or `503` `{ ok: false, reason }`

### Users

- `GET /users/health` (Auth + Admin) -> `200` `{ ok: true, feat }`
- `POST /users/signup` (public) -> `201` `{ user: { id, email, role, verified } }`
- `POST /users/verify` (public) -> `204` empty body
- `POST /users/verify/resend` (public) -> `204` empty body
- `POST /users/login` (public) -> sets `access_token` + `refresh_token` cookies, returns `200` `{ user: { id, email, role, verified } }`
- `POST /users/token/refresh` (public) -> rotates auth cookies, returns `200` `{ ok: true }`
- `POST /users/logout` (Auth) -> clears auth cookies, returns `204` empty body
- `POST /users/logout/all` (Auth) -> clears auth cookies, returns `204` empty body
- `GET /users/me` (Auth) -> `200` `User`
- `PATCH /users/me/email` (Auth) -> `204` empty body
- `PATCH /users/me/password` (Auth) -> `204` empty body
- `PATCH /users/me/username` (Auth) -> `204` empty body
- `DELETE /users/me` (Auth) -> `204` empty body
- `GET /users` (Auth + Admin) -> `200` `{ rows: User[], total: number }`
- `GET /users/email/:email` (Auth + Admin) -> `200` `User | null`
- `GET /users/username/:username` (Auth + Admin) -> `200` `User | null`
- `GET /users/:id` (Auth + Admin) -> `200` `User | null`
- `PATCH /users/:id/role` (Auth + Admin) -> `204` empty body
- `DELETE /users/soft-delete` (Auth + Admin) -> `204` empty body
- `POST /users/restore` (Auth + Admin) -> `204` empty body

### Galaxies

- `POST /galaxies` (Auth) -> `201` `Galaxy`
- `GET /galaxies` (Auth) -> `200` `{ rows: Galaxy[], total: number }`
- `GET /galaxies/owner/:ownerId` (Auth) -> `200` `Galaxy | null`
- `GET /galaxies/name/:name` (Auth) -> `200` `Galaxy | null`
- `GET /galaxies/:id` (Auth) -> `200` `Galaxy | null` (or `404` for non-admin access check path)
- `GET /galaxies/:id/populate` (Auth) -> `200` `{ galaxy, systems: [{ system, stars, planets: [{ planet, moons }], asteroids }] }`
- `PATCH /galaxies/:id/name` (Auth) -> `204` empty body
- `PATCH /galaxies/:id/shape` (Auth) -> `204` empty body
- `DELETE /galaxies/:id` (Auth) -> `204` empty body

### Systems

- `GET /systems/galaxy/:galaxyId` (Auth) -> `200` `{ rows: System[], total: number }`
- `GET /systems/name/:name` (Auth) -> `200` `System | null`
- `GET /systems/position` (Auth) -> `200` `System | null`
- `GET /systems/:id` (Auth) -> `200` `System | null`
- `PATCH /systems/:id/name` (Auth) -> `204` empty body
- `PATCH /systems/:id/position` (Auth) -> `204` empty body

### Stars

- `GET /stars/system/:systemId` (Auth) -> `200` `{ rows: Star[], total: number }`
- `GET /stars/name/:name` (Auth) -> `200` `Star | null`
- `GET /stars/:id` (Auth) -> `200` `Star | null`
- `PATCH /stars/:id/name` (Auth) -> `204` empty body
- `PATCH /stars/:id/main` (Auth) -> `204` empty body
- `PATCH /stars/:id/orbital` (Auth) -> `204` empty body
- `PATCH /stars/:id/orbital-starter` (Auth) -> `204` empty body

### Planets

- `GET /planets/system/:systemId` (Auth) -> `200` `{ rows: Planet[], total: number }`
- `GET /planets/name/:name` (Auth) -> `200` `Planet | null`
- `GET /planets/:id` (Auth) -> `200` `Planet | null`
- `PATCH /planets/:id/name` (Auth) -> `204` empty body
- `PATCH /planets/:id/orbital` (Auth) -> `204` empty body
- `PATCH /planets/:id/biome` (Auth) -> `204` empty body

### Moons

- `GET /moons/planet/:planetId` (Auth) -> `200` `{ rows: Moon[], total: number }`
- `GET /moons/name/:name` (Auth) -> `200` `Moon | null`
- `GET /moons/:id` (Auth) -> `200` `Moon | null`
- `PATCH /moons/:id/name` (Auth) -> `204` empty body
- `PATCH /moons/:id/size` (Auth) -> `204` empty body
- `PATCH /moons/:id/orbital` (Auth) -> `204` empty body

### Asteroids

- `GET /asteroids/system/:systemId` (Auth) -> `200` `{ rows: Asteroid[], total: number }`
- `GET /asteroids/name/:name` (Auth) -> `200` `Asteroid | null`
- `GET /asteroids/:id` (Auth) -> `200` `Asteroid | null`
- `PATCH /asteroids/:id/name` (Auth) -> `204` empty body
- `PATCH /asteroids/:id/type` (Auth) -> `204` empty body
- `PATCH /asteroids/:id/size` (Auth) -> `204` empty body
- `PATCH /asteroids/:id/orbital` (Auth) -> `204` empty body

### Donations

- `POST /donations/checkout` (Auth) -> `201` checkout payload (includes provider session info/URL)
- `POST /donations/checkout/:sessionId/confirm` (Auth, owner/admin) -> `204` empty body, `404` if donation not found
- `POST /donations/:id/cancel` (Auth, owner/admin) -> `204` empty body, `404` if donation not found
- `GET /donations` (Auth) -> `200` `{ rows: Donation[], total: number }`
- `GET /donations/:id` (Auth, owner/admin) -> `200` `Donation`, `404` if not found

### Logs (Admin)

- `POST /logs` (Auth + Admin) -> `201` `Log`
- `GET /logs` (Auth + Admin) -> `200` `{ rows: Log[], total: number }`
- `GET /logs/:id` (Auth + Admin) -> `200` `Log | null`
- `PATCH /logs/:id/resolve` (Auth + Admin) -> `204` empty body

### Metrics (Admin)

- `POST /metrics/performance` (Auth + Admin) -> `201` `Metric`
- `GET /metrics/performance` (Auth + Admin) -> `200` `{ rows: Metric[], total: number }`
- `GET /metrics/performance/dashboard` (Auth + Admin) -> `200` dashboard object (aggregated KPIs + trends)
- `GET /metrics/performance/:id` (Auth + Admin) -> `200` `Metric | null`

## Caching Strategy (Redis)

Implemented with per-aggregate keyspaces and invalidation on mutations.

- User: entity `1 day`, list `1 week`
- Galaxy: entity `2 weeks`, list `1 day`, populated galaxy `1 day`
- System: entity `3 days`, list `1 day`
- Star/Planet/Moon/Asteroid: entity `1 week`, list `1 day`
- Donation: entity `1 week`, list `6 hours`
- Log: entity `1 hour`, list `5 minutes`
- Metric: entity `10 minutes`, list/dashboard `1 minute`

## Observability

- Request auditing middleware logs:
  - all `5xx`, `401`, `403`, `429`
  - successful mutating requests (`POST`, `PATCH`, `DELETE`)
- HTTP performance middleware tracks `http.request.duration`.
- DB query/transaction timing is tracked through metric tracker wiring.
- Maintenance job executions are persisted to `logs.maintenance_job_runs`.

## Database and Migrations

Migrations in `src/infra/db/migrations`:

- `000_initials.sql`: base schemas/types/extensions
- `001_functions.sql`: shared SQL helpers/functions
- `002_auth.sql`: auth/users/sessions/roles
- `003_procedurals.sql`: galaxy/system/star/planet/moon/asteroid tables
- `004_logs.sql`: logging tables and archive flow
- `005_metrics.sql`: metrics tables and archive flow
- `006_donations.sql`: donations tables and archive flow
- `007_maintenance.sql`: maintenance run logs + archive partition plan

## Maintenance Jobs

Configured through env vars:

- `MAINTENANCE_JOBS_ENABLED`
- `MAINTENANCE_RUN_ON_START`
- `MAINTENANCE_USERS_ARCHIVE_DAYS`
- `MAINTENANCE_LOGS_ARCHIVE_DAYS`
- `MAINTENANCE_METRICS_ARCHIVE_DAYS`
- `MAINTENANCE_DONATIONS_ARCHIVE_DAYS`
- `MAINTENANCE_HOUSEKEEPING_INTERVAL_MIN`
- `MAINTENANCE_USERS_ARCHIVE_INTERVAL_MIN`
- `MAINTENANCE_PARTITION_PLAN_INTERVAL_MIN`

Scheduler jobs:

- housekeeping (archives eligible logs/metrics/donations, archives inactive users)
- user inactivity archive
- archive partition plan refresh

## Local Development

### 1) Install dependencies

```bash
npm ci
```

### 2) Configure env

Use `.env.example` as template and create `.env` with real local values.

### 3) Start infra (Postgres + Redis [+ pgAdmin optional profile])

```bash
docker-compose up -d
```

### 4) Run migrations

```bash
npm run migrate
```

### 5) Start API in dev mode

```bash
npm run dev
```

## Production-like Docker Run

```bash
npm run docker:prod:build
npm run docker:prod:up
npm run docker:prod:migrate
```

Notes:

- `docker-compose.prod.yaml` uses hardened runtime options (`read_only`, `no-new-privileges`, caps dropped).
- Rotate any placeholder/example secrets before deployment.

## Quality Gates

- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test: `npm run test`
- Full validation: `npm run validate`

Git hooks:

- Husky + lint-staged run on pre-commit (`npx lint-staged`).

## CI/CD

- CI workflow (`.github/workflows/ci.yml`):
  - install, lint, typecheck, build, test, docker build
- CD workflow (`.github/workflows/cd.yml`):
  - package artifact on push to main/master
  - manual production deploy job placeholder (`workflow_dispatch`)

## Environment Variables (Minimum)

- App: `NODE_ENV`, `PORT`, `CORS_ORIGIN`
- DB: `DATABASE_URL` (or `PGHOST`/`PGPORT` + URL), `PGSSL`, `PGMAX`, `PGIDLE_TIMEOUT_MS`
- Redis: `REDIS_URL`, `REDIS_USERNAME`, `REDIS_PASSWORD`
- JWT: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`
- Maintenance: all `MAINTENANCE_*` vars listed above

## Testing

- Unit and integration/e2e tests are implemented with Jest + Supertest.
- Run with:

```bash
npm run test
```
