# Modal System Architecture

## Overview

Accessible, animated detail surface used by ItemCard. It lives in a portal, traps focus, isolates the background, and animates open/close from the clicked card position.

## Component Hierarchy

```
Modal (portal)
├── Overlay (role="dialog", aria-modal)
└── Container (role="document")
    ├── Close Button (floating, top-right)
    └── Content (aria-describedby target)
        ├── Media Section (edge-to-edge, aspect-ratio 16:9)
        │   ├── Video with custom controls (Unmute top-left)
        │   └── Media Overlay (title, lower-left)
        ├── Season Selector Row (below media, right-aligned)
        └── Detail Sections
```

## Key Files

- `src/components/Modal.tsx`: Modal component (portal, ARIA, focus trapping, animations)
- `src/components/Modal.css`: Styles (responsive, safe areas, high contrast)
- `src/utils/focusTrap.ts`: Focus-trapping utility
- `src/hooks/useModal.ts`: Body scroll locking and open/close helpers
- `src/hooks/useModalAnimation.ts`: Captures trigger rect for entrance/exit transforms

## Accessibility Strategy

- Focus trapping: `FocusTrap` keeps focus within the modal and restores focus to the trigger on destroy.
- Escape to close: Enabled when `closeOnEscape` is true.
- ARIA:
  - `role="dialog"` + `aria-modal="true"` on the overlay
  - `aria-labelledby` auto-generated id when a title exists
  - `aria-describedby` bound to the content container
  - `role="document"` on the modal container
- Background isolation: while open, `#root` gets `aria-hidden` and `inert`; `useModal` also sets `body` to `position: fixed` to prevent background scroll and restores the prior scroll position on close.

## Responsive Behavior

- Mobile-first sizing using max-width/height constraints and safe-area padding
- Scroll within `.modal-content`, background scroll disabled via focus trap
- `overscroll-behavior: contain` prevents scroll chaining to the page

## Animation

- Framer Motion `AnimatePresence` and optional `layoutId`/`triggerPosition` provide an origin-from-card transform when available.
- Overlay blur animates in/out; modal uses subtle scale/translate transitions.
- Respects `prefers-reduced-motion` (via CSS) for people who disable motion.

## Testing Checklist

- Keyboard-only
  - Tab/Shift+Tab cycles within modal
  - Escape closes (when enabled)
  - Focus returns to trigger element on close
- Screen reader
  - Title is announced; description is announced
  - Background content is not reachable or announced while open
- Mobile
  - Content scrolls without background scroll
  - Safe-area insets respected; close button has adequate target size

## Visual Details

- Full-bleed media slot uses a bottom gradient (≈50%) to blend into the modal surface. Title sits above the gradient; SeasonSelector row follows beneath the media.
- Close button floats over the media (top-right), with minimum 44px hit target.
- Native video controls stay hidden; VideoPlayer supplies an overlay play button and mute toggle in the top-left.

## Future Enhancements

- Optional swipe-to-close on touch devices
- Announce open/close state changes via ARIA live region if needed
- Allow modal width presets (e.g., “wide” vs. “default”) when more metadata lands
