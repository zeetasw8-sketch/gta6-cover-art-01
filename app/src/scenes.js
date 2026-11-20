// Five original illustrated scenes, drawn entirely in code: layered skies,
// reflections, textures and small figures. No photos, no brand artwork, no
// real people — every shape below is invented for this app. Each scene draws
// into the rectangle (0, 0, w, h) of the context it is given.

/** A palm silhouette: curved trunk and seven drooping fronds. */
function palm(ctx, x, y, s, lean, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * s * 0.3, y - s * 0.55, x + lean * s * 0.45, y - s);
  ctx.stroke();
  const topX = x + lean * s * 0.45;
  const topY = y - s;
  // Fronds arch out from the crown and hang: side fronds are longest, top
  // fronds short, every tip droops below its base so the palm reads as a
  // palm instead of a starburst.
  for (let i = 0; i < 7; i++) {
    const a = (-165 + i * 55) * Math.PI / 180;
    const side = Math.abs(Math.cos(a));
    const len = s * (0.34 + side * 0.22 + (i % 3) * 0.04);
    const cx = topX + Math.cos(a) * len * 0.5;
    const cy = topY + Math.sin(a) * len * 0.4 + len * 0.22;
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.45 + len * 0.55;
    ctx.lineWidth = Math.max(1.5, s * 0.035);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX, topY, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

/** A standing figure silhouette: head, torso, legs, one arm pose. */
function figure(ctx, x, y, s, color, pose) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  // head
  ctx.beginPath();
  ctx.arc(x, y - s * 0.86, s * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // torso
  ctx.lineWidth = s * 0.16;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.74);
  ctx.lineTo(x, y - s * 0.34);
  ctx.stroke();
  // legs
  ctx.lineWidth = s * 0.09;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.34);
  ctx.lineTo(x - s * 0.14, y);
  ctx.moveTo(x, y - s * 0.34);
  ctx.lineTo(x + s * 0.16, y);
  ctx.stroke();
  // arms
  ctx.lineWidth = s * 0.08;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.68);
  if (pose === 'wave') {
    ctx.lineTo(x + s * 0.3, y - s * 0.95);
  } else if (pose === 'lean') {
    ctx.lineTo(x + s * 0.26, y - s * 0.42);
  } else if (pose === 'rod') {
    ctx.lineTo(x + s * 0.34, y - s * 0.78);
  } else {
    ctx.lineTo(x + s * 0.2, y - s * 0.4);
  }
  ctx.moveTo(x, y - s * 0.68);
  ctx.lineTo(x - s * 0.2, y - s * 0.42);
  ctx.stroke();
}

/** A building block with a lit-window grid. `lit` is a function deciding lit windows. */
function building(ctx, x, y, w, h, color, lit, litColor) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  const cols = Math.max(2, Math.floor(w / 14));
  const rows = Math.max(3, Math.floor(h / 18));
  const cw = w / cols;
  const ch = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (lit(c, r)) {
        ctx.fillStyle = litColor;
        ctx.fillRect(x + c * cw + cw * 0.22, y + r * ch + ch * 0.25, cw * 0.56, ch * 0.5);
      }
    }
  }
  ctx.fillStyle = color;
}

/** Soft radial glow, used for suns, neon and searchlights. */
function glow(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

function cloud(ctx, x, y, s, color, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.32, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 0.55, y + s * 0.06, s * 0.7, s * 0.26, 0, 0, Math.PI * 2);
  ctx.ellipse(x - s * 0.55, y + s * 0.08, s * 0.6, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ---- Scene 1: Boulevard Sunset -------------------------------------------
function boulevard(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.3, '#7597de');
  sky.addColorStop(0.55, '#ff9a5a');
  sky.addColorStop(0.8, '#ff6b6b');
  sky.addColorStop(1, '#f857a6');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.62);
  // layered sun: halo, disc, lower half sunk behind the skyline
  glow(ctx, w * 0.62, h * 0.42, w * 0.34, '#ffd166', 0.85);
  glow(ctx, w * 0.62, h * 0.42, w * 0.16, '#fff3b0', 0.9);
  ctx.fillStyle = '#fff8d6';
  ctx.beginPath();
  ctx.arc(w * 0.62, h * 0.46, w * 0.085, 0, Math.PI * 2);
  ctx.fill();
  // sun stripes across the disc
  ctx.fillStyle = '#ff9a5a';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(w * 0.52, h * (0.44 + i * 0.035), w * 0.2, h * 0.008);
  }
  cloud(ctx, w * 0.18, h * 0.14, w * 0.09, '#ffd6e8', 0.8);
  cloud(ctx, w * 0.82, h * 0.09, w * 0.07, '#ffc2dd', 0.7);
  cloud(ctx, w * 0.45, h * 0.22, w * 0.06, '#ffe9f3', 0.6);
  // birds
  ctx.strokeStyle = '#3a0d3f';
  ctx.lineWidth = Math.max(1.5, w * 0.003);
  for (const [bx, by, bs] of [[0.3, 0.2, 1], [0.36, 0.17, 0.8], [0.74, 0.26, 0.9]]) {
    ctx.beginPath();
    ctx.moveTo(w * bx - w * 0.02 * bs, h * by);
    ctx.quadraticCurveTo(w * bx, h * by - h * 0.012, w * bx + w * 0.02 * bs, h * by);
    ctx.stroke();
  }
  // distant skyline, two depths
  ctx.fillStyle = '#5b2a6e';
  building(ctx, 0, h * 0.44, w * 0.16, h * 0.18, '#5b2a6e', () => false, '#000');
  building(ctx, w * 0.14, h * 0.38, w * 0.12, h * 0.24, '#5b2a6e', () => false, '#000');
  building(ctx, w * 0.78, h * 0.4, w * 0.13, h * 0.22, '#5b2a6e', () => false, '#000');
  building(ctx, w * 0.9, h * 0.46, w * 0.1, h * 0.16, '#5b2a6e', () => false, '#000');
  ctx.fillStyle = '#3a0d3f';
  building(ctx, w * 0.26, h * 0.47, w * 0.1, h * 0.15, '#3a0d3f', (c, r) => (c + r) % 3 === 0, '#ffd166');
  building(ctx, w * 0.68, h * 0.48, w * 0.09, h * 0.14, '#3a0d3f', (c, r) => (c * r) % 4 === 0, '#ffd166');
  // road with warm reflection streaks
  const road = ctx.createLinearGradient(0, h * 0.62, 0, h);
  road.addColorStop(0, '#8a2f5c');
  road.addColorStop(0.4, '#4a1a4d');
  road.addColorStop(1, '#1d0b2e');
  ctx.fillStyle = road;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillStyle = 'rgba(255, 209, 102, 0.5)';
  for (let i = 0; i < 7; i++) {
    const y = h * (0.66 + i * 0.045);
    const rw = w * (0.02 + i * 0.012);
    ctx.globalAlpha = 0.55 - i * 0.06;
    ctx.fillRect(w * 0.62 - rw / 2, y, rw, h * 0.012);
  }
  ctx.globalAlpha = 1;
  // centre dashes, widening with perspective
  ctx.fillStyle = '#ffe9a8';
  for (let i = 0; i < 4; i++) {
    const y = h * (0.7 + i * 0.075);
    const dw = w * (0.008 + i * 0.006);
    ctx.fillRect(w * 0.5 - dw / 2, y, dw, h * 0.02);
  }
  // palms framing the road
  palm(ctx, w * 0.06, h * 0.66, h * 0.3, 0.6, '#1d0b2e');
  palm(ctx, w * 0.12, h * 0.64, h * 0.22, -0.5, '#2a1040');
  palm(ctx, w * 0.94, h * 0.66, h * 0.28, -0.6, '#1d0b2e');
  palm(ctx, w * 0.88, h * 0.63, h * 0.18, 0.5, '#2a1040');
  // vintage convertible, low and long, driver waving
  const cx = w * 0.5;
  const cy = h * 0.86;
  const cw = w * 0.52;
  const chh = h * 0.085;
  ctx.fillStyle = '#12041f';
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, cy);
  ctx.quadraticCurveTo(cx - cw / 2, cy - chh * 0.7, cx - cw * 0.32, cy - chh * 0.75);
  ctx.lineTo(cx - cw * 0.18, cy - chh * 1.5);
  ctx.lineTo(cx + cw * 0.12, cy - chh * 1.5);
  ctx.lineTo(cx + cw * 0.3, cy - chh * 0.75);
  ctx.quadraticCurveTo(cx + cw / 2, cy - chh * 0.7, cx + cw / 2, cy);
  ctx.closePath();
  ctx.fill();
  // chrome strip + windshield glint
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(cx - cw * 0.46, cy - chh * 0.28, cw * 0.92, h * 0.008);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.moveTo(cx - cw * 0.15, cy - chh * 1.42);
  ctx.lineTo(cx + cw * 0.09, cy - chh * 1.42);
  ctx.lineTo(cx + cw * 0.05, cy - chh * 0.8);
  ctx.lineTo(cx - cw * 0.11, cy - chh * 0.8);
  ctx.closePath();
  ctx.fill();
  // wheels with hubcaps
  for (const wx of [cx - cw * 0.32, cx + cw * 0.32]) {
    ctx.fillStyle = '#0a0212';
    ctx.beginPath();
    ctx.arc(wx, cy + h * 0.005, h * 0.032, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.arc(wx, cy + h * 0.005, h * 0.014, 0, Math.PI * 2);
    ctx.fill();
  }
  figure(ctx, cx + cw * 0.02, cy - chh * 1.35, h * 0.09, '#12041f', 'wave');
}

// ---- Scene 2: Neon Street -----------------------------------------------
function neonStreet(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, '#05021a');
  sky.addColorStop(0.6, '#1b0b3b');
  sky.addColorStop(1, '#3b1155');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.5);
  // stars + moon
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 26; i++) {
    const sx = ((i * 137.5) % 100) / 100 * w;
    const sy = ((i * 89.3) % 40) / 100 * h;
    ctx.globalAlpha = 0.35 + (i % 4) * 0.15;
    ctx.fillRect(sx, sy, Math.max(1.5, w * 0.002), Math.max(1.5, w * 0.002));
  }
  ctx.globalAlpha = 1;
  glow(ctx, w * 0.85, h * 0.1, w * 0.09, '#e0f7ff', 0.8);
  ctx.fillStyle = '#eefcff';
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.1, w * 0.028, 0, Math.PI * 2);
  ctx.fill();
  // buildings both sides, lit windows in pink and cyan
  ctx.fillStyle = '#12042b';
  building(ctx, 0, h * 0.12, w * 0.3, h * 0.42, '#12042b', (c, r) => (c + 2 * r) % 3 === 0, '#ff2d95');
  building(ctx, w * 0.7, h * 0.08, w * 0.3, h * 0.46, '#12042b', (c, r) => (c * 2 + r) % 4 === 0, '#00e5ff');
  ctx.fillStyle = '#1d0b3d';
  building(ctx, w * 0.32, h * 0.22, w * 0.18, h * 0.32, '#1d0b3d', (c, r) => (c + r) % 4 === 0, '#ffd166');
  building(ctx, w * 0.52, h * 0.26, w * 0.16, h * 0.28, '#1d0b3d', (c, r) => (c * r) % 3 === 0, '#ff2d95');
  // neon signs: glowing bars and dots
  neonSign(ctx, w * 0.06, h * 0.2, w * 0.18, '#ff2d95');
  neonSign(ctx, w * 0.74, h * 0.16, w * 0.2, '#00e5ff');
  neonSign(ctx, w * 0.36, h * 0.3, w * 0.1, '#ffd166');
  // diner awning with scalloped edge
  ctx.fillStyle = '#ff2d95';
  ctx.fillRect(w * 0.04, h * 0.5, w * 0.26, h * 0.05);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.arc(w * (0.06 + i * 0.043), h * 0.55, w * 0.022, 0, Math.PI);
  }
  ctx.fill();
  ctx.fillStyle = '#ffe9f6';
  ctx.fillRect(w * 0.06, h * 0.55, w * 0.22, h * 0.02);
  // wet street: dark base, mirrored neon streaks, puddles
  const street = ctx.createLinearGradient(0, h * 0.54, 0, h);
  street.addColorStop(0, '#241040');
  street.addColorStop(0.5, '#160a2e');
  street.addColorStop(1, '#0a0518');
  ctx.fillStyle = street;
  ctx.fillRect(0, h * 0.54, w, h * 0.46);
  for (const [rx, rc, rw] of [[0.15, '#ff2d95', 0.05], [0.82, '#00e5ff', 0.06], [0.41, '#ffd166', 0.03]]) {
    const g = ctx.createLinearGradient(0, h * 0.56, 0, h * 0.98);
    g.addColorStop(0, rc);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = g;
    ctx.fillRect(w * (rx - rw / 2), h * 0.56, w * rw, h * 0.42);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0, 229, 255, 0.28)';
  ctx.beginPath();
  ctx.ellipse(w * 0.68, h * 0.82, w * 0.14, h * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 45, 149, 0.25)';
  ctx.beginPath();
  ctx.ellipse(w * 0.22, h * 0.9, w * 0.11, h * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();
  // two friends laughing on the street, rim-lit by neon
  figure(ctx, w * 0.42, h * 0.86, h * 0.26, '#0a0518', 'wave');
  figure(ctx, w * 0.58, h * 0.88, h * 0.24, '#12042b', 'lean');
  ctx.strokeStyle = 'rgba(255, 45, 149, 0.8)';
  ctx.lineWidth = Math.max(1.5, w * 0.004);
  ctx.beginPath();
  ctx.moveTo(w * 0.4, h * 0.62);
  ctx.lineTo(w * 0.4, h * 0.72);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
  ctx.beginPath();
  ctx.moveTo(w * 0.6, h * 0.64);
  ctx.lineTo(w * 0.6, h * 0.73);
  ctx.stroke();
  // string lights across the top
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.6)';
  ctx.lineWidth = Math.max(1, w * 0.0015);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.06);
  ctx.quadraticCurveTo(w * 0.5, h * 0.16, w, h * 0.05);
  ctx.stroke();
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const lx = w * t;
    const ly = h * (0.06 + Math.sin(t * Math.PI) * 0.075);
    ctx.fillStyle = ['#ff2d95', '#00e5ff', '#ffd166'][i % 3];
    ctx.beginPath();
    ctx.arc(lx, ly, Math.max(2, w * 0.005), 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, lx, ly, w * 0.02, ctx.fillStyle, 0.5);
  }
}

function neonSign(ctx, x, y, w, color) {
  glow(ctx, x + w / 2, y + w * 0.25, w * 0.55, color, 0.7);
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = w * 0.25;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, w * 0.14);
  ctx.fillRect(x + w * 0.15, y + w * 0.22, w * 0.7, w * 0.12);
  ctx.fillRect(x + w * 0.3, y + w * 0.42, w * 0.4, w * 0.12);
  ctx.restore();
}

// ---- Scene 3: Fishing Pier ------------------------------------------------
function pier(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, '#7dd3fc');
  sky.addColorStop(0.5, '#bae6fd');
  sky.addColorStop(1, '#fef3c7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.5);
  glow(ctx, w * 0.76, h * 0.2, w * 0.2, '#fff7cc', 0.9);
  ctx.fillStyle = '#fffbe8';
  ctx.beginPath();
  ctx.arc(w * 0.76, h * 0.2, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  cloud(ctx, w * 0.2, h * 0.12, w * 0.1, '#ffffff', 0.9);
  cloud(ctx, w * 0.55, h * 0.07, w * 0.07, '#ffffff', 0.8);
  cloud(ctx, w * 0.38, h * 0.3, w * 0.08, '#ffffff', 0.7);
  // gulls
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = Math.max(1.5, w * 0.0025);
  for (const [gx, gy] of [[0.3, 0.18], [0.36, 0.14], [0.62, 0.3]]) {
    ctx.beginPath();
    ctx.moveTo(w * gx - w * 0.015, h * gy);
    ctx.quadraticCurveTo(w * gx, h * gy - h * 0.01, w * gx + w * 0.015, h * gy);
    ctx.stroke();
  }
  // turquoise sea with wave lines and sparkles
  const sea = ctx.createLinearGradient(0, h * 0.5, 0, h);
  sea.addColorStop(0, '#2dd4bf');
  sea.addColorStop(0.45, '#0ea5b7');
  sea.addColorStop(1, '#155e75');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = Math.max(1.5, w * 0.002);
  for (let i = 0; i < 9; i++) {
    const y = h * (0.56 + i * 0.045);
    const x0 = w * (0.05 + (i % 3) * 0.08);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo(x0 + w * 0.12, y - h * 0.008, x0 + w * 0.24, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (let i = 0; i < 18; i++) {
    const sx = ((i * 173.1) % 95) / 100 * w + w * 0.02;
    const sy = h * (0.55 + ((i * 61.7) % 40) / 100);
    ctx.fillRect(sx, sy, Math.max(2, w * 0.004), Math.max(1, h * 0.002));
  }
  // distant boat with a white sail
  ctx.fillStyle = '#1e3a4c';
  ctx.fillRect(w * 0.68, h * 0.52, w * 0.09, h * 0.012);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(w * 0.71, h * 0.52);
  ctx.lineTo(w * 0.71, h * 0.44);
  ctx.lineTo(w * 0.76, h * 0.52);
  ctx.closePath();
  ctx.fill();
  // wooden pier in perspective: planks widening toward the viewer
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.5);
  ctx.lineTo(w * 0.58, h * 0.5);
  ctx.lineTo(w * 0.78, h);
  ctx.lineTo(w * 0.22, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5f3a1d';
  ctx.lineWidth = Math.max(1.5, w * 0.002);
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const y = h * (0.5 + t * 0.5);
    const xl = w * (0.42 - t * 0.2);
    const xr = w * (0.58 + t * 0.2);
    ctx.beginPath();
    ctx.moveTo(xl, y);
    ctx.lineTo(xr, y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#6b4423';
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.5);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();
  // rail posts and rope
  ctx.fillStyle = '#5f3a1d';
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const y = h * (0.56 + t * 0.4);
    const xl = w * (0.4 - t * 0.17);
    const xr = w * (0.6 + t * 0.17);
    ctx.fillRect(xl - w * 0.006, y - h * 0.05, w * 0.012, h * 0.05);
    ctx.fillRect(xr - w * 0.006, y - h * 0.05, w * 0.012, h * 0.05);
  }
  // fisherman at the pier end, rod bent over the water
  figure(ctx, w * 0.5, h * 0.82, h * 0.2, '#2b1a0e', 'rod');
  ctx.strokeStyle = '#2b1a0e';
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.beginPath();
  ctx.moveTo(w * 0.56, h * 0.66);
  ctx.quadraticCurveTo(w * 0.72, h * 0.6, w * 0.8, h * 0.72);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.8, h * 0.72);
  ctx.lineTo(w * 0.8, h * 0.8);
  ctx.stroke();
  // bucket and tackle box
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(w * 0.38, h * 0.84, w * 0.05, h * 0.045);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(w * 0.6, h * 0.85, w * 0.06, h * 0.035);
  // jumping fish, mid-air
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.ellipse(w * 0.82, h * 0.68, w * 0.02, h * 0.008, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Scene 4: Rooftop Skyline --------------------------------------------
function rooftop(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(0.45, '#7c3aed');
  sky.addColorStop(0.75, '#f97316');
  sky.addColorStop(1, '#fbbf24');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.62);
  glow(ctx, w * 0.5, h * 0.55, w * 0.3, '#fbbf24', 0.8);
  ctx.fillStyle = '#fff7d6';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.58, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  cloud(ctx, w * 0.2, h * 0.16, w * 0.09, '#fda4af', 0.55);
  cloud(ctx, w * 0.78, h * 0.1, w * 0.08, '#fda4af', 0.5);
  // skyline in three depths, farthest first
  ctx.fillStyle = '#4c1d95';
  building(ctx, w * 0.02, h * 0.34, w * 0.14, h * 0.28, '#4c1d95', () => false, '#000');
  building(ctx, w * 0.2, h * 0.28, w * 0.12, h * 0.34, '#4c1d95', () => false, '#000');
  building(ctx, w * 0.6, h * 0.3, w * 0.13, h * 0.32, '#4c1d95', () => false, '#000');
  building(ctx, w * 0.82, h * 0.36, w * 0.16, h * 0.26, '#4c1d95', () => false, '#000');
  ctx.fillStyle = '#2e1065';
  building(ctx, w * 0.1, h * 0.4, w * 0.16, h * 0.22, '#2e1065', (c, r) => (c + r) % 4 === 0, '#fbbf24');
  building(ctx, w * 0.36, h * 0.36, w * 0.14, h * 0.26, '#2e1065', (c, r) => (c * r) % 3 === 0, '#fbbf24');
  building(ctx, w * 0.68, h * 0.42, w * 0.12, h * 0.2, '#2e1065', (c, r) => (c + 2 * r) % 5 === 0, '#fbbf24');
  // nearest towers, windows warm
  ctx.fillStyle = '#1a0b2e';
  building(ctx, 0, h * 0.46, w * 0.2, h * 0.16, '#1a0b2e', (c, r) => (c + r) % 3 === 0, '#fde68a');
  building(ctx, w * 0.78, h * 0.44, w * 0.22, h * 0.18, '#1a0b2e', (c, r) => (c * 2 + r) % 3 === 0, '#fde68a');
  // rooftop floor
  const floor = ctx.createLinearGradient(0, h * 0.62, 0, h);
  floor.addColorStop(0, '#3b2d4d');
  floor.addColorStop(1, '#150a24');
  ctx.fillStyle = floor;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = Math.max(1, w * 0.0015);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, h * (0.68 + i * 0.07));
    ctx.lineTo(w, h * (0.68 + i * 0.07));
    ctx.stroke();
  }
  // railing
  ctx.strokeStyle = '#0f0718';
  ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.64);
  ctx.lineTo(w, h * 0.64);
  ctx.stroke();
  ctx.lineWidth = Math.max(2, w * 0.004);
  for (let i = 0; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(w * (i / 12), h * 0.64);
    ctx.lineTo(w * (i / 12), h * 0.72);
    ctx.stroke();
  }
  // water tower on legs
  ctx.fillStyle = '#241534';
  ctx.fillRect(w * 0.08, h * 0.68, w * 0.02, h * 0.16);
  ctx.fillRect(w * 0.18, h * 0.68, w * 0.02, h * 0.16);
  ctx.beginPath();
  ctx.ellipse(w * 0.14, h * 0.66, w * 0.07, h * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.07, h * 0.66);
  ctx.lineTo(w * 0.14, h * 0.56);
  ctx.lineTo(w * 0.21, h * 0.66);
  ctx.closePath();
  ctx.fill();
  // AC unit + vent
  ctx.fillStyle = '#2a1a3d';
  ctx.fillRect(w * 0.8, h * 0.78, w * 0.12, h * 0.08);
  ctx.strokeStyle = '#0f0718';
  ctx.lineWidth = Math.max(1.5, w * 0.002);
  ctx.strokeRect(w * 0.8, h * 0.78, w * 0.12, h * 0.08);
  // string lights between two poles
  ctx.strokeStyle = '#0f0718';
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.62);
  ctx.lineTo(w * 0.3, h * 0.4);
  ctx.moveTo(w * 0.7, h * 0.62);
  ctx.lineTo(w * 0.7, h * 0.4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.5)';
  ctx.lineWidth = Math.max(1, w * 0.0015);
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.4);
  ctx.quadraticCurveTo(w * 0.5, h * 0.55, w * 0.7, h * 0.4);
  ctx.stroke();
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    const lx = w * (0.3 + t * 0.4);
    const ly = h * (0.4 + Math.sin(t * Math.PI) * 0.13);
    ctx.fillStyle = i % 2 ? '#ffd166' : '#ff8fab';
    ctx.beginPath();
    ctx.arc(lx, ly, Math.max(2, w * 0.005), 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, lx, ly, w * 0.018, ctx.fillStyle, 0.55);
  }
  // helicopter silhouette with a searchlight cone
  ctx.fillStyle = '#0f0718';
  ctx.beginPath();
  ctx.ellipse(w * 0.82, h * 0.18, w * 0.045, h * 0.014, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(w * 0.86, h * 0.17, w * 0.05, h * 0.008);
  ctx.strokeStyle = '#0f0718';
  ctx.lineWidth = Math.max(1.5, w * 0.002);
  ctx.beginPath();
  ctx.moveTo(w * 0.8, h * 0.17);
  ctx.lineTo(w * 0.86, h * 0.17);
  ctx.stroke();
  const cone = ctx.createLinearGradient(0, h * 0.19, 0, h * 0.45);
  cone.addColorStop(0, 'rgba(255, 244, 190, 0.35)');
  cone.addColorStop(1, 'rgba(255, 244, 190, 0)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(w * 0.82, h * 0.19);
  ctx.lineTo(w * 0.76, h * 0.45);
  ctx.lineTo(w * 0.9, h * 0.45);
  ctx.closePath();
  ctx.fill();
  // figure leaning on the railing, city at their back
  figure(ctx, w * 0.5, h * 0.9, h * 0.24, '#0f0718', 'lean');
  palm(ctx, w * 0.06, h * 0.98, h * 0.2, 0.4, '#0f0718');
}

// ---- Scene 5: Swamp Airboat ----------------------------------------------
function swamp(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, '#78350f');
  sky.addColorStop(0.4, '#ea580c');
  sky.addColorStop(0.75, '#fbbf24');
  sky.addColorStop(1, '#fef3c7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.55);
  glow(ctx, w * 0.5, h * 0.4, w * 0.3, '#fde68a', 0.85);
  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.42, w * 0.055, 0, Math.PI * 2);
  ctx.fill();
  // sun rays through the trees
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#fff7cc';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.42);
    ctx.lineTo(w * (0.5 + i * 0.18 - 0.06), h * 0.55);
    ctx.lineTo(w * (0.5 + i * 0.18 + 0.06), h * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // cypress trunks with Spanish moss, left and right banks
  cypress(ctx, w * 0.06, h * 0.55, h * 0.5, '#1c0f08');
  cypress(ctx, w * 0.16, h * 0.55, h * 0.38, '#2a180c');
  cypress(ctx, w * 0.9, h * 0.55, h * 0.46, '#1c0f08');
  cypress(ctx, w * 0.8, h * 0.55, h * 0.34, '#2a180c');
  // mist bands
  ctx.fillStyle = 'rgba(254, 243, 199, 0.22)';
  ctx.fillRect(0, h * 0.5, w, h * 0.05);
  ctx.fillStyle = 'rgba(254, 243, 199, 0.16)';
  ctx.fillRect(0, h * 0.58, w, h * 0.04);
  // dark water with ripple arcs and sun glitter
  const water = ctx.createLinearGradient(0, h * 0.55, 0, h);
  water.addColorStop(0, '#78350f');
  water.addColorStop(0.4, '#3f2a12');
  water.addColorStop(1, '#140d05');
  ctx.fillStyle = water;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.5)';
  ctx.lineWidth = Math.max(1.5, w * 0.002);
  for (let i = 0; i < 8; i++) {
    const y = h * (0.62 + i * 0.045);
    ctx.beginPath();
    ctx.moveTo(w * (0.1 + (i % 3) * 0.06), y);
    ctx.quadraticCurveTo(w * 0.5, y - h * 0.006, w * (0.85 - (i % 2) * 0.08), y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(253, 230, 138, 0.65)';
  for (let i = 0; i < 14; i++) {
    const sx = w * (0.38 + ((i * 97.3) % 26) / 100);
    const sy = h * (0.6 + ((i * 53.1) % 32) / 100);
    ctx.fillRect(sx, sy, Math.max(2, w * 0.005), Math.max(1, h * 0.002));
  }
  // lily pads with one pink flower
  for (const [lx, ly, lr] of [[0.16, 0.78, 0.045], [0.24, 0.86, 0.035], [0.82, 0.8, 0.04], [0.74, 0.9, 0.03]]) {
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(w * lx, h * ly, w * lr, 0.3, Math.PI * 2 - 0.3);
    ctx.lineTo(w * lx, h * ly);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#f9a8d4';
  ctx.beginPath();
  ctx.arc(w * 0.16, h * 0.78, w * 0.012, 0, Math.PI * 2);
  ctx.fill();
  // egret standing in the shallows
  ctx.strokeStyle = '#fef9c3';
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.beginPath();
  ctx.moveTo(w * 0.68, h * 0.72);
  ctx.lineTo(w * 0.68, h * 0.6);
  ctx.stroke();
  ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  ctx.ellipse(w * 0.68, h * 0.58, w * 0.02, h * 0.012, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.7, h * 0.57, w * 0.008, 0, Math.PI * 2);
  ctx.fill();
  // airboat: flat hull, seat, driver, big fan cage behind
  const bx = w * 0.5;
  const by = h * 0.8;
  const bw = w * 0.4;
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.moveTo(bx - bw / 2, by);
  ctx.lineTo(bx + bw / 2, by);
  ctx.lineTo(bx + bw * 0.42, by + h * 0.05);
  ctx.lineTo(bx - bw * 0.42, by + h * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(bx - bw * 0.3, by - h * 0.04, bw * 0.6, h * 0.04);
  // fan cage: ring + spokes + hub
  ctx.strokeStyle = '#1c0f08';
  ctx.lineWidth = Math.max(3, w * 0.005);
  ctx.beginPath();
  ctx.arc(bx + bw * 0.28, by - h * 0.1, h * 0.075, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(2, w * 0.003);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.28, by - h * 0.1);
    ctx.lineTo(bx + bw * 0.28 + Math.cos(a) * h * 0.07, by - h * 0.1 + Math.sin(a) * h * 0.07);
    ctx.stroke();
  }
  ctx.fillStyle = '#1c0f08';
  ctx.beginPath();
  ctx.arc(bx + bw * 0.28, by - h * 0.1, h * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // driver at the wheel
  figure(ctx, bx - bw * 0.08, by - h * 0.02, h * 0.13, '#1c0f08', 'lean');
  // wake: white V behind the hull
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.42, by + h * 0.05);
  ctx.lineTo(bx - bw * 0.42 - w * 0.1, by + h * 0.12);
  ctx.moveTo(bx + bw * 0.42, by + h * 0.05);
  ctx.lineTo(bx + bw * 0.42 + w * 0.1, by + h * 0.12);
  ctx.stroke();
  // dragonflies
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.9)';
  ctx.lineWidth = Math.max(1, w * 0.0015);
  for (const [dx, dy] of [[0.3, 0.3], [0.72, 0.24]]) {
    ctx.beginPath();
    ctx.moveTo(w * dx - w * 0.012, h * dy);
    ctx.lineTo(w * dx + w * 0.012, h * dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * dx, h * dy - h * 0.012);
    ctx.lineTo(w * dx, h * dy + h * 0.012);
    ctx.stroke();
  }
}

/** A cypress trunk, flared at the base, with draped moss strands. */
function cypress(ctx, x, baseY, height, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - height * 0.05, baseY);
  ctx.quadraticCurveTo(x - height * 0.02, baseY - height * 0.5, x, baseY - height);
  ctx.quadraticCurveTo(x + height * 0.02, baseY - height * 0.5, x + height * 0.05, baseY);
  ctx.closePath();
  ctx.fill();
  // canopy: a wide flat crown, not a ball — two overlapping blobs plus
  // short branches reaching up into it, so it reads as a tree.
  ctx.beginPath();
  ctx.ellipse(x, baseY - height * 1.0, height * 0.2, height * 0.075, 0, 0, Math.PI * 2);
  ctx.ellipse(x + height * 0.09, baseY - height * 0.93, height * 0.12, height * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, height * 0.012);
  for (const [bx, by] of [[-0.08, -0.92], [0.05, -0.95], [0.12, -0.9]]) {
    ctx.beginPath();
    ctx.moveTo(x, baseY - height * 0.86);
    ctx.lineTo(x + height * bx, baseY + height * by);
    ctx.stroke();
  }
  // moss drapes
  ctx.strokeStyle = 'rgba(120, 130, 90, 0.85)';
  ctx.lineWidth = Math.max(1.5, height * 0.012);
  for (const [mx, my, ml] of [[-0.1, -0.95, 0.16], [0.06, -0.9, 0.2], [0.13, -1.0, 0.12], [-0.02, -1.05, 0.14]]) {
    ctx.beginPath();
    ctx.moveTo(x + height * mx, baseY + height * my);
    ctx.quadraticCurveTo(x + height * (mx + 0.02), baseY + height * (my + ml / 2), x + height * mx, baseY + height * (my + ml));
    ctx.stroke();
  }
}

export const SCENES = {
  boulevard: { label: 'Boulevard Sunset', draw: boulevard },
  neon: { label: 'Neon Street', draw: neonStreet },
  pier: { label: 'Fishing Pier', draw: pier },
  rooftop: { label: 'Rooftop Skyline', draw: rooftop },
  swamp: { label: 'Swamp Airboat', draw: swamp },
};

export const SCENE_IDS = Object.keys(SCENES);

/** Draws a named scene into the context's rectangle. */
export function drawScene(ctx, sceneId, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  SCENES[sceneId].draw(ctx, w, h);
  ctx.restore();
}
