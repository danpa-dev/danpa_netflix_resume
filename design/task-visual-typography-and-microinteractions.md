### Visual System: Typography Scale, Spacing, and Micro‑interactions — Design Doc

#### Problem statement
The site should feel cinematic, cohesive, and tactile. We need a responsive typographic scale, consistent spacing rhythm, and refined micro‑interactions (hover/press/focus) that respect reduced‑motion preferences.

#### Goals
- Establish a responsive type ramp with `clamp()` and consistent line‑height/letter‑spacing.
- Adopt a spacing scale (e.g., 4/8px) applied across sections.
- Add tasteful micro‑interactions (hover lift, soft shadow, color shifts) with reduced‑motion fallbacks.

#### Visual/layout spec
- Typography tokens
  - h1–h6, subtitle, body, caption with `clamp(min, vw, max)`; line‑height ~1.2–1.35 for headings.
  - Tracking slightly tighter on display sizes; normal for body.
- Spacing tokens
  - `--space-2,4,6,8,12,16,24,32,48`: use across paddings/gaps/margins.
- Micro‑interactions
  - Cards/buttons: scale 1.00→1.03 on hover, drop shadow depth +2; press to 0.99.
  - Header/controls: subtle background tint on hover; clear focus ring.
  - Respect `@media (prefers-reduced-motion: reduce)` → disable scale/transition, keep color states only.

#### Implementation plan (files)
- `src/styles/typography.css`: type ramp classes and CSS variables (already present).
- `src/styles/tokens.css`: new spacing and motion tokens + micro‑interaction utilities (`.u-hover-lift`).
- `src/App.css`: import `tokens.css` along with `typography.css`.
- `src/components/*/*.css`: apply the spacing/transition tokens and micro‑interaction utilities where appropriate.

#### Accessibility
- Maintain visible focus ring with >3:1 contrast on dark backgrounds.
- Reduced motion support everywhere.

#### Acceptance criteria
- Consistent type ramp across hero, carousel titles, modal headings.
- Interaction states feel responsive without jank; no motion if reduced‑motion is on. Header links show underline expansion animation using tokenized easing/duration.

#### Test/QA
- Manual: verify typography/spacing across breakpoints; interaction states on mouse, keyboard, touch.
- Automated: basic RTL checks for focus visibility; Lighthouse a11y pass.

#### Risks/notes
- Avoid over‑animation; keep subtle and purposeful.

#### Rollout
- Small CSS‑only PRs per component group; verify visually before merging.

