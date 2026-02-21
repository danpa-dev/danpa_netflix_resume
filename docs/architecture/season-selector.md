## Season Selector Component Architecture

### Purpose
Allow users to switch between seasons (project groupings) inside the work-experience modal with Netflix-style UX.

### Files
- `src/components/SeasonSelector.tsx`: accessible dropdown with keyboard and outside-click close.
- `src/components/SeasonSelector.css`: styles (dark theme, red accent).
- `src/components/ItemCard.tsx`: integrates selector and animates content swaps.
- `src/components/Carousel.tsx`: passes `seasons` from content items to `ItemCard`.

### Data Flow
`manifest.json` + section files → `Carousel` (items) → `ItemCard` (receives `seasons`) → local state `selectedSeasonIndex` → overrides `videoUrl` and description.

### Accessibility
- Button with `aria-haspopup=listbox` and `aria-expanded`; label falls back to `title` → `name` → `id` → `Season N`.
- Listbox/option roles; keyboard: Enter/Space toggle menu, Esc closes, ArrowUp/ArrowDown cycles options while open.
- Outside clicks close the menu; focus and hover states use high-contrast tints.

### Animations
- Dropdown: fade/scale via Framer Motion; anchored to the right edge so it aligns with the modal overlay.
- Video/description swap: fade transition keyed by content.

### Error Handling
- If no seasons available, selector is hidden; base item content shown.
- Missing video/description for a season falls back to item-level fields.

### Future Extensions
- Episode drill-down beneath each season.
- Persist last selected season per item in localStorage.
