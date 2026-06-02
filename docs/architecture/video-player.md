# Video Player Architecture

## Overview

HTML5-based video player for the modal detail view with autoplay-mute policy compliance, multi-format support, loading/error states, and accessibility.

## Files

- `src/components/VideoPlayer.tsx`
- `src/components/VideoPlayer.css`
- `src/contexts/VideoPreferencesProvider.tsx`
- `src/hooks/useVideoPreferences.ts`

## Props

- `srcMp4?`, `srcWebm?`, `poster?`, `autoPlay?` (default true), `loop?` (default true)

## Behavior

- Attempts autoplay when allowed; shows a full-overlay play button when autoplay fails or when paused.
- Single toggle for mute/unmute in the top-left; native controls stay hidden.
- Mute state is session-scoped through `VideoPreferencesProvider`. Each fresh page load starts muted. Once the user unmutes any modal video, later modal videos inherit the unmuted preference.
- If a browser blocks autoplay for a later unmuted video, the existing play overlay remains available.
- Loading: `isLoading` gate fades opacity; `loadeddata` clears the loading state and triggers optional `onLoaded`.
- Errors show a banner with a retry button that reloads and attempts playback again.
- Keyboard: Space/Enter toggles play/pause; `m` toggles mute.
- Respects `prefers-reduced-motion` by disabling autoplay attempts.

## Integration

- Used in the `ItemCard` modal. Sources are driven by item-level `videoUrl` or season-level overrides (`SeasonSelector`).
- `main.tsx` wraps the app with `VideoPreferencesProvider`; keep modal players inside that provider so the user's in-session preference is shared.
- Baseline: MP4 (H.264/AAC) only. WebM is optional.
- `poster` defaults to the item thumbnail when a dedicated poster is not supplied.

## Testing Checklist

- Autoplay works when muted; overlay shown when blocked
- Fresh visits start muted; toggling mute updates subsequently mounted players
- Fallback to play button works; retry works after error
- A11y: focusable controls, ARIA labels, visible focus
- Responsive at common breakpoints, maintains 16:9
