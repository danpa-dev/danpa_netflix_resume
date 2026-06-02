# Netflix-Style Resume (React + TypeScript + Vite)

Content-driven resume built with React, TypeScript, and Vite. Carousels, hero, and modal experiences are driven by `src/data/manifest.json` plus section JSON files with defaults for media fallbacks.

## Local development

- Install deps: `npm install`
- Start dev server (HMR): `npm run dev` (opens on `http://localhost:5173`)
- Production build preview: `npm run build && npm run preview`
- Lint/format: `npm run lint`, `npm run format`

## Content and assets

- Primary content sources: `src/data/manifest.json` + `src/data/*.json`
  - Update section order, titles, and visibility in `src/data/manifest.json`.
  - Configure modal field layouts per section in `src/data/manifest.json` under each section's `modal` block.
  - Update section content and metadata in each section file (work/education/skills/projects/volunteer).
  - `metadata.resume` controls the PDF download link/name in the header.
  - `metadata.defaults` provides global hero/thumbnail/video defaults (uses manifest `metadataSource`).
  - Preferred baseline formats: JPEG/PNG for images and MP4 (H.264/AAC) for video. Additional AVIF/WebP/WebM fields are optional.
- Local media assets: place images in `src/assets/images` and videos in `src/assets/videos`, add them to `src/assets/assetMap.ts`, then reference their bare filenames in section files. Vite emits content-hashed URLs for production.
- Resume PDF: keep a local copy in `public/DanParkResume.pdf` and update `metadata.resume.localPath` + `metadata.resume.s3Url` in the metadata source section file.

## Folder map (high level)

- `src/components` – hero, carousel, item cards, modal, video player, etc.
- `src/hooks` – content loading, lazy/responsive carousel helpers, modal handling.
- `src/utils` – content loader/validation, focus trap, env helpers.
- `docs/architecture` – architecture notes for UI and infra.
- `instructions/` – deployment and ops guides (AWS/CloudFront/Netlify, assets fetching).

## Deployment (snapshot)

- Build: `npm run build` → outputs to `dist/`.
- Hosting: GitHub Pages at `https://resume.danpa.dev`.
- Deploy: pushing `main` runs `.github/workflows/deploy-pages.yml`.

## Notes

- Tests use Vitest and React Testing Library.
- Media defaults prevent broken thumbnails/videos; modal falls back to placeholders when missing.
