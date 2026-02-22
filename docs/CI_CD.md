# CI/CD and Lint Strategy

## Goal

Guarantee code quality and safety before merge and before every local commit.

## Local quality gate (before commit)

1. `pre-commit` hook runs `lint-staged`.
2. Staged files are formatted with Prettier.
3. Staged `ts/js` files are linted and auto-fixed with ESLint.
4. Commit is blocked if lint/format step fails.

## Local full validation (before push)

Run:

```bash
npm run validate
```

This executes:

- lint (`npm run lint`)
- typecheck (`npm run typecheck`)
- tests (`npm run test -- --runInBand`)

## CI pipeline (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

Triggers:

- Pull requests to any branch.
- Pushes to `main`, `master`, `develop`.

Gates executed in CI:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. `npm run test -- --runInBand`

PR should be mergeable only if CI is green.

## CD recommendation

Use a second workflow (`cd.yml`) that only runs on:

- merge/push to `main`
- optional release tags (`v*`)

Suggested stages:

1. Build artifact/image.
2. Run smoke tests.
3. Deploy to staging.
4. Optional manual approval.
5. Deploy to production.

Keep deployment secrets in GitHub Environments with protection rules.

## First-time setup for hooks

Run once after cloning:

```bash
npm run prepare
```

This enables Husky hook wiring in `.husky/`.
