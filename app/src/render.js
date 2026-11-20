// Renders a whole cover onto a canvas at the canvas's own size: panels first
// (a scene illustration or the user's photo, inked and grade-washed), then
// the halftone title band with auto-fitting lettering, then grain and a
// vignette. The title never clips: it shrinks, then wraps to a second line.
import { LAYOUTS, artAreaFraction } from './layouts.js';
import { GRADES, paintWash, applyDuotone } from './grades.js';
import { drawScene } from './scenes.js';

let noiseCanvas = null;

/** A small tiled noise pattern, made once, for the film grain overlay. */
function grainPattern(ctx) {
  if (noiseCanvas) return ctx.createPattern(noiseCanvas, 'repeat');
  noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 140;
  noiseCanvas.height = 140;
  const nctx = noiseCanvas.getContext('2d');
  const img = nctx.createImageData(140, 140);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nctx.putImageData(img, 0, 0);
  return ctx.createPattern(noiseCanvas, 'repeat');
}

/** Draws one panel's content (scene or photo) into a fresh offscreen canvas. */
function paintPanel(panel, panelState, photos, grade) {
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(panel.w));
  off.height = Math.max(2, Math.round(panel.h));
  const octx = off.getContext('2d');
  const src = panelState.source;
  if (src.kind === 'photo' && photos[src.index]) {
    const img = photos[src.index];
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const base = Math.max(off.width / iw, off.height / ih);
    const scale = base * (panelState.zoom || 1);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (off.width - dw) / 2 + (panelState.dx || 0);
    const dy = (off.height - dh) / 2 + (panelState.dy || 0);
    octx.drawImage(img, dx, dy, dw, dh);
  } else {
    // Scenes honour zoom and pan too: draw big, then show a cropped window.
    const sceneId = src.kind === 'scene' ? src.scene : 'boulevard';
    const z = panelState.zoom || 1;
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(2, Math.round(off.width * z));
    tmp.height = Math.max(2, Math.round(off.height * z));
    drawScene(tmp.getContext('2d'), sceneId, 0, 0, tmp.width, tmp.height);
    const sx = Math.min(0, Math.max(-(tmp.width - off.width), -(panelState.dx || 0)));
    const sy = Math.min(0, Math.max(-(tmp.height - off.height), -(panelState.dy || 0)));
    octx.drawImage(tmp, sx, sy, off.width, off.height, 0, 0, off.width, off.height);
  }
  if (grade) paintWash(octx, 0, 0, off.width, off.height, grade);
  return off;
}

/** Renders the full cover. `opts.grid` draws the rule-of-thirds guide (preview only). */
export function renderCover(canvas, state, photos, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.solo;
  const artH = H * artAreaFraction(W, H);
  const bandY = artH;
  const bandH = H - artH;
  const gap = Math.max(3, Math.round(W * 0.006));

  // Backdrop for the art area (visible between tilted snapshots).
  ctx.fillStyle = state.layout === 'tilted' ? '#160a24' : '#1d0b2e';
  ctx.fillRect(0, 0, W, artH);
  if (state.layout === 'tilted') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = Math.max(2, W * 0.004);
    for (let i = -4; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(i * W * 0.12, 0);
      ctx.lineTo(i * W * 0.12 + artH * 0.5, artH);
      ctx.stroke();
    }
    ctx.restore();
  }

  layout.panels.forEach((panel, i) => {
    const ps = state.panels[i] || { source: { kind: 'scene', scene: 'boulevard' }, zoom: 1, dx: 0, dy: 0 };
    const px = panel.x * W + (panel.x > 0 ? gap / 2 : 0);
    const py = panel.y * artH + (panel.y > 0 ? gap / 2 : 0);
    const pw = panel.w * W - (panel.x > 0 ? gap / 2 : 0) - (panel.x + panel.w < 1 ? gap / 2 : 0);
    const ph = panel.h * artH - (panel.y > 0 ? gap / 2 : 0) - (panel.y + panel.h < 1 ? gap / 2 : 0);
    const content = paintPanel({ w: pw, h: ph }, ps, photos, grade);
    if (state.duotone) applyDuotone(content, grade);
    ctx.save();
    const rot = (panel.rot || 0) * Math.PI / 180;
    if (rot) ctx.translate(px + pw / 2, py + ph / 2);
    if (rot) ctx.rotate(rot);
    if (rot) ctx.translate(-(px + pw / 2), -(py + ph / 2));
    // snapshot frame for tilted panels, inked edge for the rest
    if (state.layout === 'tilted') {
      const frame = Math.max(6, Math.round(W * 0.008));
      ctx.fillStyle = '#fdf6ec';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = Math.max(8, W * 0.02);
      ctx.shadowOffsetY = Math.max(4, H * 0.006);
      ctx.fillRect(px - frame, py - frame, pw + frame * 2, ph + frame * 2);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.drawImage(content, px, py, pw, ph);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = Math.max(1, W * 0.0015);
      ctx.strokeRect(px, py, pw, ph);
    } else {
      ctx.drawImage(content, px, py, pw, ph);
      ctx.strokeStyle = 'rgba(10, 4, 18, 0.85)';
      ctx.lineWidth = Math.max(2, W * 0.004);
      ctx.strokeRect(px, py, pw, ph);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = Math.max(1, W * 0.0012);
      ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);
    }
    ctx.restore();
    // selected-panel highlight lives in the editor, not in the export
    if (opts.selected === i && opts.highlight) {
      ctx.save();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = Math.max(3, W * 0.006);
      ctx.setLineDash([Math.max(8, W * 0.012), Math.max(6, W * 0.008)]);
      ctx.strokeRect(px - 2, py - 2, pw + 4, ph + 4);
      ctx.restore();
    }
  });

  drawTitleBand(ctx, state, grade, 0, bandY, W, bandH);
  drawBadge(ctx, state, grade, W, H);
  drawGrainAndVignette(ctx, W, H);
  if (opts.grid) drawGrid(ctx, W, artH);
}

/** Fits the title into the band: shrink first, wrap to two lines if it must.
 *  Returns the lines and the size that fit, so nothing ever clips. */
export function fitTitle(ctx, text, maxWidth, startSize, fontFamily) {
  let size = startSize;
  const set = (s) => { ctx.font = `${s}px ${fontFamily}`; };
  set(size);
  while (ctx.measureText(text).width > maxWidth && size > 14) {
    size -= 2;
    set(size);
  }
  if (ctx.measureText(text).width <= maxWidth) return { lines: [text], size };
  // split at the space nearest the middle and try two lines
  const words = text.split(/\s+/);
  if (words.length < 2) return { lines: [text], size };
  let best = null;
  for (let cut = 1; cut < words.length; cut++) {
    const a = words.slice(0, cut).join(' ');
    const b = words.slice(cut).join(' ');
    const need = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
    if (!best || need < best.need) best = { lines: [a, b], need };
  }
  size = startSize;
  set(size);
  while (Math.max(ctx.measureText(best.lines[0]).width, ctx.measureText(best.lines[1]).width) > maxWidth && size > 14) {
    size -= 2;
    set(size);
  }
  return { lines: best.lines, size };
}

/** The halftone title band: dotted texture, Anton title, Pacifico subtitle. */
function drawTitleBand(ctx, state, grade, x, y, w, h) {
  // band base: deep grade-dark with a warm top edge
  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, grade.duoDark);
  bg.addColorStop(1, '#0a0416');
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(x, y, w, Math.max(3, h * 0.03));
  // halftone dots, growing toward the bottom edge
  ctx.fillStyle = grade.accent;
  const step = Math.max(14, w * 0.022);
  for (let row = 0; row * step < h; row++) {
    for (let col = 0; col * step < w; col++) {
      const t = row * step / h;
      const r = Math.max(0.6, step * 0.09 * (0.4 + t));
      ctx.globalAlpha = 0.10 + t * 0.22;
      ctx.beginPath();
      ctx.arc(x + col * step + step / 2, y + row * step + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  const padX = w * 0.045;
  const maxW = w - padX * 2;
  const title = (state.title || 'VICE CITY').toUpperCase();
  const twoLine = h > w * 0.24;
  const startSize = (twoLine ? h * 0.42 : h * 0.52) * (state.titleScale || 1);
  const fitted = fitTitle(ctx, title, maxW, startSize, 'Anton, "Arial Black", sans-serif');
  const subSize = Math.max(12, h * 0.16 * (state.titleScale || 1));
  // Vertical budget, all inside the band: title block (first baseline offset
  // plus one line gap per extra line), a gap, then the subtitle with its
  // descender. The block is centred, so the subtitle can never run off.
  const lineGap = fitted.size * 1.04;
  const titleBlockH = fitted.size * 0.86 + (fitted.lines.length - 1) * lineGap;
  const subGap = subSize * 0.75;
  const totalH = titleBlockH + subGap + subSize * 1.05;
  const top = y + Math.max(0, (h - totalH) / 2);
  let ty = top + fitted.size * 0.86;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const shadowAmt = state.shadow == null ? 0.6 : state.shadow;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = fitted.size * 0.14 * shadowAmt;
  ctx.shadowOffsetY = fitted.size * 0.05 * shadowAmt;
  ctx.font = `${fitted.size}px Anton, "Arial Black", sans-serif`;
  // gradient title fill: warm top to accent bottom
  const tg = ctx.createLinearGradient(0, ty - fitted.size, 0, ty);
  tg.addColorStop(0, grade.title);
  tg.addColorStop(1, grade.accent);
  ctx.fillStyle = tg;
  if (state.outline) {
    ctx.lineWidth = Math.max(2, fitted.size * 0.06);
    ctx.strokeStyle = grade.titleEdge;
    ctx.lineJoin = 'round';
    for (const line of fitted.lines) ctx.strokeText(line, x + w / 2, ty);
  }
  for (const line of fitted.lines) {
    ctx.fillText(line, x + w / 2, ty);
    ty += lineGap;
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  // script subtitle in Pacifico, accent coloured
  const subtitle = (state.subtitle || '').trim();
  if (subtitle) {
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle, x + w / 2, top + titleBlockH + subGap + subSize * 0.8);
  }
}

/** Small ribbon badge top-right of the cover ("VICE CITY • EST. 2026"). */
function drawBadge(ctx, state, grade, W, H) {
  if (!state.showBadge) return;
  const text = (state.badge || '').trim();
  if (!text) return;
  const size = Math.max(13, W * 0.016);
  ctx.font = `bold ${size}px "Arial Black", sans-serif`;
  const tw = ctx.measureText(`★ ${text} ★`).width;
  const pad = size * 0.9;
  const bw = tw + pad * 2;
  const bh = size * 2.1;
  const bx = W - bw - W * 0.025;
  const by = H * 0.022;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = size * 0.3;
  ctx.shadowOffsetY = size * 0.08;
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, bh / 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = grade.duoDark;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`★ ${text} ★`, bx + bw / 2, by + bh / 2 + size * 0.04);
}

/** Film grain plus a soft vignette over the whole cover. */
function drawGrainAndVignette(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0, 0, 0, 0)');
  v.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

/** Rule-of-thirds composition guide over the art area (preview only). */
function drawGrid(ctx, W, artH) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.85)';
  ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.setLineDash([Math.max(8, W * 0.01), Math.max(6, W * 0.008)]);
  for (const f of [1 / 3, 2 / 3]) {
    ctx.beginPath();
    ctx.moveTo(W * f, 0);
    ctx.lineTo(W * f, artH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, artH * f);
    ctx.lineTo(W, artH * f);
    ctx.stroke();
  }
  ctx.restore();
}

/** Renders the cover at an export size and returns the canvas. */
export function exportCover(state, photos, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  renderCover(canvas, state, photos);
  return canvas;
}
