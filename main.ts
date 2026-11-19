// Vice Cover Lab — the make.fun entry program (Node 22, stdlib only).
//
// The app is this directory's app/ folder: plain static files a desktop
// browser loads offline (app/index.html and its ES modules, vendored fonts,
// three original sample scenes, no network request at runtime). The cover
// engine inside draws 8 layouts (six grids, a nine-panel grid and tilted
// polaroid snapshots), 6 grades, a halftone title band and undo/redo.
// This program hands it in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library (vendor/makefun-app.ts,
// the kit's own copy, byte for byte the scorer's).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB
// of app files in all, or a path under app/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
console.log(`Vice Cover Lab handed in: app/ + screenshots/ copied to ${out}`);
