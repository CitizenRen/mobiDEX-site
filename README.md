# mobiDex website

Static site for GitHub Pages — no build step.

## Set up
1. Already set to `CitizenRen/mobiDEX` (`REPO` in `assets/js/main.js` and the links in `index.html`).
2. Push these files to the root of a repo (or a `docs/` folder).
3. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, pick the branch and `/ (root)` or `/docs`.

The Download buttons point at the newest release's `.zip`/`.exe`/`.msi`/`.7z` asset automatically, and the version label updates from the release tag.

## Files
- `index.html` — the page
- `assets/css/style.css` — styles (colours sampled from the app)
- `changelog.html` + `assets/js/changelog.js` — changelog page, built from your GitHub release notes
- `assets/js/main.js` — tour tabs, lightbox, release lookup, copy button
- `assets/img/shots/` — screenshots (WebP)
- `favicon.ico`, `assets/img/favicon-32.png`, `apple-touch-icon.png`, `site.webmanifest` — icons
- `.nojekyll` — tells Pages to serve files as-is

## Changelog
The changelog page lists every release on `CitizenRen/mobiDEX` with its notes, newest first. Write the notes in the GitHub release description (Markdown works) and the page picks them up — visitors see new releases within 30 minutes.
