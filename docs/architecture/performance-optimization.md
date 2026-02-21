## Performance Optimization Overview

### Implemented
- **Lazy loading:** `useLazyCarousel` uses Intersection Observer with preload distance (150px), zero delay, and a max of 10 concurrent loads; the first 8 items are force-loaded to avoid blank initial rows.
- **Responsive sizing:** `useResponsiveCarousel` constrains card width (200–400px) and pads tracks via CSS variables to prevent layout shift on resize.
- **Asset fallbacks:** `contentLoader` injects default thumbnails/posters/video URLs so `ItemCard` rarely renders placeholders; a final placeholder is shown if both item and defaults fail.
- **Bundling:** Vite manual chunks (vendor/animations/styling/routing) and `assetsInlineLimit: 2048` keep large assets as separate requests; sourcemaps disabled in prod.
- **Offline/cache:** Service worker (`public/sw.js`) registered in production with cache-first for static assets and network-first for HTML; small app shell pre-cached.
- **Runtime telemetry:** Web Vitals reporter logs CLS/INP/LCP to the console in production; hooks exist to swap in a POST target later.
- **CSS hints:** `content-visibility: auto` + intrinsic sizes on images, `will-change` on layout containers, and scroll snapping for smooth, low-cost horizontal movement.

### Next suggestions (optional)
- Stick with single-format assets (JPEG/PNG + MP4) for simplicity; add AVIF/WebP only if bandwidth becomes a concern.
- Wire `useLazyCarousel` virtualization flags to actually window very long lists.
- Send Web Vitals to a lightweight endpoint and sample results in CI.
- Run Lighthouse/PageSpeed in CI (warn-only) and track deltas over time.
