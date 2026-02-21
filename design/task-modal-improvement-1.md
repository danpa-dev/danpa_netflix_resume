### Modal Improvement 1 — Design Doc

#### Problem statement
- Align the modal with the site’s dark theme and Netflix reference: edge‑to‑edge hero media with overlayed title/controls, clean content area, no decorative borders.

#### Goals
- Use the site’s existing surface/overlay colors (no blue cast).
- Edge‑to‑edge media panel with a bottom gradient into the content.
- Move the title onto the media (lower‑left) and the season selector to lower‑right.
- Remove dotted borders and the banded header.
- Increase and standardize content padding.
- Preserve responsiveness, animations, and a11y.

#### Visual/layout spec
- Background/theme: modal container uses site surface color; overlay scrim matches global overlay.
- Media panel: 100% width inside modal; aspect‑ratio 16:9; object‑fit: cover; consistent border radius.
- Bottom gradient: ~20–30% height `linear-gradient(transparent→dark)` to blend into body.
- Overlays on media:
  - Title lower‑left; responsive `clamp()` size; subtle text shadow/backdrop for contrast.
  - Season selector appears below the media (right‑aligned) on this iteration to ensure dropdown positioning and readability.
- Body: no header band; close button floats top‑right; generous spacing for headings/paragraphs.
- Responsive: maintain safe areas (~24–32px). On narrow widths, allow selector to drop below media if needed.

#### Implementation plan (files)
- `Modal.css`
  - Set container background to site surface var; ensure overlay scrim uses same hue/opacity.
  - Remove header band styles; add floating close button styles.
  - Add `.media-wrapper` with edge‑to‑edge layout and `::after` gradient overlay.
  - Increase `.modal-detail-content` padding; remove any dashed/dotted borders.
- `Modal.tsx`
  - Remove banded header block; keep close button as absolute top‑right.
  - Introduce a media overlay container for title.
- `VideoPlayer.css`
  - Ensure media fills wrapper: `width:100%`, `aspect-ratio:16/9`, `object-fit:cover`, overflow hidden; radius tokens.
- `ItemCard.tsx` (modal portion)
  - Render title in media overlay (lower‑left). Render the season selector in a row below the media, right‑aligned. Keep a semantic heading in body for SRs if needed if we later move/duplicate.
- `SeasonSelector.tsx/.css`
  - Support overlay placement; ensure high contrast, focus ring, and ARIA remain intact.

#### Accessibility
- Keep `role="dialog"`, `aria-modal="true"`, Escape to close, and focus trap.
- Title overlay must remain perceivable; keep a semantic heading (can be visually hidden) or use the overlay title as the heading.
- Maintain AA contrast; prefer role/name queries in tests.

#### Acceptance criteria
- Visual parity with reference: edge‑to‑edge media; bottom gradient; overlayed title/selector; no dotted borders/header band.
- Comfortable body padding; close button top‑right.
- Responsive and a11y complete (keyboard + SR).

#### Test/QA
- Manual: verify breakpoints (320/768/1024/1440), tab order, Escape, SR announcement.
- Playwright: open modal → assert media width ~ container width, title/selector visible, keyboard nav works.
- RTL: structural/a11y assertions for modal roles/labels.

#### Risks/notes
- Don’t lose a semantic heading when removing the header band; ensure SR‑readable title remains.
- Overlay layout must adapt on small screens.

#### Rollout
- Branch `feature/modal-improvement-1` → incremental CSS/structure edits → run `npm run test` and `npm run e2e` → PR & review.


---

### Implementation status (final)
- Container uses `var(--app-surface, #0f1115)`; blue cast removed.
- Media is edge‑to‑edge (`.modal-video-section.full-bleed`) with 16:9 AR; video `object-fit: cover`.
- Bottom gradient increased to ~32% and blends to `var(--app-surface)` for seamless transition.
- Title rendered in `.modal-media-overlay` with higher z‑index; text shadow for contrast.
- Season selector moved below the media in a right‑aligned row (`.modal-season-row`) for better dropdown rendering.
- Close button floats top‑right over media with elevated stacking.
- Native controls hidden; a single Unmute/Mute button is shown at top‑left of the video.
- Dotted borders and banded header removed; paddings standardized.

### Follow‑up tasks
- Optional: add ESC hint and tooltips to controls.
- Optional: support subtitles toggle when real videos are used.