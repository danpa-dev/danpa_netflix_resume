## Royalty‑Free Asset Fetching (Local)

This script pulls cinematic/sophisticated images and (optionally) short videos from royalty‑free providers for items in section files referenced by `src/data/manifest.json` that are missing assets, then updates the section JSON files with local paths and saves files under `public/`.

### Providers
- Images: Pexels (preferred), Unsplash (fallback or primary)
- Videos: Pexels only (Unsplash video API not supported)

### Environment variables
- `PEXELS_API_KEY`: required for Pexels search/downloads
- `UNSPLASH_ACCESS_KEY`: Unsplash Access Key (required when using Unsplash)
- `UNSPLASH_SECRET_KEY`: Unsplash Secret Key (not needed for basic search, reserved for future flows)

Create keys at:
- Pexels: https://www.pexels.com/api/
- Unsplash: https://unsplash.com/developers

### Commands

Fetch both images and videos (Pexels primary):

```bash
PEXELS_API_KEY=... UNSPLASH_ACCESS_KEY=... npm run assets:fetch
```

Images only:

```bash
PEXELS_API_KEY=... UNSPLASH_ACCESS_KEY=... npm run assets:fetch -- --type=images
```

Unsplash as primary (images only) — note: Unsplash requires hotlinking of returned URLs and tracking downloads. We comply by setting direct URLs and calling the `download_location` endpoint automatically. See Unsplash API docs on hotlinking and download tracking.

```bash
UNSPLASH_ACCESS_KEY=... UNSPLASH_SECRET_KEY=... npm run assets:fetch -- --provider=unsplash --type=images --hotlink=true
```

The script will:
- Build a query from `title`, `company`, `role`, etc. and bias with “cinematic”/“sophisticated” terms
- Save downloads to `public/images/ID-thumb.jpg` and `public/videos/ID-clip.mp4` (when using Pexels/local mode)
- For Unsplash with `--hotlink=true`, set `thumbnailUrl` to the Unsplash CDN URL and automatically register the download (per API)
- Update `thumbnailUrl`/`videoUrl` in section files when assets were missing or when replacement is requested
- Print a summary

### Flags

- `--only=<section>`: limit to a single section by type or id (e.g., `workExperience`, `education`, `skills`, `personalProjects`, `volunteerWork`, or `work`)
- `--replace=true`: force replacement even if an item already has an image/video URL (use sparingly)
- `--hotlink=true`: hotlink image URLs instead of downloading (required for Unsplash compliance)

Examples:

```bash
# Only work experience images via Unsplash (hotlinking)
UNSPLASH_ACCESS_KEY=... npm run assets:fetch -- --provider=unsplash --type=images --hotlink=true --only=workExperience

# Replace all images across sections using Pexels (download locally)
PEXELS_API_KEY=... npm run assets:fetch -- --type=images --replace=true
```

### Optimize images (optional)

Single-format baseline is fine: JPEG/PNG + MP4 only. If you later want modern variants:

```bash
npm run generate:images
```

This creates `*.webp` and `*.avif` files alongside JPG/PNG in `public/images/`. The app will use them only when the URLs are supplied in section files.

### Notes & tips
- Use the fetcher to bootstrap placeholders; replace with curated assets later.
- For local-only demos, paths like `/images/...` and `/videos/...` are fine. For production, host on your assets CDN (see the AWS deploy guide) and update URLs in section files.
- Keep usage under provider rate limits. Add `--type=images` when you don’t need videos.
- Unsplash documentation and requirements: see [Unsplash API docs](https://unsplash.com/documentation) — use `Authorization: Client-ID <ACCESS_KEY>`, respect hotlinking guidance, and register a download via the `download_location` URL returned with each photo.

### Placeholder detection (why the script may update an item that already has a URL)

The script treats obvious placeholders as “missing” and will fetch replacements unless you disable it:
- Matches `metadata.defaults.thumbnailUrl`, `metadata.defaults.videoUrlMp4`
- Filenames like `test.jpg`, `test.png`, `test.mp4`
- Logos (heuristic: filenames containing `logo`)
Use `--replace=false` (default) to only replace placeholders, or add `--replace=true` to force updates.
