## Problem Statement

Implement a robust HTML5 video player for the expanded detail view modal that:
- Autoplays muted in compliance with browser policies
- Provides native controls on demand (toggle)
- Loops by default and supports multiple formats (mp4/webm)
- Shows a high-quality placeholder while loading and an error UI on failure
- Is accessible (keyboard, ARIA), responsive, and performs well

## Requirements Summary (from Task 8)
- 8.1: HTML5 video with basic controls
- 8.2: Autoplay (muted default) with unmute controls
- 8.3: Multi-format support and fallbacks
- 8.4: Loading states and error handling
- 8.5: Placeholder system & progressive loading
- 8.6: Documentation maintenance

## Design Overview

### Component
- `src/components/VideoPlayer.tsx` + `VideoPlayer.css`
- Props:
  - `srcMp4?: string` (mp4 source)
  - `srcWebm?: string` (webm source)
  - `poster?: string` (placeholder image)
  - `autoPlay?: boolean` (default true)
  - `muted?: boolean` (default true for autoplay compliance)
  - `loop?: boolean` (default true)
  - `controls?: boolean` (default false; toggleable in-UI)
  - `onError?`, `onLoaded?`

### Behavior
- Autoplay strategy: start muted, attempt `play()`. If it fails, show a play button overlay.
- Controls: expose a minimal overlay toolbar (Play/Pause, Mute/Unmute, Show/Hide native controls). Keep native controls off by default for clean UI, allow turning them on.
- Fallback: If webm fails, rely on mp4. If both fail, show error UI and keep poster/placeholder visible.
- Loading: display poster skeleton/placeholder, then fade in video on `loadeddata`.
- Accessibility: `role="region"` with labeled title, buttons with `aria-pressed`, keyboard shortcuts (Space/Enter for play/pause, `m` for mute), focus order sane. Respect `prefers-reduced-motion` by disabling auto-play if needed.
- Responsiveness: aspect-ratio 16:9, fluid width, height via container, safe on mobile (no scroll jank).

### Integration
- Replace the placeholder in `ItemCard` modal with `<VideoPlayer>` and wire example sources (stub data); guard with props so content without video still renders gracefully.

### States
- Idle (loading), Playing, Paused, Error
- Muted vs Unmuted, Controls Visible vs Hidden

## Implementation Plan
1. Add `VideoPlayer.tsx` and `VideoPlayer.css` implementing:
   - HTML5 `<video>` with `<source>` elements for mp4/webm, `poster` support
   - Overlay controls (play/pause, mute/unmute, show controls)
   - Autoplay logic with muted default and fallback play button on failure
   - Loading and error states with accessible messaging
   - Progressive fade-in and `prefers-reduced-motion` respect
2. Update `ItemCard.tsx` modal content to render `VideoPlayer` when sources exist (kept optional).
3. Document in `docs/architecture/video-player.md`.

## Test Plan
- Autoplay muted succeeds on Chrome/Safari/Firefox; if blocked, play overlay appears
- Unmute toggles sound; loop toggles respected
- Keyboard: Space/Enter toggles play, `m` toggles mute; focusable controls with visible focus
- Loading skeleton shown until `loadeddata`; error UI on failure
- Responsive checks at 320/375/768/1024/1440 widths; maintains 16:9
- Lighthouse: no significant regressions; a11y scores remain high

## Out of Scope
- HLS/DASH streaming, captions/subtitles, and full analytics. Can be added later.

