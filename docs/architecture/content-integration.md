## Content Integration Architecture

### Overview
All visible UI (hero media, carousel rows, modal details) is driven by `src/data/manifest.json` plus section JSON files and the TypeScript contracts in `src/types/content.ts`. The goal is to keep data concerns isolated to loader/hooks so components stay presentation-focused.

### Loading, defaults, and caching
- `src/utils/contentLoader.ts` imports the manifest, loads each enabled section file, validates the assembled content, applies defaults from the manifest `metadataSource` section (hero image/video, thumbnail/poster, AVIF/WebP variants), and caches the hydrated result for 5 minutes.
- Defaults are merged into every content slice (work/education/skills/projects/volunteer) so missing thumbnails/videos gracefully degrade without UI checks. `ItemCard` still keeps its own fallback placeholder if both item and defaults fail.
- Helper getters (`getWorkExperience`, `getEducation`, etc.) keep callers type-safe; `formatContentForDisplay` surfaces validation summaries and stats.
- Modal detail fields are configured per section via `manifest.json` (`sections[].modal`) so each carousel can tailor which fields appear.
### Media format stance
- Single-format baseline is fine: JPEG/PNG for images and MP4 for video. Extra AVIF/WebP/WebM fields are optional and can be omitted from section files.

### Validation
- `src/utils/contentValidation.ts` enforces IDs, date ranges, URL formats, and nested structures (seasons/episodes for work; projects for education). It returns detailed error arrays that can be bubbled to tooling or future admin views.

### Hooks API
- `useContent(autoLoad = true)` exposes the raw content, stats, lastUpdated, loading/error flags, and helpers for search/filter/refresh and `getContentById`.
- Thin adapters (`useWorkExperience`, `useEducation`, `useSkills`, `usePersonalProjects`, `useVolunteerWork`) return the typed arrays plus loading/error for each carousel.
- `useContentStats`, `useContentSearch`, and `useContentFilter` wrap common patterns for future UI without duplicating logic.

### Rendering flow
1. `App.tsx` calls `useContent` and renders one `Carousel` per enabled section when data is available.
2. `Carousel` maps items into `ItemCard` instances; work experience passes `seasons` for modal swapping.
3. `ItemCard` defers heavy UI (Modal, VideoPlayer) via `React.lazy`/`Suspense` and receives default thumbnails for image fallbacks from the content loader.
4. `SeasonSelector` sits inside the modal to swap description/video per season.

### Error and loading UX
- Each hook exposes `loading`/`error`; `App.tsx` surfaces a single loading banner or error banner across rows.
- Lazy image/video loading inside `ItemCard` shows skeletons and screen-reader announcements; modal video errors surface a retry button.

### Metadata-driven extras
- `metadata.resume` contains URLs/file name hints for the downloadable PDF.
- `metadata.totalItems` mirrors content counts; `metadata.lastUpdated` is surfaced via `useContent` for stats or footer copy.

### Design tokens and consistency
- Section padding comes from `src/styles/tokens.css` (e.g., `--space-24/32/48`) while color/typography tokens live in `App.css`.
- Shared micro-interaction utility `.u-hover-lift` is applied to cards and respects `prefers-reduced-motion`.
