## Remaining Performance Tasks

### 11.2 Image optimization
- Optional: keep a single-format baseline (JPEG/PNG + MP4). This keeps the asset pipeline simple and is fully compatible.
- If/when you want extra savings, run `npm run generate:images` to create WebP/AVIF sidecars and add `thumbnailWebpUrl`/`thumbnailAvifUrl` in section files.

### 11.5 Monitoring and CI
- Add Web Vitals capture (INP, LCP, CLS) in a small module loaded on `production` only; POST to a lightweight endpoint (e.g., CloudFront Function → S3/Firehose) or a third-party like Plausible.
- Add Lighthouse CI step in GitHub Actions to fail PRs when score drops below thresholds.

### AWS cleanup / follow-ups
- Confirm bucket policies and OAC are configured for `danpa-resume-site-prod` and `danpa-resume-assets-prod` (private buckets with CloudFront access only).
- Ensure cache headers on S3 uploads match intent: long TTL for hashed assets/media, short TTL for HTML if you mirror `dist/` to S3.
- Verify ACM cert in us-east-1 covers `resume.danpa.dev` and `assets.danpa.dev`; renewals are automatic if DNS validation stays in place.
- Keep CloudFront invalidations scoped: invalidate `index.html` on site deploys; invalidate `/images/*` `/videos/*` only when filenames stay constant.
