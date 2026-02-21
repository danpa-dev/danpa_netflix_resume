## Asset Architecture

### Sources and tooling
- `scripts/fetch-assets.mjs` can backfill Pexels/Unsplash imagery and videos based on section item IDs in `src/data/*.json`.
- `scripts/extract-resume.mjs` keeps the PDF resume in sync for `public/DanParkResume.pdf`.
- Optional: `scripts/generate-images.mjs` (Sharp) can produce AVIF/WebP sidecars if you decide to add modern formats later.

### Storage and naming
- Local dev assets live in `public/images/*.jpg|webp|avif` and `public/videos/*.mp4`, named `${contentId}-thumb.*` and `${contentId}-clip.mp4` for stable lookups.
- Production assets are served from the S3+CloudFront domain `https://assets.danpa.dev/...`; section files already reference absolute URLs.
- Vite leaves files in `public/` untouched, so CDN-hosted URLs bypass the build pipeline while local paths continue to work offline.

### App integration
- `contentLoader` applies global defaults from `metadata.defaults` (thumbnail/video/poster) to any item missing media, and caches the hydrated payload for 5 minutes.
- Single-format baseline is supported: use JPEG/PNG for images and MP4 (H.264/AAC) for video. All other formats are optional.
- `ItemCard` renders a plain `<img>` by default; `<picture>` sources are only used if you provide AVIF/WebP URLs.
- `Hero` pulls `metadata.defaults.hero.imageUrl`/`videoUrlMp4` into `BackgroundMedia`; `VideoPlayer` expects MP4 and a `poster`.

### CDN and caching
- Assets bucket behind CloudFront with OAC; HTML stays on the site distribution. Keep 1y TTL on versioned images/videos, short TTL (60–300s) on HTML.
- Baseline: JPEG/PNG + MP4 only. Add AVIF/WebP later if you want extra savings; cache-bust via filename changes, not query params.

### Fallback behavior
- Missing thumbnail → default thumbnail (or hero image) from metadata.
- Missing video → modal shows a placeholder panel; playback controls stay hidden.
