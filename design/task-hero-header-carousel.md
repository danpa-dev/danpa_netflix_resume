---
title: Hero overlay, aspect-ratio, full-bleed carousels, and header responsiveness
status: draft
owner: dan
---

## Problem Statement

Modernize the hero, carousels, and header to better match the Netflix-inspired design and behave correctly across viewport widths:

- Hero overlay currently appears as a full-width gray band. Replace with a left-to-right black gradient (strong on left, fading to transparent across the hero), Netflix style.
- Hero height should scale with browser width while preserving the media aspect ratio (no odd height jumps). Text must remain readable and not clip.
- All carousels should span the full width of the page (edge-to-edge) while maintaining safe horizontal padding for content and arrows.
- Header buttons must remain visible and “hug” the right edge across widths; avoid hiding them behind a hamburger. Allow gentle horizontal scroll only at extremely narrow widths.

## Requirements (Confirmed)

- Overlay: Netflix style gradient, left (black) → right (transparent).
- Hero text alignment: left-aligned.
- Keep side padding for carousels and sections.
- On extremely narrow widths, allow horizontal scroll rather than hiding controls.

## Proposed Approach

### 1) Hero Overlay
- Remove the flat background from `.text-overlay` and introduce a `::before` pseudo-element with a linear gradient overlay.
- Gradient: `linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 80%)`.
- Ensure overlay sits above media but below text (z-index stacking within the hero).
- Left-align the overlay content (title/subtitle) and provide a max-width container for readability.

### 2) Hero Aspect Ratio
- Apply `aspect-ratio: 16 / 9` on `.hero` so height follows width.
- Use `min-height: clamp(280px, 40vw, 70vh)` to prevent clipping on small devices and avoid excessive height on large displays.
- Remove/minimize `min-height` constraints from `.text-overlay`; rely on padding and flex alignment instead.

### 3) Full-Bleed Carousels
- Remove the page-level `max-width` constraint around carousel sections (`.carousel-sections-container`).
- Keep inner horizontal padding via `--carousel-container-padding` so titles/arrows don’t touch edges.
- Validate arrows remain positioned using the existing CSS variables.

### 4) Header “Hug Right”
- Make `.header-container` full width (remove `max-width`).
- Keep `.nav-desktop` visible across widths; right-align it with `margin-left: auto` and `white-space: nowrap`.
- Use `clamp()` for nav gaps, font sizes, and button paddings to compress gracefully.
- If space becomes too tight on very narrow widths (<360px), enable horizontal scroll on the nav instead of hiding items.

## Files Affected

- `src/components/Hero.css`
- `src/components/TextOverlay.css`
- `src/components/BackgroundMedia.css` (z-index checks only)
- `src/components/MainLayout.css` (remove `max-width` constraint around carousel section container)
- `src/components/Carousel.css` (ensure full-bleed with safe padding via variable)
- `src/components/Header.css` (container width, alignment, responsive rules)
- `src/components/TextOverlay.tsx` or `Hero.tsx` (left-align markup container if needed)

## Risks / Considerations

- Very long hero titles could wrap; ensure safe max-width and spacing.
- Some ultra-wide screens may produce very tall hero; clamp keeps it reasonable.
- Header overflow on extremely narrow devices is acceptable per requirements; ensure scroll is discoverable.

## Validation

- Visual QA at widths: 320px, 375px, 768px, 1024px, 1440px, 1920px.
- Check hero media keeps 16:9 and overlay text remains readable.
- Carousels render edge-to-edge with consistent arrow offsets.
- Header stays visible; items right-aligned with no wrapping until ultra-narrow, where a small horizontal scroll appears.

