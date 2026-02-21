## Static Hosting with Netlify + Vite

This project includes a minimal `netlify.toml` to deploy the production build (`dist/`) on Netlify.

### How Vite builds static assets
- `npm run build` runs TypeScript and Vite to produce a fully static site in `dist/`.
- Vite performs bundling, code splitting, CSS extraction/minification, and links assets with hashed filenames for long-term caching.
- Because this is a pure client-side app, you only need to host the `dist/` folder on any static host.

### netlify.toml explained
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/resume/*"
  to = "/resume/index.html"
  status = 200
```

- `[build]`
  - `command`: Netlify runs this to produce the `dist/` folder.
  - `publish`: The directory Netlify serves after the build.

- `[[redirects]]`
  - Optional example for SPA-style routing under `/resume/`. If you serve at `danpa.dev/resume`, requests like `/resume/anything` will rewrite to `/resume/index.html` so the client app can handle routing.
  - If you don’t need client-side routes under `/resume`, you can omit the redirects block.

### Deploying to Netlify
1. Push your repo to GitHub.
2. In Netlify, create a new site from Git, select the repo.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. (Optional) Set environment variables (e.g., `VITE_*`) under Site Settings → Build & deploy → Environment.
5. Trigger a deploy. Netlify will run the build and serve `dist/`.

### Custom domain and path
- Map a Netlify subdomain or your custom domain in Site settings → Domain management.
- If serving under a subpath (`/resume`), ensure any internal resource paths are absolute (`/assets/...`) or correctly resolved by Vite (Vite uses `base` config if you need a non-root base path).

### Local production preview
- `npm run build && npm run preview` starts a local server that serves the `dist/` folder. Useful to validate the production build before pushing.

### Caching and service worker
- This project registers a service worker only in production (`src/main.tsx`) to avoid dev caching pitfalls.
- Netlify serves static files with proper caching headers; hashed filenames from Vite enable long-term caching.

