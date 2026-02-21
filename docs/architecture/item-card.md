# ItemCard Component Architecture

## Overview
`ItemCard` renders each carousel tile and drives the detail modal. It handles image loading/fallbacks, hover/keyboard interactions, and defers heavy UI (modal + video) until needed. Season-aware modal content is supported for work experience entries.

## Files
- `src/components/ItemCard.tsx` / `.css`
- `src/components/SkeletonLoader.tsx` / `.css`
- Lazy children: `Modal.tsx`, `VideoPlayer.tsx`, `SeasonSelector.tsx`

## Props
```ts
interface ItemCardProps {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  className?: string;
  onClick?: () => void;
  videoMp4Url?: string;
  videoWebmUrl?: string;
  videoPosterUrl?: string;
  seasons?: SeasonLite[];
  thumbnailWebpUrl?: string;
  thumbnailAvifUrl?: string;
}
```

## Render flow
1. On mount, an IntersectionObserver marks the card visible and primes `imageState.currentSrc` with either the item thumbnail or the default thumbnail from `content.metadata.defaults` (falling back to the hero image).
2. While loading, a `SkeletonLoader` is shown. On success, `<picture>` renders AVIF/WebP sources when provided; on error, a single retry with the default thumbnail runs before showing a failure state.
3. Hover/keyboard activate Framer Motion variants for lift, overlay reveal, and chevron entry.
4. Clicking opens the modal via `useModal` (locks body scroll) and `useModalAnimation` (captures the trigger rect for entrance/exit positioning).
5. The modal (lazy loaded) displays a 16:9 video region, metadata, and description. If `seasons` exist, `SeasonSelector` controls which season’s description/video is shown.

## Image/loading behavior
- 16:9 container uses padding hack for layout stability; `content-visibility` and intrinsic size hints keep off-screen images cheap.
- Single-format baseline (JPEG/PNG) works fine; `<picture>` with AVIF/WebP is optional.
- `loading="lazy"`, `decoding="async"`, and `sizes` are set on `<img>`.
- One fallback retry is attempted with the default thumbnail; otherwise a placeholder or error block is shown with ARIA labels.

## Modal integration
- Modal is rendered inside a `Suspense` boundary; VideoPlayer is also lazy to avoid blocking first paint.
- `triggerPosition` from `useModalAnimation` feeds the modal’s Framer Motion variants for a subtle “grow from card” feel.
- Season switching updates the description/video with keyed motion fades; if no video is available a placeholder panel remains.

## Accessibility
- Card is `role="button"` with Enter/Space activation, focus outlines, and `aria-describedby` pointing at the description.
- Screen-reader live region announces loading/error states for thumbnails.
- Modal: focus trap, ESC/overlay close (configurable), inert + `aria-hidden` applied to `#root` while open, close button sized for touch.
- SeasonSelector exposes `aria-haspopup="listbox"` plus listbox/option semantics and arrow key support.

## Animation notes
- Framer Motion variants cover hover/tap/focus on the card, overlay slide-in, chevron fade, and modal content swaps.
- Animations obey `prefers-reduced-motion`; key transitions fall back to static states in CSS.

## Error handling
- Image failures: retry with defaults, then show an “image unavailable” block.
- Video failures: VideoPlayer exposes a retry button and keeps controls hidden otherwise.
- Modal close can be intercepted via `onBeforeClose` when needed by callers (not used yet).

## Future considerations
- Surface more item-specific metadata in the modal (tech badges, dates) instead of hardcoded placeholders.
- Persist last-selected season per item (e.g., localStorage) so returning users keep context.
- Add keyboard arrow navigation between cards at the carousel level.
