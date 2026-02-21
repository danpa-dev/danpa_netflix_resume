# Hero Section and Main Page Layout Architecture

## Overview
`MainLayout` orchestrates the top-of-page hero with the carousel rows beneath it. The hero is cinematic but bounded (aspect-ratio driven) so text never clashes with the viewport. Background media and text treatments are split for clarity and reuse.

## Files
- `src/components/MainLayout.tsx` / `.css`
- `src/components/Hero.tsx` / `.css`
- `src/components/BackgroundMedia.tsx` / `.css`
- `src/components/TextOverlay.tsx` / `.css`

## Structure
```
MainLayout
├── Skip link
├── <main id="main-content">
│   ├── Hero
│   │   ├── BackgroundMedia (video → image → gradient)
│   │   └── TextOverlay (title/subtitle)
│   └── Carousel sections container (children)
```

## MainLayout behavior
- Props: `heroTitle`, `heroSubtitle?`, `heroBackgroundImage?`, `heroBackgroundVideo?`, `children?`, `className?`.
- Adds an accessible skip link to jump to `#main-content`.
- Wraps children in `.carousel-sections`, spacing controlled by design tokens (`--space-24/32/48`).
- `will-change: scroll-position` hints the browser for smooth top-level scrolling.

## Hero behavior
- Fixed 16:9 aspect ratio with `min-height: clamp(280px, 40vw, 70vh)` and `max-height: 88vh` to keep content legible on narrow screens.
- Delegates all media handling to `BackgroundMedia` and text styling to `TextOverlay`.
- Focus and high-contrast modes are supported via CSS outlines and shadows.

## BackgroundMedia
- Chooses media in order: video (if provided) → image → gradient fallback.
- Autoplays video (muted/looped/playsInline); if load or autoplay fails it falls back to the image.
- Images load with `loading="lazy"`; both media types transition opacity on load. A spinner shows while loading; gradient stays visible if both sources fail.
- Notifies optional `onLoad`/`onError` callbacks for future telemetry.

## TextOverlay
- Left-aligned overlay with a strong left-to-right gradient (`::before`) to guarantee contrast over bright imagery.
- Typography uses `clamp` for responsive sizing; animations fade/slide in but are disabled when `prefers-reduced-motion` is set.
- Accessible labels: defaults to `aria-label` composed from title/subtitle; uses semantic `h1`/`h2`.

## Design tokens
- Color and typography variables live in `App.css`; spacing tokens in `src/styles/tokens.css`.
- Shared utility `.u-hover-lift` is available for interactive elements below the hero.

## Future considerations
- Optional parallax or scroll-linked effects in `BackgroundMedia` once performance is validated.
- Theme support could move more gradient values into CSS variables to better align with dynamic theming.
