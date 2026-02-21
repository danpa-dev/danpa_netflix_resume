# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Dev server at localhost:5173 (HMR)
npm run build         # tsc -b + Vite production build → dist/
npm run preview       # Serve production build locally
npm run lint          # ESLint check
npm run format        # Prettier format (in-place)
npm run format:check  # Prettier validate
npm run test          # Vitest single run
npm run test:watch    # Vitest watch mode
npx tsc -b            # Type-check only (no emit)
```

## Architecture

**Netflix-style portfolio/resume** — a content-driven React 19 + Vite SPA. All visible content is defined in JSON files; no strings are hardcoded in components.

### Data flow

1. `src/data/manifest.json` — defines which sections exist, their order, enabled status, and modal field layouts. Each section points to its JSON file and declares `metadataSource`.
2. `src/data/*.json` — content files (work, education, skills, personal-projects, volunteer-work). Each file contains an array of items plus a `metadata` block with defaults (hero image/video, thumbnail URLs, resume PDF paths).
3. `src/utils/contentLoader.ts` — loads section files via `import.meta.glob()`, merges global defaults into every item, validates structure, and caches results for 5 minutes.
4. `src/hooks/useContent.ts` — the primary hook; exposes `sections`, `loading`, `error`, and utility getters. All components consume content through this hook.

### Component hierarchy

```
App.tsx
├── Header            — nav links; picks resume PDF URL via isProdRuntime()
├── MainLayout
│   ├── Hero          — hero background from metadata defaults
│   └── Carousel × N  — one per enabled section
│       └── ItemCard × N
│           └── Modal (lazy) — Framer Motion, portal-rendered, focus-trapped
│               ├── VideoPlayer (lazy)
│               └── SeasonSelector — work experience episode switcher
└── Footer
```

### Key conventions

- **Defaults cascade:** Global defaults from `metadata` in each JSON file are merged into every item so missing media fields degrade gracefully rather than crashing.
- **Type guards over discriminated unions:** `isWorkExperience()`, `isEducation()`, etc. check for characteristic fields (e.g., `company`, `seasons`) instead of a `type` tag. See `src/types/content.ts`.
- **CSS custom properties for responsive layout:** `--carousel-card-width`, `--carousel-gap`, `--carousel-padding` are written by `useResponsiveCarousel` and read by CSS — no JS layout calculations in render.
- **Prod-only features:** Service worker registration and Web Vitals reporting (`initWebVitalsReporter`) are gated on `import.meta.env.PROD` / `isProdRuntime()`. Header also switches between local PDF and S3 URL.
- **Path aliases:** `@/*`, `@components/*`, `@types/*`, `@utils/*`, `@data/*`, `@assets/*` — configured in `tsconfig.app.json` and `vite.config.ts`.
- **Manual chunk splitting:** Vendor bundles are split by concern (React/DOM, Framer Motion, Styled Components, React Router) for cache efficiency.

### Adding or editing content

Edit the relevant `src/data/*.json` file. To add a new section, add an entry to `manifest.json` and create the corresponding JSON file matching the TypeScript interfaces in `src/types/content.ts`.

### Testing

Tests use Vitest + jsdom + React Testing Library. `src/setupTests.ts` stubs `ResizeObserver` and imports jest-dom matchers. Run a single test file:

```bash
npx vitest run src/path/to/file.test.ts
```

### Deployment

- **AWS:** Site → S3 `danpa-resume-site-prod` + CloudFront (`EM35NER047NYG`); media assets → S3 `danpa-resume-assets-prod` + CloudFront (`E1ENJ0IO0Z0R7B`).
- **Netlify:** `netlify.toml` is configured; `npm run build` output in `dist/`.
- Detailed steps in `instructions/deploy-aws-s3-cloudfront.md` and `instructions/deploy-netlify-vite.md`.
