// The eight multi-panel layouts. Every panel is a rectangle in unit coords
// (0..1) inside the art area above the title band; `rot` tilts a panel around
// its own centre. The renderer draws panels back to front, so later panels
// overlap earlier ones in the Tilted layout.
export const LAYOUTS = {
  solo: {
    label: 'Solo',
    hint: 'One full-bleed frame',
    panels: [{ x: 0, y: 0, w: 1, h: 1, rot: 0 }],
  },
  duo: {
    label: 'Duo',
    hint: 'Two tall frames side by side',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1, rot: 0 },
      { x: 0.5, y: 0, w: 0.5, h: 1, rot: 0 },
    ],
  },
  trio: {
    label: 'Trio',
    hint: 'One wide hero, two below',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.56, rot: 0 },
      { x: 0, y: 0.56, w: 0.5, h: 0.44, rot: 0 },
      { x: 0.5, y: 0.56, w: 0.5, h: 0.44, rot: 0 },
    ],
  },
  hero2: {
    label: 'Hero + 2',
    hint: 'Big hero left, two stacked right',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1, rot: 0 },
      { x: 0.62, y: 0, w: 0.38, h: 0.5, rot: 0 },
      { x: 0.62, y: 0.5, w: 0.38, h: 0.5, rot: 0 },
    ],
  },
  quad: {
    label: 'Quad',
    hint: 'Classic four-panel grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5, rot: 0 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5, rot: 0 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5, rot: 0 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5, rot: 0 },
    ],
  },
  six: {
    label: 'Six Up',
    hint: 'Three across, two down',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 0.5, rot: 0 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5, rot: 0 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5, rot: 0 },
      { x: 0, y: 0.5, w: 1 / 3, h: 0.5, rot: 0 },
      { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5, rot: 0 },
      { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5, rot: 0 },
    ],
  },
  nine: {
    label: 'Nine Up',
    hint: 'The full poster grid',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 1 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3, rot: 0 },
      { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3, rot: 0 },
    ],
  },
  tilted: {
    label: 'Tilted',
    hint: 'Three snapshots tossed on the table',
    panels: [
      { x: 0.04, y: 0.05, w: 0.44, h: 0.62, rot: -7 },
      { x: 0.52, y: 0.02, w: 0.44, h: 0.62, rot: 6 },
      { x: 0.28, y: 0.38, w: 0.44, h: 0.58, rot: -2 },
    ],
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

/** Panel count of a layout, used to size the per-panel state. */
export function panelCount(layoutId) {
  return LAYOUTS[layoutId].panels.length;
}

/** The art area's share of the cover height: the title band takes the rest.
 *  Wide covers get a slimmer band so the art stays dominant. */
export function artAreaFraction(width, height) {
  const ratio = width / height;
  if (ratio >= 1.6) return 0.74; // 1920 x 1080 landscape
  if (ratio >= 1.0) return 0.76; // 1080 x 1080 square
  if (ratio >= 0.75) return 0.72; // 1080 x 1350 portrait
  return 0.70; // 1080 x 1920 story
}
