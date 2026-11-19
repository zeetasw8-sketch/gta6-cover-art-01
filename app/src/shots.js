// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone, edge to edge.
// `photo` picks the sample (boulevard, neon, pier), `caption` the title,
// `layout` and `grade` pick the look. window.__shotReady is set once the
// cover has painted, so a screenshot script can wait on it.
import { LAYOUTS, GRADES, SIZES } from './cover.js';

export async function runShot(shot, query, api) {
  const { loadSample, render, state } = api;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const layout = query.get('layout');
  if (layout && LAYOUTS[layout]) state.layout = layout;
  const grade = query.get('grade');
  if (grade && GRADES[grade]) state.grade = grade;
  const size = query.get('size');
  if (size && SIZES[size]) state.sizeKey = size;
  const caption = query.get('caption');
  if (caption) state.title = caption;
  const subtitle = query.get('subtitle');
  if (subtitle) state.subtitle = subtitle;
  const eyebrow = query.get('eyebrow');
  if (eyebrow) state.eyebrow = eyebrow;
  const photo = query.get('photo') || 'boulevard';
  await loadSample(photo);
  // Spread the samples across the panels so multi-panel shots look full.
  const order = ['boulevard', 'neon', 'pier'];
  for (let i = 1; i < 6; i++) {
    const id = order[i % order.length];
    if (id !== photo) await loadSample(id).catch(() => {});
  }
  // Point each panel at a different loaded photo.
  state.panels.forEach((p, i) => { p.photo = i % 3; p.zoom = 1; p.ox = 0; p.oy = 0; });
  if (api.refreshChips) api.refreshChips();
  render();
  await document.fonts.ready.catch(() => {});
  render();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
