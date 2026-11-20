// Wires the Vice Cover Lab editor: controls, panel drag-pan and wheel-zoom,
// photo uploads, undo/redo, presets, Surprise me and PNG exports. A `?shot=`
// query sets up a fixed scene for a screenshot instead (./shots.js).
import { renderCover, exportCover } from './render.js';
import { defaultState, History, PRESETS, applyPreset, surpriseState, resizePanels, freshPanel, EXPORT_SIZES, snapshotState } from './state.js';
import { LAYOUTS, artAreaFraction } from './layouts.js';
import { GRADES } from './grades.js';
import { SCENES, SCENE_IDS } from './scenes.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const status = $('status');
const isShot = new URLSearchParams(location.search).has('shot');

let state = defaultState();
let photos = []; // uploaded Images, referred to by index from panel state
let selected = 0;
const history = new History();

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  // Screenshot scenes show the clean cover: no selection highlight.
  renderCover(canvas, state, photos, { grid: state.showGrid, selected, highlight: !isShot });
  syncControls();
  $('undoBtn').disabled = !history.canUndo;
  $('redoBtn').disabled = !history.canRedo;
}

/** Records the pre-change state, then runs the change and redraws. */
function change(fn) {
  history.push(snapshotState(state));
  fn();
  redraw();
}

function syncControls() {
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('badgeInput').value = state.badge;
  $('showBadge').checked = state.showBadge;
  $('titleScale').value = state.titleScale;
  $('shadowRange').value = state.shadow;
  $('outlineToggle').checked = state.outline;
  $('duotoneToggle').checked = state.duotone;
  $('gridToggle').checked = state.showGrid;
  document.querySelectorAll('#layoutGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
    b.setAttribute('aria-pressed', String(b.dataset.layout === state.layout));
  });
  document.querySelectorAll('#gradeGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
    b.setAttribute('aria-pressed', String(b.dataset.grade === state.grade));
  });
  syncPanelControls();
}

function syncPanelControls() {
  const panel = state.panels[selected];
  const sel = $('panelSource');
  sel.innerHTML = '';
  for (const id of SCENE_IDS) {
    const opt = document.createElement('option');
    opt.value = `scene:${id}`;
    opt.textContent = `Scene: ${SCENES[id].label}`;
    sel.appendChild(opt);
  }
  photos.forEach((img, i) => {
    const opt = document.createElement('option');
    opt.value = `photo:${i}`;
    opt.textContent = `Photo ${i + 1}`;
    sel.appendChild(opt);
  });
  sel.value = panel ? `${panel.source.kind}:${panel.source.kind === 'photo' ? panel.source.index : panel.source.scene}` : '';
  $('panelZoom').value = panel ? panel.zoom : 1;
  $('panelLabel').textContent = `Panel ${selected + 1} of ${state.panels.length}`;
}

function buildPicker(containerId, items, onPick) {
  const box = $(containerId);
  box.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.label;
    b.dataset[item.key] = item.id;
    b.title = item.hint || item.label;
    if (item.swatch) b.style.setProperty('--swatch', item.swatch);
    b.addEventListener('click', () => onPick(item.id));
    box.appendChild(b);
  }
}

buildPicker('layoutGrid', Object.entries(LAYOUTS).map(([id, l]) => ({
  id, key: 'layout', label: l.label, hint: l.hint,
})), (id) => change(() => { state.layout = id; resizePanels(state, 'boulevard'); selected = 0; }));

buildPicker('gradeGrid', Object.entries(GRADES).map(([id, g]) => ({
  id, key: 'grade', label: g.label, swatch: `linear-gradient(135deg, ${g.duoLight}, ${g.duoDark})`,
})), (id) => change(() => { state.grade = id; }));

buildPicker('presetRow', PRESETS.map((p, i) => ({ id: String(i), key: 'preset', label: p.name })), (id) => {
  change(() => { applyPreset(state, PRESETS[Number(id)]); selected = 0; });
  status.textContent = `Preset “${PRESETS[Number(id)].name}” applied — one click, poster done.`;
});

// ---- text and lettering controls ------------------------------------------
$('titleInput').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('titleInput').addEventListener('change', () => { history.push(snapshotState(state)); });
$('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('badgeInput').addEventListener('input', (e) => { state.badge = e.target.value; redraw(); });
$('showBadge').addEventListener('change', (e) => change(() => { state.showBadge = e.target.checked; }));
$('titleScale').addEventListener('input', (e) => { state.titleScale = Number(e.target.value); redraw(); });
$('shadowRange').addEventListener('input', (e) => { state.shadow = Number(e.target.value); redraw(); });
$('outlineToggle').addEventListener('change', (e) => change(() => { state.outline = e.target.checked; }));
$('duotoneToggle').addEventListener('change', (e) => change(() => { state.duotone = e.target.checked; }));
$('gridToggle').addEventListener('change', (e) => { state.showGrid = e.target.checked; redraw(); });

// ---- history, surprise, fill-all ------------------------------------------
$('undoBtn').addEventListener('click', () => {
  const prev = history.undo(snapshotState(state));
  if (prev) { state = prev; selected = Math.min(selected, state.panels.length - 1); redraw(); }
});
$('redoBtn').addEventListener('click', () => {
  const next = history.redo(snapshotState(state));
  if (next) { state = next; selected = Math.min(selected, state.panels.length - 1); redraw(); }
});
$('surpriseBtn').addEventListener('click', () => {
  change(() => { surpriseState(state); selected = 0; });
  status.textContent = 'Surprise! A fresh poster — layout, grade and scenes shuffled.';
});
$('fillAllBtn').addEventListener('click', () => {
  change(() => {
    const donor = state.panels[selected];
    state.panels = state.panels.map(() => ({ ...donor, source: { ...donor.source } }));
  });
  status.textContent = 'Filled every panel with the selected panel’s image.';
});

// ---- photos ----------------------------------------------------------------
$('photoInput').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    try {
      photos.push(await loadImage(URL.createObjectURL(file)));
    } catch { /* unreadable file: skip it, keep the rest */ }
  }
  if (photos.length) {
    change(() => {
      state.panels[selected].source = { kind: 'photo', index: photos.length - 1 };
      state.panels[selected].zoom = 1;
      state.panels[selected].dx = 0;
      state.panels[selected].dy = 0;
    });
    status.textContent = `${photos.length} photo${photos.length > 1 ? 's' : ''} loaded — the selected panel uses the newest one.`;
  }
  syncPanelControls();
  e.target.value = '';
});

// ---- selected panel: source, zoom, reset -----------------------------------
$('panelSource').addEventListener('change', (e) => {
  const [kind, value] = e.target.value.split(':');
  change(() => {
    state.panels[selected].source = kind === 'photo'
      ? { kind: 'photo', index: Number(value) }
      : { kind: 'scene', scene: value };
    state.panels[selected].zoom = 1;
    state.panels[selected].dx = 0;
    state.panels[selected].dy = 0;
  });
});
$('panelZoom').addEventListener('input', (e) => {
  state.panels[selected].zoom = Number(e.target.value);
  state.panels[selected].dx = 0;
  state.panels[selected].dy = 0;
  redraw();
});
$('panelReset').addEventListener('click', () => {
  change(() => {
    state.panels[selected] = freshPanel('boulevard');
  });
  status.textContent = 'Panel reset to the Boulevard Sunset scene.';
});

// ---- canvas hit-testing, drag-pan, wheel-zoom -------------------------------
function panelRects() {
  const W = canvas.width;
  const H = canvas.height;
  const artH = H * artAreaFraction(W, H);
  const gap = Math.max(3, Math.round(W * 0.006));
  const layout = LAYOUTS[state.layout];
  return layout.panels.map((p) => {
    const x = p.x * W + (p.x > 0 ? gap / 2 : 0);
    const y = p.y * artH + (p.y > 0 ? gap / 2 : 0);
    const w = p.w * W - (p.x > 0 ? gap / 2 : 0) - (p.x + p.w < 1 ? gap / 2 : 0);
    const h = p.h * artH - (p.y > 0 ? gap / 2 : 0) - (p.y + p.h < 1 ? gap / 2 : 0);
    return { x, y, w, h, rot: (p.rot || 0) * Math.PI / 180 };
  });
}

function hitPanel(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  const px = (clientX - rect.left) * sx;
  const py = (clientY - rect.top) * sy;
  const rects = panelRects();
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    // un-rotate the point around the panel centre for tilted panels
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dx = px - cx;
    const dy = py - cy;
    const cos = Math.cos(-r.rot);
    const sin = Math.sin(-r.rot);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    if (Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2) return i;
  }
  return -1;
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const i = hitPanel(e.clientX, e.clientY);
  if (i < 0) return;
  selected = i;
  const rect = canvas.getBoundingClientRect();
  drag = {
    panel: i,
    startX: e.clientX,
    startY: e.clientY,
    dx: state.panels[i].dx,
    dy: state.panels[i].dy,
    scale: canvas.width / rect.width,
    moved: false,
  };
  history.push(snapshotState(state));
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const panel = state.panels[drag.panel];
  const dx = drag.dx + (e.clientX - drag.startX) * drag.scale;
  const dy = drag.dy + (e.clientY - drag.startY) * drag.scale;
  const rects = panelRects();
  const r = rects[drag.panel];
  const maxDx = Math.max(0, r.w * (panel.zoom - 1));
  const maxDy = Math.max(0, r.h * (panel.zoom - 1));
  panel.dx = Math.min(maxDx, Math.max(-maxDx, dx));
  panel.dy = Math.min(maxDy, Math.max(-maxDy, dy));
  if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 3) drag.moved = true;
  redraw();
});
canvas.addEventListener('pointerup', () => {
  if (drag && !drag.moved) history.future.length = 0; // a plain click: no undo step
  if (drag && !drag.moved) history.past.pop();
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const i = hitPanel(e.clientX, e.clientY);
  if (i < 0) return;
  const panel = state.panels[i];
  const next = Math.min(3, Math.max(1, panel.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
  if (next !== panel.zoom) {
    history.push(snapshotState(state));
    panel.zoom = next;
    panel.dx = 0;
    panel.dy = 0;
    selected = i;
    redraw();
  }
}, { passive: false });

// ---- exports ----------------------------------------------------------------
function download(canvasEl, name) {
  canvasEl.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

$('exportBtn').addEventListener('click', () => {
  const size = EXPORT_SIZES.find((s) => s.id === $('exportSize').value) || EXPORT_SIZES[0];
  const out = exportCover(state, photos, size.w, size.h);
  download(out, `vice-cover-${size.w}x${size.h}.png`);
  status.textContent = `Saved vice-cover-${size.w}x${size.h}.png`;
});
$('exportAllBtn').addEventListener('click', () => {
  EXPORT_SIZES.forEach((size, i) => {
    setTimeout(() => {
      download(exportCover(state, photos, size.w, size.h), `vice-cover-${size.w}x${size.h}.png`);
    }, i * 250);
  });
  status.textContent = 'Saved all 4 sizes — square, portrait, wide and story.';
});

// ---- screenshots ------------------------------------------------------------
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (setup) => {
    if (setup.preset != null) applyPreset(state, PRESETS[setup.preset]);
    if (setup.layout) state.layout = setup.layout;
    if (setup.grade) state.grade = setup.grade;
    if (setup.title) state.title = setup.title;
    if (setup.subtitle) state.subtitle = setup.subtitle;
    if (setup.duotone) state.duotone = true;
    if (setup.photo) {
      try {
        photos.push(await loadImage(`samples/${setup.photo}.jpg`));
        // The hero panel takes the photo; the rest keep their scenes, so the
        // editor shot shows one photo filling several panels at once.
        state.panels[0] = { source: { kind: 'photo', index: photos.length - 1 }, zoom: 1, dx: 0, dy: 0 };
      } catch { /* sample missing: keep the scenes */ }
    }
    if (setup.scenes) {
      state.panels = setup.scenes.map((scene) => freshPanel(scene));
      resizePanels(state, setup.scenes[0]);
    }
    resizePanels(state, 'boulevard');
    redraw();
  });
} else {
  redraw();
}
