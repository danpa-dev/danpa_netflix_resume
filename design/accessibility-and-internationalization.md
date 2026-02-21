### Accessibility & Internationalization — Design Doc

#### Problem statement
Ensure the experience is inclusive (keyboard, screen readers, high contrast, motion preferences) and future‑proof for localization.

#### Goals
- Maintain robust roles/labels/headings; visible focus; high contrast on dark backgrounds.
- Global reduced‑motion and color‑contrast support.
- i18n scaffolding for future locales.

#### Spec
- A11y
  - Keep `role="dialog"` + focus trap; Escape close.
  - Prefer role/name queries in tests (`getByRole`, `getByLabelText`).
  - Focus ring: 2px brand + 2px offset on dark surfaces.
  - Ensure overlays (on media) pass WCAG AA with gradient support.
- i18n
  - Add a small translation layer (e.g., dictionary object + hook) so text nodes can be swapped per locale.
  - Persist locale in localStorage; default to browser language.

#### Implementation plan
- `src/styles/a11y.css`: unified focus ring and high‑contrast utilities.
- Minimal i18n: `src/i18n/` with `en.json` and a simple hook (`useI18n`) used in components.
- Tests: RTL checks for focus visibility and role/label presence.

#### Acceptance criteria
- Keyboard‑only users can fully operate carousels and modals.
- Text and overlays meet contrast; reduced‑motion respected site‑wide.
- Locale switch prototype works for key strings.

