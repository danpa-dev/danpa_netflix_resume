### Observability & Quality Gates — Design Doc

#### Problem statement
Sustain quality over time: monitor performance and errors, and guard bundle size/regressions in CI.

#### Goals
- Send Core Web Vitals to an endpoint; add console budget warnings in dev.
- Add bundle analysis + size budgets; fail CI when exceeded.
- Optional error tracking (Sentry) and basic analytics.

#### Spec
- Web Vitals
  - Extend `src/utils/webVitals.ts` to POST LCP/CLS/INP to `/api/vitals` (or a mock endpoint for now).
  - Print console warnings in dev if thresholds exceeded.
- Budgets
  - Use a Vite plugin or a post‑build script to measure total JS/CSS; set thresholds.
  - Add a GitHub Action that runs `npm run build` + analyzer; fail if over budget.
- Error tracking
  - Optional Sentry init in prod; capture exceptions from `ErrorBoundary`.

#### Implementation plan
- `scripts/analyze-bundle.mjs`: analyze `dist/` sizes and emit pass/fail.
- `.github/workflows/ci.yml`: run tests, build, analyze; artifact `dist/`.
- Extend `webVitals.ts` with POST; document endpoint configuration.

#### Acceptance criteria
- CI fails if size budgets are exceeded.
- Vitals POSTed in production; visible logs in dev when thresholds are exceeded.

