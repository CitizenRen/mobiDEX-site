# mobiDEX website

Static site for GitHub Pages — no build step.

## Set up
1. Already set to `CitizenRen/mobiDEX` (`REPO` in `assets/js/main.js` and the links in `index.html`).
2. Push these files to the root of a repo (or a `docs/` folder).
3. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, pick the branch and `/ (root)` or `/docs`.

The Download buttons point at the newest release's `.zip`/`.exe`/`.msi`/`.7z` asset automatically, and the version label updates from the release tag.

## Files
- `index.html` — the page
- `assets/css/style.css` — styles (colours sampled from the app)
- `assets/js/main.js` — tour tabs, lightbox, release lookup
- `assets/img/shots/` — screenshots (WebP)
- `favicon.ico`, `assets/img/favicon-32.png`, `apple-touch-icon.png`, `site.webmanifest` — icons
- `.nojekyll` — tells Pages to serve files as-is
