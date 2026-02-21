# Carousel Component Architecture

## Overview
Reusable Netflix-style horizontal rows used for work experience, education, skills, projects, and volunteer sections. Focus areas: responsive sizing, lazy loading, smooth arrow-driven scrolling, and predictable accessibility semantics.

## Key files
- `src/components/Carousel.tsx` and `.css`
- `src/components/ItemCard.tsx` (child renderer)
- Hooks: `useResponsiveCarousel.ts`, `useLazyCarousel.ts`, `useIntersectionObserver.ts`
- Data: `src/data/manifest.json` + section files, types in `src/types/content.ts`

## Render tree
```
Carousel
├── Header (h2)
└── Container (sets CSS vars from sizing hook)
    ├── Left arrow (motion)
    ├── Track (scrollable list)
    │   └── Item wrapper(s)
    │       ├── Skeleton placeholder
    │       └── ItemCard (when loaded)
    └── Right arrow (motion)
```

## Props and data shape
```ts
interface CarouselProps { title: string; items: CarouselItem[]; className?: string; defaultThumbnailUrl?: string; }
interface CarouselItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  seasons?: Array<{ id?: string; title?: string; name?: string; description?: string; videoUrl?: string; }>;
  [key: string]: any;
}
```

## Runtime behavior
- **Responsive sizing:** `useResponsiveCarousel` computes `--carousel-card-width`, gap, and padding based on breakpoints (3 cards on mobile, 4 on tablet, 5 on desktop; gaps 8–24px). Min/max widths are constrained to 200–400px to avoid extreme stretching.
- **Scroll controls:** Arrows stay hidden until the container is hovered (CSS). Scroll distance = `cardWidth + gap`. `checkScrollPosition` runs on mount and during scroll to enable/disable buttons so arrows only react when movement is possible.
- **Lazy loading:** `useLazyCarousel(items, { preloadDistance: 150, loadDelay: 0, maxConcurrentLoads: 10, enableVirtualization: items.length > 20 })`. The first 8 items are force-loaded immediately to avoid blank initial viewports. Each item renders a skeleton until its `lazyItems[id].isLoaded` flips true. Virtualization flags exist but rendering still mounts every item.
- **Item rendering:** When an entry is loaded it renders `ItemCard` with title/description, season data, thumbnails, and video metadata. `ItemCard` handles modal launching and its own image loading fallback.
- **State cleanup:** Track listeners are removed on unmount; lazy-loading timers/observers are managed inside the hook.

## Accessibility
- Section is `role="region"` with `aria-labelledby` tied to the h2 id; track is `role="list"` and each entry `role="listitem"`.
- Arrow buttons are actual `<button>` elements with `aria-label` and disabled states. Hover-triggered visibility is visual only—buttons remain focusable.
- ItemCards expose `role="button"` with keyboard activation (Enter/Space).

## Performance characteristics
- Intersection Observer backs lazy loading; concurrency is capped to 10 to avoid request storms.
- Responsive calculations are debounced on resize; CSS custom properties prevent layout thrash.
- Skeletons ensure consistent card height; scroll snapping keeps motion smooth without JS-driven transforms.
- No virtualization yet—large datasets may warrant follow-up to window the DOM.

## Integration points
- `App.tsx` renders one Carousel per enabled section fetched via `useContent`.
- Season data flows through Carousel → ItemCard → Modal → `SeasonSelector`, letting modal media/description swap without re-rendering the entire row.
- Tokens from `tokens.css` drive spacing; theme colors come from `App.css` CSS variables.

## Follow-ups to consider
- Add keyboard arrow key navigation across items and focus trapping within a row.
- Implement real virtualization in `useLazyCarousel` for very long lists.
- Optional snap alignment tweaks for narrow viewports and RTL support.
