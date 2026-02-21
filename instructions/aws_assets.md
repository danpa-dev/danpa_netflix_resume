## AWS Assets Guide

### What goes where
- Bucket: `danpa-resume-assets-prod` (us-west-2)
- Paths:
  - `images/` for thumbnails/hero images (JPEG/PNG baseline; optional WebP/AVIF if you create them)
  - `videos/` for MP4 clips
  - `pdf/` for resume PDFs if needed

### Uploading assets
Example commands (requires AWS CLI auth to account `634072176770`):
```bash
# Images
aws s3 sync ./public/images s3://danpa-resume-assets-prod/images --cache-control max-age=31536000,public --region us-west-2

# Videos
aws s3 sync ./public/videos s3://danpa-resume-assets-prod/videos --cache-control max-age=31536000,public --region us-west-2

# Resume PDF (if applicable)
aws s3 cp ./public/DanParkResume.pdf s3://danpa-resume-assets-prod/pdf/DanParkResume.pdf --cache-control max-age=31536000,public --region us-west-2
```

After syncing, invalidate the assets CloudFront distribution (`E1ENJ0IO0Z0R7B`) if filenames stay the same:
```bash
aws cloudfront create-invalidation \
  --distribution-id E1ENJ0IO0Z0R7B \
  --paths "/images/*" "/videos/*" "/pdf/*"
```
(If you use hashed filenames, invalidation is rarely needed.)

### Hooking assets in section files
- Use absolute URLs when pointing at CDN:
  - Images: `https://assets.danpa.dev/images/<file>`
  - Videos: `https://assets.danpa.dev/videos/<file>`
- Set defaults in `metadata.defaults` to avoid broken thumbnails/videos.
- Single-format baseline is fine: JPEG/PNG + MP4. Additional AVIF/WebP/WebM fields are optional.

### Local development with S3 assets
- You can reference the same `https://assets.danpa.dev/...` URLs in section files while running `npm run dev`; no special proxy required.
- If you prefer offline dev, place files in `public/images` and `public/videos` and use `/images/...` or `/videos/...` paths instead. Mix-and-match is supported.

### CORS / access
- Assets are served via CloudFront with OAC; browsers fetch them directly via `assets.danpa.dev`. No extra headers are needed for plain `<img>`/`<video>` usage.
- If you later fetch assets via XHR/canvas, ensure the S3 CORS policy allows GET/HEAD from `https://resume.danpa.dev`.
