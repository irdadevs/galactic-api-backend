# Production Strategy (Portfolio-Grade, Growth-Friendly)

## Scope

This project is not enterprise-scale yet, but should be secure and reliable enough for real users while staying simple to operate.

## 1) Deployment model

Recommended for this stage:

- Frontend (separate repo): Vercel or Cloudflare Pages.
- Backend (this repo): Dockerized API on Render/Railway/Fly.io.
- Postgres: managed (Neon/Supabase/Render PG).
- Redis: managed (Upstash/Render Redis).
- DNS/TLS/WAF: Cloudflare.

Why this model:

- Low ops overhead.
- Fast iteration.
- Easy migration later to larger cloud setups.

## 2) Docker strategy in this repo

- `Dockerfile`: multi-stage build, non-root runtime user.
- `docker-compose.yaml`: dev stack (api + postgres + redis + optional pgAdmin profile).
- `docker-compose.prod.yaml`: hardened production-like self-host option.
  - No DB/Redis host port exposure.
  - API only exposed to internal/reverse-proxy network.
  - Healthchecks.
  - Redis auth enabled.
  - Read-only FS and dropped Linux caps for API container.

## 3) Runtime/deploy commands

One-command lifecycle (build -> migrate -> run):

```bash
npm run deploy:local
```

Production compose commands:

```bash
npm run docker:prod:build
npm run docker:prod:up
npm run docker:prod:migrate
npm run docker:prod:logs
npm run docker:prod:down
npm run docker:prod:deploy
```

## 4) Environment templates

Added template:

- `.env.example`

Use them as base for real secrets files:

- `.env`
- `.env.production`

Never commit real values.

## 5) Security baseline (portfolio-grade)

Must-have now:

- Branch protection on `main` (no direct pushes).
- CI required checks before merge.
- Strong JWT/DB/Redis/SMTP secrets.
- Strict `CORS_ORIGIN`.
- TLS everywhere (frontend, API, managed DB/Redis if available).
- Redis auth enabled.
- Regular backups for Postgres.
- Monitoring + alerts (Sentry + uptime checks).

Nice-to-have next:

- Reverse proxy with rate-limit/WAF rules.
- Daily automated restore test for DB backups.
- Separate staging environment with smoke tests.

## 6) CI/CD overview

- CI workflow validates: lint, typecheck, build, tests, docker build.
- CD workflow packages artifact and supports protected manual production deployment.
- Pre-commit hook (`.husky/pre-commit`) runs lint-staged before commit.

## 7) Provider recommendation for this phase

Best balance now:

1. Frontend: Vercel.
2. Backend: Render Web Service.
3. DB: Neon Postgres.
4. Redis: Upstash.
5. DNS/WAF/TLS: Cloudflare.

This setup minimizes ops while remaining secure and production-usable for a growing portfolio project.
