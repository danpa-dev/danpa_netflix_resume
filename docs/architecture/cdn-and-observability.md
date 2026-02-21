## CDN Integration & Observability Plan

This document ties together CDN layout, cache strategy, and the runtime telemetry hooks currently wired into the app.

### CDN layout
- Two CloudFront distributions: site (S3 static host) and assets (S3 assets bucket) with OAC.
- TLS via ACM us-east-1 for `resume.danpa.dev` and `assets.danpa.dev`.
- Vite ships hashed JS/CSS; images/videos use stable filenames under the assets distro.

### Caching and offline
- CloudFront: long TTL (≈1y) for static assets, short TTL (60–300s) for `index.html`.
- Service worker (`public/sw.js`) registered in production: cache-first for static assets, network-first for HTML to pick up edits; small app shell (`/`, `/index.html`, `/vite.svg`) pre-cached.
- Gzip/Brotli enabled on CF; keep `assetsInlineLimit` low so images/videos stay as standalone files with CDN headers.

### Routing
- App is a single page (no client router today); if routes are added, map 403/404 to `/index.html` on the site distro to keep SPA routing working.

### Formats
- Baseline: JPEG/PNG for images and MP4/H.264 for video. That is sufficient for full compatibility.
- Optional: add AVIF/WebP later and wire them through `<picture>`; `scripts/generate-images.mjs` can generate the variants if needed.

### Telemetry
- Web Vitals reporter (`initWebVitalsReporter`) runs in production and currently logs metrics to the console; can be swapped for a POST target later.
- Error Boundary wraps the app; no remote error sink yet (Sentry/TrackJS can be gated by env flags later).
- Optional PerfMonitor component exists for debugging Intersection Observer metrics but is not mounted in the UI.

### Quality gates (CI aspiration)
- Unit tests (Jest/RTL) and Playwright e2e smoke should pass before deploy.
- Lighthouse/PageSpeed can run in warn-only mode for regressions once hosting is live.

### Future observability
- RUM ingestion for Web Vitals to S3 + Athena/QuickSight.
- Visual regression snapshots in Playwright.
- Edge image resizing (Lambda@Edge or CF Functions) if mobile payloads grow.
