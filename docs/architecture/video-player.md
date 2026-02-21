# Video Player Architecture

## Overview
HTML5-based video player for the modal detail view with autoplay-mute policy compliance, multi-format support, loading/error states, and accessibility.

## Files
- `src/components/VideoPlayer.tsx`
- `src/components/VideoPlayer.css`

## Props
- `srcMp4?`, `srcWebm?`, `poster?`, `autoPlay?` (default true), `muted?` (default true), `loop?` (default true), `controls?` (default false)

## Behavior
- Attempts autoplay when allowed; shows a full-overlay play button when autoplay fails or when paused.
- Single toggle for mute/unmute in the top-left (native controls stay hidden unless `controls` prop is set).
- Loading: `isLoading` gate fades opacity; `loadeddata` clears the loading state and triggers optional `onLoaded`.
- Errors show a banner with a retry button that reloads and attempts playback again.
- Keyboard: Space/Enter toggles play/pause; `m` toggles mute.
- Respects `prefers-reduced-motion` by disabling autoplay attempts.

## Integration
- Used in the `ItemCard` modal. Sources are driven by item-level `videoUrl` or season-level overrides (`SeasonSelector`).
- Baseline: MP4 (H.264/AAC) only. WebM is optional.
- `poster` defaults to the item thumbnail when a dedicated poster is not supplied.

## Testing Checklist
- Autoplay works when muted; overlay shown when blocked
- Fallback to play button works; retry works after error
- A11y: focusable controls, ARIA labels, visible focus
- Responsive at common breakpoints, maintains 16:9
