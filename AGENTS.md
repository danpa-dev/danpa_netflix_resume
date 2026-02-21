# dan_resume

A Netflix-inspired, content-driven portfolio and resume site built with React 19, TypeScript, and Vite.

## Overview

This project demonstrates a content-driven architecture where all visible content is defined in JSON files, enabling rapid content updates without code changes. The site features a responsive hero section, horizontal carousels for different content categories (work, education, skills, personal projects, volunteer work), and modal-based detail views with video support.

## Architecture

- **Content-Driven Design**: Site content is governed by `src/data/manifest.json` and individual section JSON files
- **Type Safety**: Full TypeScript implementation with strict type guards for content validation
- **Responsive Layout**: CSS custom properties for adaptive carousel behavior across device sizes
- **Performance**: Lazy loading, skeleton states, and code splitting for optimal bundle sizes
- **Accessibility**: Focus management in modals, keyboard navigation, and prefers-reduced-motion support

## Tech Stack

- React 19
- TypeScript
- Vite
- Framer Motion
- Styled Components
- React Router
- Vitest + React Testing Library

## Development

```bash
npm install
npm run dev    # Dev server at localhost:5173
npm run build  # Production build
npm run test   # Run tests
```

## Data Structure

Each section (work, education, skills, etc.) has a corresponding JSON file in `src/data/` with:

- An array of content items
- A `metadata` block with default media URLs and configurations
- Optional multi-season support (e.g., different roles at the same company)

Adding or updating content is as simple as editing the relevant JSON file.
