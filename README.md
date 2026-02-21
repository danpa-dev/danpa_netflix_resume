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
- Local assets (offline dev): place images in `public/images` and videos in `public/videos`, then reference them as `/images/...` or `/videos/...` in section files.
- CDN/S3 assets (prod): use absolute URLs like `https://assets.danpa.dev/images/...` and `https://assets.danpa.dev/videos/...`.
- Resume PDF: keep a local copy in `public/DanParkResume.pdf` and update `metadata.resume.localPath` + `metadata.resume.s3Url` in the metadata source section file.

## Folder map (high level)
- `src/components` – hero, carousel, item cards, modal, video player, etc.
- `src/hooks` – content loading, lazy/responsive carousel helpers, modal handling.
- `src/utils` – content loader/validation, focus trap, env helpers.
- `docs/architecture` – architecture notes for UI and infra.
- `instructions/` – deployment and ops guides (AWS/CloudFront/Netlify, assets fetching).

## Deployment (snapshot)
- Build: `npm run build` → outputs to `dist/`.
- Static hosting friendly (S3+CloudFront, Netlify, etc.). Service worker registers only in production.
- For S3/CloudFront: keep `index.html` short-TTL; hashed assets can use long TTLs.

## Updating AWS (site + assets)
- Site code (S3 + CloudFront):
  - Build: `npm run build`
  - Sync site bucket: `aws s3 sync ./dist s3://danpa-resume-site-prod --delete --region us-west-2`
  - Invalidate site distribution: `aws cloudfront create-invalidation --distribution-id EM35NER047NYG --paths "/*"`
- Media assets (S3 + CloudFront):
  - Sync images: `aws s3 sync ./public/images s3://danpa-resume-assets-prod/images --cache-control max-age=31536000,public --region us-west-2`
  - Sync videos: `aws s3 sync ./public/videos s3://danpa-resume-assets-prod/videos --cache-control max-age=31536000,public --region us-west-2`
  - Sync resume PDF: `aws s3 cp ./public/DanParkResume.pdf s3://danpa-resume-assets-prod/pdf/DanParkResume.pdf --cache-control max-age=31536000,public --region us-west-2`
  - Invalidate assets distribution (only if filenames stay the same): `aws cloudfront create-invalidation --distribution-id E1ENJ0IO0Z0R7B --paths "/images/*" "/videos/*" "/pdf/*"`
- Detailed AWS guides:
  - `instructions/aws_assets.md` (asset uploads + invalidation)
  - `instructions/deploy-aws-s3-cloudfront.md` (full AWS setup + deploy)

## Notes
- Testing stack was removed for simplicity; add back Jest/Playwright later if needed.
- Media defaults prevent broken thumbnails/videos; modal falls back to placeholders when missing.
