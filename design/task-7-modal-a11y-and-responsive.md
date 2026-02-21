## Problem Statement

Complete Task 7: Expanded Detail View Modal System by implementing the remaining subtasks:

- 7.4 Accessibility with Focus Trapping and ARIA
- 7.5 Responsive Modal Sizing and Mobile Optimization
- 7.6 Architectural Documentation Maintenance

The goal is to ensure the modal is fully accessible (keyboard-only and screen reader users), that background content is appropriately hidden/inert while the modal is open, and that the modal is optimized for mobile screens. We’ll also produce concise architecture documentation to onboard new engineers quickly.

## Current State Summary

- `Modal.tsx` renders via portal, provides `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` support.
- Escape to close and overlay-click close are implemented behind props.
- `FocusTrap` utility traps focus and returns focus to the previously focused element on destroy.
- `useModal` handles body scroll lock with safe scroll-position restoration.
- `Modal.css` has responsive padding, border-radius adjustments, and safe-area support.

Gaps for 7.4–7.5:
- No explicit background content `aria-hidden`/`inert` management.
- No `aria-describedby` wiring for modal content summary.
- Missing `role="document"` on the inner content container for some ATs.
- Mobile-first improvements: full-bleed height behavior, scroll container tuning, overscroll containment, larger touch targets, and improved close-button ergonomics.

## Design Overview

### Accessibility (7.4)
- Background isolation
  - Toggle `aria-hidden="true"` (and `inert` when available) on `#root` while modal is open; remove on close.
  - Ensure the modal overlay itself is not hidden/inert.
- Focus management
  - Continue using `FocusTrap` on the modal container; update focusable elements on content changes if needed.
  - Confirm Escape closes when enabled; keep close button first in tab order.
- ARIA labelling
  - Keep `aria-labelledby` pointing to the visible title.
  - Add `aria-describedby` pointing to a content summary region inside the modal (first paragraph or a visually-hidden summary).
  - Set `role="document"` on the inner container (`.modal-container`) to improve some screen reader interactions.
- Motion/contrast
  - Respect `prefers-reduced-motion` (already partially handled in CSS) and maintain high-contrast outlines.

### Responsive & Mobile (7.5)
- Layout
  - On small screens, modal uses near full-height with content scrollable (no background scroll).
  - Ensure `overscroll-behavior: contain` on the scrollable region to prevent scroll chaining.
  - Maintain safe-area padding for notched devices.
- Touch targets
  - Ensure close button minimum target size ≥ 44x44px (already close; validate and adjust if needed).
- Optional gesture (deferred)
  - Swipe-to-close is out of scope for now; can be added later if needed.

### Documentation (7.6)
- Create `docs/architecture/modal.md` with:
  - Overview, component hierarchy, interfaces
  - Accessibility strategy (focus trapping, ARIA patterns, background inerting)
  - Responsive behavior notes and CSS hooks
  - Testing checklist

## Implementation Plan

Files:
- `src/components/Modal.tsx`
  - Add effect to toggle `aria-hidden` (and `inert` where supported) on `#root` while open.
  - Wire `aria-describedby` to a content region id (generated or provided via prop), defaulting to container’s first paragraph.
  - Add `role="document"` to the `.modal-container`.
- `src/components/Modal.css`
  - Add `overscroll-behavior: contain` to `.modal-content`.
  - Validate touch target size and adjust spacing on mobile.
- `docs/architecture/modal.md`
  - Author architecture doc per above.

Testing:
- Keyboard-only
  - Tab/Shift+Tab cycles within modal; Escape closes when enabled.
  - Focus returns to trigger after close.
- Screen reader
  - Verify title and description are announced.
  - Background content is not reachable/announced while open.
- Mobile
  - No background scroll; content scrolls; safe-area respected.
  - Close button reachable and large enough.

Out of Scope / Non-Goals:
- Complex gestures (swipe-to-close) and video player work (Task 8).

## Rollout Plan

1. Implement 7.4 and 7.5 behind the existing props (non-breaking defaults).
2. Add `docs/architecture/modal.md` for 7.6.
3. Verify locally with keyboard and a screen reader (VoiceOver).
4. Land via PR.

