// Colour grades for Vice Cover Lab: each grade is a sunset-or-neon wash that is
// painted over every panel, plus the lettering colours it pairs with. Duotone
// mode re-maps a panel's light and dark through the grade's two anchor colours.
// Every colour here is invented for this app; no brand palette is copied.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    washTop: 'rgba(255, 94, 98, 0.00)',
    washMid: 'rgba(255, 126, 95, 0.22)',
    washBottom: 'rgba(178, 34, 110, 0.55)',
    title: '#fff7ec', titleEdge: '#2b0a2e', accent: '#ffd166',
    duoDark: '#2b0a2e', duoLight: '#ffb347',
  },
  neon: {
    label: 'Neon Vice',
    washTop: 'rgba(0, 229, 255, 0.05)',
    washMid: 'rgba(255, 45, 149, 0.20)',
    washBottom: 'rgba(88, 28, 135, 0.58)',
    title: '#fdfdfd', titleEdge: '#12002e', accent: '#00e5ff',
    duoDark: '#12002e', duoLight: '#ff2d95',
  },
  gold: {
    label: 'Gold Hour',
    washTop: 'rgba(255, 214, 90, 0.00)',
    washMid: 'rgba(255, 166, 48, 0.22)',
    washBottom: 'rgba(146, 64, 14, 0.55)',
    title: '#fffbe8', titleEdge: '#331a00', accent: '#ffe08a',
    duoDark: '#331a00', duoLight: '#ffc53d',
  },
  teal: {
    label: 'Teal Noir',
    washTop: 'rgba(45, 212, 191, 0.04)',
    washMid: 'rgba(13, 148, 136, 0.20)',
    washBottom: 'rgba(8, 47, 73, 0.60)',
    title: '#f0fdfa', titleEdge: '#04202b', accent: '#5eead4',
    duoDark: '#04202b', duoLight: '#2dd4bf',
  },
  candy: {
    label: 'Candy Pop',
    washTop: 'rgba(255, 119, 198, 0.02)',
    washMid: 'rgba(255, 92, 168, 0.22)',
    washBottom: 'rgba(124, 58, 237, 0.55)',
    title: '#fff1f2', titleEdge: '#3b0764', accent: '#fde047',
    duoDark: '#3b0764', duoLight: '#ff77c6',
  },
  noir: {
    label: 'Noir',
    washTop: 'rgba(255, 255, 255, 0.00)',
    washMid: 'rgba(120, 120, 130, 0.18)',
    washBottom: 'rgba(0, 0, 0, 0.62)',
    title: '#fafafa', titleEdge: '#000000', accent: '#d4d4d4',
    duoDark: '#000000', duoLight: '#e5e5e5',
  },
};

export const GRADE_IDS = Object.keys(GRADES);

/** Re-maps an offscreen panel canvas to duotone: luminance picks a blend of
 *  the grade's dark and light anchors. Runs once per panel per render. */
export function applyDuotone(panelCanvas, grade) {
  const ctx = panelCanvas.getContext('2d');
  const { width: w, height: h } = panelCanvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const dark = hexRgb(grade.duoDark);
  const light = hexRgb(grade.duoLight);
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
    const t = Math.pow(lum, 0.9);
    d[i] = dark[0] + (light[0] - dark[0]) * t;
    d[i + 1] = dark[1] + (light[1] - dark[1]) * t;
    d[i + 2] = dark[2] + (light[2] - dark[2]) * t;
  }
  ctx.putImageData(img, 0, 0);
}

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Paints a grade's vertical wash over a rectangle of the given context. */
export function paintWash(ctx, x, y, w, h, grade) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, grade.washTop);
  g.addColorStop(0.55, grade.washMid);
  g.addColorStop(1, grade.washBottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

