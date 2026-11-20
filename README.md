[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zeetasw8-sketch/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zeetasw8-sketch/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Lab

A GTA 6-style cover maker for the [gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01) on make.fun. Build a neon-soaked, Vice City-inspired poster cover in your browser — no account, no upload, no build step. Everything runs locally and offline: pick a layout, drop in a scene or your own photo, grade it, and export a ready-to-post PNG.

## What it does

- **8 multi-panel layouts** — Solo, Duo, Trio, Hero + 2, Quad, Six Up, Nine Up, and Tilted (overlapping, rotated panels).
- **6 colour grades** — Sunset, Neon Vice, Gold Hour, Teal Noir, Candy Pop, and Noir.
- **5 code-drawn sample scenes** — original illustrated scenes (palms, skylines, piers, boulevards) drawn entirely in code. No photos, no brand artwork, no real people.
- **One-click presets** — curated poster looks, plus a "Surprise me" randomiser when you want the app to decide.
- **Duotone** — push any cover into a two-tone neon treatment.
- **Undo / redo** — full edit history, so every experiment is reversible.
- **Photo uploads** — use your own images in any panel, alongside the built-in scenes.
- **Export in 4 sizes** — Square 1080 × 1080, Portrait 1080 × 1350, Wide 1920 × 1080, and Story 1080 × 1920 (PNG, one click per size or all four at once).
- **Offline** — plain HTML, CSS, and JavaScript. No CDN, no tracking, no server calls once loaded.

## Run it

Requires Node.js 22 (standard library only — no dependencies to install).

```sh
node serve.ts
```

Then open <http://localhost:8080> in your browser.

`serve.ts` is a tiny static server for `app/` only: it serves the app on port 8080 (override with `node serve.ts --port 3000`), sends the right MIME types, and refuses any path outside `app/`. It is a development convenience, not a web server for the internet.

You can also open `app/index.html` directly, but the local server is the supported way to run it.

## How to use

1. Pick a layout (8 multi-panel options).
2. Fill each panel with one of the 5 code-drawn scenes or upload your own photo.
3. Choose a grade, try a preset or duotone, and tweak the title text.
4. Undo/redo freely while you experiment.
5. Export the size you need — Square, Portrait, Wide, or Story — as PNG.

## Project layout

```text
app/
  index.html        entry point
  style.css         cover-lab styling
  src/
    main.js         UI wiring (panels, presets, export buttons)
    render.js       canvas renderer + PNG export
    layouts.js      the 8 multi-panel layouts
    grades.js       the 6 colour grades
    scenes.js       the 5 code-drawn sample scenes
    state.js        app state, history (undo/redo), presets, export sizes
    shots.js        screenshot / shot helpers
  samples/          sample images
  fonts/            bundled fonts (offline)
screenshots/        example covers
serve.ts            tiny static server (node serve.ts -> http://localhost:8080)
main.ts             (entry metadata)
shots.json          shot list
LICENSE             MIT
```

## Bounty

Built for [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01) on make.fun. See the live leaderboard via the rank badge above.

## License

MIT — see [LICENSE](LICENSE).
