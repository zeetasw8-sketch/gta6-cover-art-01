// Fixed scenes for screenshots: ?shot=editor shows the page with a preset
// applied; ?shot=cover shows the cover alone at the viewport's own size.
// Query params: preset (index), layout, grade, title, subtitle, duotone=1,
// photo (a samples/*.jpg name), scenes (comma list). window.__shotReady is
// set once the fonts are in and the cover has painted.
export async function runShot(shot, query, setup) {
  const canvas = document.getElementById('preview');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  const scenes = query.get('scenes');
  await setup({
    preset: query.get('preset') == null ? null : Number(query.get('preset')),
    layout: query.get('layout'),
    grade: query.get('grade'),
    title: query.get('title'),
    subtitle: query.get('subtitle'),
    duotone: query.get('duotone') === '1',
    photo: query.get('photo'),
    scenes: scenes ? scenes.split(',') : null,
  });
  // Wait for the vendored Anton and Pacifico faces: canvas lettering drawn
  // before they load falls back to a generic sans and stays wrong.
  try { await document.fonts.ready; } catch { /* fonts are local; keep going */ }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
