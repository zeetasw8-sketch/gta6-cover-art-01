// Vice Cover Lab — the cover engine: draws a multi-panel GTA-style poster
// cover onto any 2D canvas, from plain state. No network, no libraries:
// every pixel comes from the photos the user loaded plus gradients, type
// and grain drawn here. Pure functions of (state, photos) so the live
// preview and the exported PNG are the same drawing at different sizes.

export const LAYOUTS = {
  solo:   { name: 'Solo',   panels: [[0, 0, 1, 1]] },
  duo:    { name: 'Duo',    panels: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] },
  trio:   { name: 'Trio',   panels: [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]] },
  hero:   { name: 'Hero + 2', panels: [[0, 0, 1, 0.62], [0, 0.62, 0.5, 0.38], [0.5, 0.62, 0.5, 0.38]] },
  quad:   { name: 'Quad',   panels: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]] },
  six:    { name: 'Six Up', panels: [[0, 0, 1 / 3, 0.5], [1 / 3, 0, 1 / 3, 0.5], [2 / 3, 0, 1 / 3, 0.5], [0, 0.5, 1 / 3, 0.5], [1 / 3, 0.5, 1 / 3, 0.5], [2 / 3, 0.5, 1 / 3, 0.5]] },
};

export const GRADES = {
  sunset:  { name: 'Sunset',   top: 'rgba(255,150,60,0)',  bottom: 'rgba(214,40,120,0.55)', wash: 'rgba(255,110,60,0.10)', ink: '#ff7a3d' },
  neon:    { name: 'Neon Vice', top: 'rgba(40,230,220,0)',  bottom: 'rgba(255,40,160,0.55)', wash: 'rgba(40,200,255,0.12)', ink: '#ff2e9a' },
  gold:    { name: 'Gold Hour', top: 'rgba(255,220,120,0)', bottom: 'rgba(200,110,20,0.50)', wash: 'rgba(255,190,60,0.12)', ink: '#ffb347' },
  teal:    { name: 'Teal Noir', top: 'rgba(20,120,140,0)',  bottom: 'rgba(8,40,70,0.60)',   wash: 'rgba(30,180,200,0.10)', ink: '#2ee6d6' },
  candy:   { name: 'Candy Pop', top: 'rgba(255,90,200,0)',  bottom: 'rgba(120,40,220,0.50)', wash: 'rgba(255,90,200,0.12)', ink: '#ff5ce1' },
  noir:    { name: 'Noir',      top: 'rgba(0,0,0,0)',       bottom: 'rgba(0,0,0,0.55)',      wash: 'rgba(0,0,0,0.10)',      ink: '#ffffff' },
};

export const SIZES = {
  square:  { name: 'Square 1080 × 1080',  w: 1080, h: 1080 },
  portrait:{ name: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  wide:    { name: 'Wide 1920 × 1080',     w: 1920, h: 1080 },
  story:   { name: 'Story 1080 × 1920',    w: 1080, h: 1920 },
};

let grainTile = null;

/** A small reusable noise tile for the film-grain overlay. */
export function grainPattern(ctx) {
  if (grainTile) return grainTile;
  const t = document.createElement('canvas');
  t.width = 140;
  t.height = 140;
  const tc = t.getContext('2d');
  const img = tc.createImageData(140, 140);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 22;
  }
  tc.putImageData(img, 0, 0);
  grainTile = ctx.createPattern(t, 'repeat');
  return grainTile;
}

/** Draw one photo into a panel rect, cover-fit, with zoom and pan. */
export function drawPhotoInto(ctx, photo, rect, panel) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#1b1030';
  ctx.fillRect(x, y, w, h);
  if (photo) {
    const iw = photo.naturalWidth || photo.width;
    const ih = photo.naturalHeight || photo.height;
    const base = Math.max(w / iw, h / ih);
    const scale = base * (panel.zoom || 1);
    const pw = iw * scale;
    const ph = ih * scale;
    const ox = (panel.ox || 0) * w * 0.25;
    const oy = (panel.oy || 0) * h * 0.25;
    ctx.drawImage(photo, x + (w - pw) / 2 + ox, y + (h - ph) / 2 + oy, pw, ph);
  } else {
    ctx.fillStyle = '#241640';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `600 ${Math.max(14, h * 0.045)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
  }
  ctx.restore();
}

/** The grade wash: a sunset/neon gradient rising from the foot of a rect. */
export function gradeWash(ctx, rect, grade) {
  const { x, y, w, h } = rect;
  const g = ctx.createLinearGradient(0, y + h * 0.25, 0, y + h);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = grade.wash;
  ctx.fillRect(x, y, w, h);
}

/** Vignette: darkened corners so the panels feel like a printed poster. */
export function vignette(ctx, w, h, strength) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** The title block: eyebrow, big Anton title, neon script subtitle. */
export function titleBlock(ctx, w, h, state, grade) {
  const bandH = h * (state.sizeKey === 'story' ? 0.20 : 0.24);
  const bandY = h - bandH;
  const g = ctx.createLinearGradient(0, bandY, 0, h);
  g.addColorStop(0, 'rgba(10,6,24,0)');
  g.addColorStop(0.35, 'rgba(10,6,24,0.72)');
  g.addColorStop(1, 'rgba(10,6,24,0.92)');
  ctx.fillStyle = g;
  ctx.fillRect(0, bandY, w, bandH);
  const cx = w / 2;
  const eyebrow = (state.eyebrow || '').trim().toUpperCase();
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  // Stack the three lines inside the band: sizes are band-relative so the
  // subtitle never runs past the foot of the cover, at any export size.
  let y = bandY + bandH * 0.10;
  if (eyebrow) {
    const es = Math.max(10, bandH * 0.115);
    ctx.font = `700 ${es}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.ink;
    try { ctx.letterSpacing = `${es * 0.42}px`; } catch (e) { /* older canvas */ }
    ctx.fillText(eyebrow, cx, y + es);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
    y += es * 1.45;
  }
  if (title) {
    let size = Math.min(h * 0.105 * (state.titleScale || 1), bandH * 0.44);
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
    while (ctx.measureText(title).width > w * 0.92 && size > 18) {
      size -= 4;
      ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(8,4,20,0.9)';
    ctx.lineWidth = Math.max(4, size * 0.10);
    ctx.strokeText(title, cx, y + size);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = grade.ink;
    ctx.shadowBlur = size * 0.22;
    ctx.fillText(title, cx, y + size);
    ctx.shadowBlur = 0;
    y += size * 1.12;
  }
  if (subtitle) {
    const ss = Math.max(12, bandH * 0.20);
    ctx.font = `${ss}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = grade.ink;
    ctx.shadowBlur = ss * 0.55;
    ctx.fillText(subtitle, cx, y + ss);
    ctx.shadowBlur = 0;
  }
}

/**
 * Draw the whole cover. `state` holds layout, grade, texts and per-panel
 * {photo, zoom, ox, oy}; `photos` is the array of loaded Image objects.
 * `sizeKey` picks the export aspect for the title band proportions.
 */
export function drawCover(canvas, state, photos, sizeKey) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS[state.layout] || LAYOUTS.hero;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const gap = Math.max(3, Math.round(Math.min(w, h) * 0.008));
  ctx.fillStyle = '#0a0618';
  ctx.fillRect(0, 0, w, h);
  const frame = Math.max(4, Math.round(Math.min(w, h) * 0.014));
  const inner = { x: frame, y: frame, w: w - frame * 2, h: h - frame * 2 };
  const st = { ...state, sizeKey };
  for (let i = 0; i < layout.panels.length; i++) {
    const [fx, fy, fw, fh] = layout.panels[i];
    const rect = {
      x: inner.x + fx * inner.w + (fx > 0 ? gap / 2 : 0),
      y: inner.y + fy * inner.h + (fy > 0 ? gap / 2 : 0),
      w: fw * inner.w - (fx > 0 ? gap / 2 : 0) - (fx + fw < 1 ? gap / 2 : 0),
      h: fh * inner.h - (fy > 0 ? gap / 2 : 0) - (fy + fh < 1 ? gap / 2 : 0),
    };
    const panel = state.panels[i] || {};
    drawPhotoInto(ctx, photos[panel.photo] ?? null, rect, panel);
    gradeWash(ctx, rect, grade);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(2, gap * 0.5);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }
  if (state.grain !== false) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  vignette(ctx, w, h, 0.34);
  titleBlock(ctx, w, h, st, grade);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, Math.round(Math.min(w, h) * 0.006));
  ctx.strokeRect(frame / 2, frame / 2, w - frame, h - frame);
}

/** Panel rects in canvas pixels, for click-to-select in the preview. */
export function panelRects(w, h, layoutKey) {
  const layout = LAYOUTS[layoutKey] || LAYOUTS.hero;
  const gap = Math.max(3, Math.round(Math.min(w, h) * 0.008));
  const frame = Math.max(4, Math.round(Math.min(w, h) * 0.014));
  const inner = { x: frame, y: frame, w: w - frame * 2, h: h - frame * 2 };
  return layout.panels.map(([fx, fy, fw, fh]) => ({
    x: inner.x + fx * inner.w + (fx > 0 ? gap / 2 : 0),
    y: inner.y + fy * inner.h + (fy > 0 ? gap / 2 : 0),
    w: fw * inner.w - (fx > 0 ? gap / 2 : 0) - (fx + fw < 1 ? gap / 2 : 0),
    h: fh * inner.h - (fy > 0 ? gap / 2 : 0) - (fy + fh < 1 ? gap / 2 : 0),
  }));
}
