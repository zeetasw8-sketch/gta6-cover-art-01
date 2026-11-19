// Vice Cover Lab — editor wiring: state, photo loading, controls, export.
// The preview canvas and the exported PNG are the same drawCover() call
// at different sizes, so what you see is exactly what you share.
//
// Extra editor powers over a plain cover maker: undo/redo over every
// change, one-click shuffle of the whole look, fill-every-panel with one
// photo, and drag-to-pan plus wheel-zoom straight on the preview canvas.

import { LAYOUTS, GRADES, SIZES, drawCover, panelRects } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = [
  { id: 'boulevard', label: 'Boulevard sunset', src: 'samples/boulevard.jpg' },
  { id: 'neon', label: 'Neon street', src: 'samples/neon.jpg' },
  { id: 'pier', label: 'Fishing pier', src: 'samples/pier.jpg' },
];

const LOOKS = [
  { title: 'NEON SHORE', subtitle: 'a sunset heist in three panels', eyebrow: 'VICE COAST' },
  { title: 'NIGHT SHIFT', subtitle: 'the city never sleeps', eyebrow: 'VICE COAST' },
  { title: 'PIER PRESSURE', subtitle: 'one last cast at golden hour', eyebrow: 'VICE COAST' },
  { title: 'SUNSET RUN', subtitle: 'top down, radio up', eyebrow: 'VICE COAST' },
  { title: 'PALM HEIST', subtitle: 'in and out before dark', eyebrow: 'VICE COAST' },
  { title: 'GOLD HOUR', subtitle: 'every street looks expensive', eyebrow: 'VICE COAST' },
  { title: 'MIDNIGHT DRIVE', subtitle: 'neon in the rear-view', eyebrow: 'VICE COAST' },
  { title: 'TURQUOISE HEAT', subtitle: 'salt air and fast cars', eyebrow: 'VICE COAST' },
  { title: 'BOARDWALK KINGS', subtitle: 'kings of the coast', eyebrow: 'VICE COAST' },
];

const DEFAULT_STATE = {
  layout: 'hero',
  grade: 'sunset',
  sizeKey: 'portrait',
  eyebrow: 'VICE COAST',
  title: 'NEON SHORE',
  subtitle: 'a sunset heist in three panels',
  titleScale: 1,
  grain: true,
  halftone: true,
  selected: 0,
  panels: [
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 1, zoom: 1, ox: 0, oy: 0 },
    { photo: 2, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 1, zoom: 1, ox: 0, oy: 0 },
    { photo: 2, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 1, zoom: 1, ox: 0, oy: 0 },
    { photo: 2, zoom: 1, ox: 0, oy: 0 },
  ],
};

export const state = structuredClone(DEFAULT_STATE);
export const photos = [];

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');

// --- Undo / redo: a snapshot is the whole editable state, JSON-cloned. ---
const past = [];
const future = [];
const MAX_HISTORY = 50;

function snapshot() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, sizeKey: state.sizeKey,
    eyebrow: state.eyebrow, title: state.title, subtitle: state.subtitle,
    titleScale: state.titleScale, grain: state.grain, halftone: state.halftone,
    panels: state.panels,
  });
}

function applySnapshot(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  state.panels = s.panels;
  syncTextInputs();
  refreshChips();
  render();
}

export function pushHistory() {
  const snap = snapshot();
  if (past.length && past[past.length - 1] === snap) return;
  past.push(snap);
  if (past.length > MAX_HISTORY) past.shift();
  future.length = 0;
  syncUndoButtons();
}

export function undo() {
  if (!past.length) return;
  future.push(snapshot());
  applySnapshot(past.pop());
  syncUndoButtons();
  setStatus('Undid that change.');
}

export function redo() {
  if (!future.length) return;
  past.push(snapshot());
  applySnapshot(future.pop());
  syncUndoButtons();
  setStatus('Redid that change.');
}

function syncUndoButtons() {
  const u = $('undo');
  const r = $('redo');
  if (u) u.disabled = past.length === 0;
  if (r) r.disabled = future.length === 0;
}

/** One random look: new layout, grade and invented title, in one click. */
export function shuffleLook() {
  pushHistory();
  const layouts = Object.keys(LAYOUTS);
  const grades = Object.keys(GRADES);
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  state.grade = grades[Math.floor(Math.random() * grades.length)];
  const look = LOOKS[Math.floor(Math.random() * LOOKS.length)];
  state.title = look.title;
  state.subtitle = look.subtitle;
  state.eyebrow = look.eyebrow;
  state.selected = 0;
  syncTextInputs();
  refreshChips();
  render();
  setStatus(`Surprise look: ${state.title} — ${LAYOUTS[state.layout].name} layout, ${GRADES[state.grade].name} grade.`);
}

/** Fill every panel with the selected panel's photo, in one click. */
export function fillAllPanels() {
  pushHistory();
  const photo = (state.panels[state.selected] || {}).photo ?? 0;
  state.panels.forEach((p) => { p.photo = photo; });
  render();
  setStatus(`Every panel now shows photo ${photo + 1}.`);
}

/** Fit the preview canvas to the chosen export aspect, then redraw. */
export function render() {
  const size = SIZES[state.sizeKey];
  const scale = Math.min(720 / size.w, 640 / size.h, 1);
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
  drawCover(canvas, state, photos, state.sizeKey);
  syncPanelControls();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

export async function addPhotoFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    pushHistory();
    photos.push(img);
    const idx = photos.length - 1;
    const panel = state.panels[state.selected] || state.panels[0];
    panel.photo = idx;
    refreshPhotoLists();
    render();
    setStatus(`Photo ${photos.length} loaded — it now fills panel ${state.selected + 1}.`);
    return idx;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function loadSample(id) {
  const sample = SAMPLES.find((s) => s.id === id);
  if (!sample) return;
  const img = await loadImage(sample.src);
  photos.push(img);
  const idx = photos.length - 1;
  state.panels[state.selected].photo = idx;
  refreshPhotoLists();
  render();
  setStatus(`Sample “${sample.label}” loaded into panel ${state.selected + 1}.`);
}

function refreshPhotoLists() {
  const sel = $('panel-photo');
  if (!sel) return;
  sel.innerHTML = '';
  photos.forEach((_, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `Photo ${i + 1}`;
    sel.appendChild(opt);
  });
  const panel = state.panels[state.selected];
  if (panel) sel.value = String(panel.photo ?? 0);
}

function syncPanelControls() {
  const panel = state.panels[state.selected] || {};
  const set = (id, v) => { const el = $(id); if (el) el.value = v; };
  set('zoom', panel.zoom ?? 1);
  set('pan-x', panel.ox ?? 0);
  set('pan-y', panel.oy ?? 0);
  const sel = $('panel-photo');
  if (sel && panel.photo != null) sel.value = String(panel.photo);
  const lab = $('selected-panel');
  if (lab) lab.textContent = `Panel ${state.selected + 1} of ${(LAYOUTS[state.layout] || LAYOUTS.hero).panels.length}`;
}

function syncTextInputs() {
  const set = (id, v) => { const el = $(id); if (el) el.value = v; };
  set('eyebrow', state.eyebrow);
  set('title', state.title);
  set('subtitle', state.subtitle);
  set('title-scale', state.titleScale);
  const g = $('grain-toggle');
  if (g) g.checked = state.grain !== false;
  const ht = $('halftone-toggle');
  if (ht) ht.checked = state.halftone !== false;
}

/** Export the cover as a PNG at the chosen post size. */
export async function exportPNG(sizeKey) {
  const size = SIZES[sizeKey || state.sizeKey];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state, photos, sizeKey || state.sizeKey);
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG export failed');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vice-cover-${size.w}x${size.h}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  setStatus(`Exported ${size.w} × ${size.h} PNG (${(blob.size / 1024).toFixed(0)} KB).`);
  return blob;
}

function buildButtons(containerId, entries, current, onPick) {
  const box = $(containerId);
  if (!box) return;
  box.innerHTML = '';
  for (const [key, entry] of Object.entries(entries)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (key === current ? ' active' : '');
    b.textContent = entry.name;
    b.addEventListener('click', () => {
      pushHistory();
      onPick(key);
      buildButtons(containerId, entries, key, onPick);
    });
    box.appendChild(b);
  }
}

function refreshChips() {
  buildButtons('layout-picks', LAYOUTS, state.layout, (k) => {
    state.layout = k;
    state.selected = 0;
    render();
  });
  buildButtons('grade-picks', GRADES, state.grade, (k) => {
    state.grade = k;
    render();
  });
  buildButtons('size-picks', SIZES, state.sizeKey, (k) => {
    state.sizeKey = k;
    render();
  });
}

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

/** Panel hit-test in canvas pixels, for click and drag on the preview. */
function panelAt(e) {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  const y = ((e.clientY - r.top) / r.height) * canvas.height;
  const rects = panelRects(canvas.width, canvas.height, state.layout);
  const hit = rects.findIndex((rc) => x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h);
  return { hit, x, y, rect: hit >= 0 ? rects[hit] : null };
}

function init() {
  refreshChips();
  const sampleBox = $('sample-picks');
  if (sampleBox) {
    for (const s of SAMPLES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = s.label;
      b.addEventListener('click', () => loadSample(s.id).catch((e) => setStatus(e.message)));
      sampleBox.appendChild(b);
    }
  }
  const bindText = (id, key) => {
    const el = $(id);
    if (el) {
      // Snapshot BEFORE the edit, on focus, so undo restores the old text.
      el.addEventListener('focus', () => pushHistory());
      el.addEventListener('input', () => { state[key] = el.value; render(); });
    }
  };
  bindText('eyebrow', 'eyebrow');
  bindText('title', 'title');
  bindText('subtitle', 'subtitle');
  const bindRange = (id, apply) => {
    const el = $(id);
    if (el) {
      el.addEventListener('focus', () => pushHistory());
      el.addEventListener('pointerdown', () => pushHistory());
      el.addEventListener('input', () => { apply(parseFloat(el.value)); render(); });
    }
  };
  bindRange('title-scale', (v) => { state.titleScale = v; });
  bindRange('zoom', (v) => { state.panels[state.selected].zoom = v; });
  bindRange('pan-x', (v) => { state.panels[state.selected].ox = v; });
  bindRange('pan-y', (v) => { state.panels[state.selected].oy = v; });
  const photoSel = $('panel-photo');
  if (photoSel) {
    photoSel.addEventListener('focus', () => pushHistory());
    photoSel.addEventListener('change', () => {
      state.panels[state.selected].photo = parseInt(photoSel.value, 10);
      render();
    });
  }
  const fileInput = $('photo');
  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      for (const f of fileInput.files || []) await addPhotoFile(f).catch((e) => setStatus(e.message));
      fileInput.value = '';
    });
  }
  const drop = $('dropzone');
  if (drop) {
    for (const evt of ['dragover', 'dragenter']) {
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.add('drag'); });
    }
    for (const evt of ['dragleave', 'drop']) {
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.remove('drag'); });
    }
    drop.addEventListener('drop', async (e) => {
      for (const f of e.dataTransfer.files || []) {
        if (f.type.startsWith('image/')) await addPhotoFile(f).catch((err) => setStatus(err.message));
      }
    });
  }
  // Click a panel to select it; drag on it to pan its photo; wheel to zoom.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const { hit, x, y, rect } = panelAt(e);
    if (hit < 0) return;
    pushHistory();
    state.selected = hit;
    render();
    setStatus(`Panel ${hit + 1} selected — drag to pan, scroll to zoom, or use the sliders.`);
    drag = { x, y, ox: state.panels[hit].ox || 0, oy: state.panels[hit].oy || 0, rect };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = state.panels[state.selected];
    p.ox = Math.max(-1, Math.min(1, drag.ox + ((e.offsetX / canvas.getBoundingClientRect().width) * canvas.width - drag.x) / drag.rect.w * 4));
    p.oy = Math.max(-1, Math.min(1, drag.oy + ((e.offsetY / canvas.getBoundingClientRect().height) * canvas.height - drag.y) / drag.rect.h * 4));
    render();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('wheel', (e) => {
    const { hit } = panelAt(e);
    if (hit < 0) return;
    e.preventDefault();
    pushHistory();
    const p = state.panels[hit];
    p.zoom = Math.max(1, Math.min(2.5, (p.zoom || 1) - Math.sign(e.deltaY) * 0.1));
    state.selected = hit;
    render();
  }, { passive: false });
  const exportBtn = $('export');
  if (exportBtn) exportBtn.addEventListener('click', () => exportPNG().catch((e) => setStatus(e.message)));
  const exportAll = $('export-all');
  if (exportAll) {
    exportAll.addEventListener('click', async () => {
      for (const k of Object.keys(SIZES)) {
        await exportPNG(k).catch((e) => setStatus(e.message));
        await new Promise((r) => setTimeout(r, 250));
      }
    });
  }
  const grainToggle = $('grain-toggle');
  if (grainToggle) {
    grainToggle.addEventListener('click', () => pushHistory());
    grainToggle.addEventListener('change', () => { state.grain = grainToggle.checked; render(); });
  }
  const halftoneToggle = $('halftone-toggle');
  if (halftoneToggle) {
    halftoneToggle.addEventListener('click', () => pushHistory());
    halftoneToggle.addEventListener('change', () => { state.halftone = halftoneToggle.checked; render(); });
  }
  const undoBtn = $('undo');
  if (undoBtn) undoBtn.addEventListener('click', undo);
  const redoBtn = $('redo');
  if (redoBtn) redoBtn.addEventListener('click', redo);
  const shuffleBtn = $('shuffle');
  if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleLook);
  const fillBtn = $('fill-all');
  if (fillBtn) fillBtn.addEventListener('click', fillAllPanels);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); }
  });
  syncUndoButtons();
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    runShot(shot, params, { loadSample, render, state, refreshChips }).catch((e) => setStatus(e.message));
    return;
  }
  // First run: preload the three sample scenes so the app shows art at once.
  Promise.all(SAMPLES.map((s) => loadImage(s.src).catch(() => null))).then((imgs) => {
    imgs.forEach((img) => { if (img) photos.push(img); });
    refreshPhotoLists();
    render();
    setStatus('Loaded with 3 sample scenes — drop your own photo to replace any panel, or press Surprise me.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.fonts?.ready.then(() => render()).catch(() => {});
  init();
});
