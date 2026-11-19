# Vice Cover Lab — make.fun gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zeetasw8-sketch/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zeetasw8-sketch/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Lab** turns your photo and a caption into multi-panel cover art in the style of GTA 6 posters — a Vice City neon-sunset grade, bold poster lettering, several panels — and exports it as a PNG to share. It runs **offline in a desktop browser from its own static files**: your photos never leave your machine, there is no upload, no account and no watermark.

Made for the make.fun bounty [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01) ($250, 50 places).

## What it does

- **Any photo, any panel** — drag-and-drop or pick files, up to as many photos as you like; click any panel in the preview to select it, then crop it with zoom and pan (drag straight on the canvas, or scroll to zoom), or swap its photo. One click fills every panel with the same photo.
- **8 multi-panel layouts** — Solo, Duo, Trio, Hero + 2, Quad grid, Six Up, Nine Up, and Tilted snapshots (scattered polaroids with white frames and soft shadows); one photo can fill every panel or each panel can hold a different photo.
- **6 colour grades** — Sunset, Neon Vice, Gold Hour, Teal Noir, Candy Pop and Noir, each a gradient wash over the photos, plus film grain and a vignette.
- **Poster lettering** — an eyebrow line, a big Anton title with outline and neon glow, and a Pacifico script subtitle (both fonts vendored under the SIL Open Font License), over a halftone-dot title band. The title block is measured and shrunk to fit, so the lettering never clips at any export size.
- **Undo / redo** — every change (layout, grade, crop, lettering) can be undone with Ctrl+Z and redone with Ctrl+Y, or the buttons up top.
- **Surprise me** — one click shuffles layout, grade and an invented title for a fresh look.
- **Fast to a PNG** — one click exports 1080 × 1080, 1080 × 1350, 1920 × 1080 or 1080 × 1920, or all four sizes at once.
- **3 original sample scenes** — a sunset boulevard, a neon night street and a fishing pier, drawn for this app with code (no stock photos, no game artwork), so the cover maker shows its art immediately.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no install, no network while it runs. Open `app/index.html` directly in a browser works too.

## How it is built

- `app/index.html` + `app/style.css` — the editor (controls on the left, live canvas preview on the right).
- `app/src/cover.js` — the cover engine: layouts, grades, photo cover-fit with zoom/pan, tilted polaroid panels, halftone title band, title block that always fits, grain and vignette. The preview and the export are the same `drawCover()` call at different sizes, so what you see is what you share.
- `app/src/main.js` — editor state, photo loading, drag-and-drop, panel click-to-select, drag-to-pan and wheel zoom, undo/redo history, shuffle and fill-all, PNG export.
- `app/src/shots.js` — fixed `?shot=` scenes for the screenshots (`?shot=cover` shows the cover alone, `?shot=editor` the editor with a photo loaded).
- `app/samples/` — three original illustrated scenes; `app/fonts/` — Anton + Pacifico (OFL).
- `main.ts` — the make.fun entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.
- `screenshots/` — 4 screenshots: the exported covers first, then the editor at work.

## Originality

Everything here is the author's own: the app, the cover engine, the sample scenes and the screenshots. No Rockstar Games logo, official artwork or fonts are used anywhere; the lettering is Anton and Pacifico under the SIL Open Font License (see `app/fonts/OFL.txt`). No network request is made while the app runs — fonts and samples are vendored in `app/`.

## License

MIT — see `LICENSE`.
