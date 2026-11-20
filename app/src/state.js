// Editor state, its undo/redo history, the one-click poster presets and the
// Surprise-me picker. State is plain JSON (photos live outside it, referred
// to by index), so a snapshot is a cheap string copy.
import { LAYOUT_IDS, panelCount } from './layouts.js';
import { GRADE_IDS } from './grades.js';
import { SCENE_IDS } from './scenes.js';

const TITLES = [
  'VICE NIGHTS', 'NEON SHORE', 'GOLDEN GETAWAY', 'PIER PRESSURE',
  'ROOFTOP ROYALTY', 'SWAMP RUN', 'SUNSET HEIST', 'PALM SHADOWS',
  'MIDNIGHT DRIVE', 'TURQUOISE TIDE', 'VELVET HORIZON', 'STREET ROYALE',
];
const SUBTITLES = [
  'Neon Shore', 'Golden Hour', 'Pier Pressure', 'City of Vice',
  'After Dark', 'Chase the Sun', 'Salt Air', 'Skyline Stories',
];

/** A fresh panel: an illustrated scene, no zoom, centred. */
export function freshPanel(scene) {
  return { source: { kind: 'scene', scene }, zoom: 1, dx: 0, dy: 0 };
}

/** The default cover: Hero + 2, Neon Vice, three different scenes. */
export function defaultState() {
  return {
    layout: 'hero2',
    grade: 'neon',
    duotone: false,
    title: 'VICE NIGHTS',
    subtitle: 'Neon Shore',
    badge: 'VICE CITY • EST. 2026',
    showBadge: true,
    titleScale: 1,
    shadow: 0.6,
    outline: true,
    showGrid: false,
    panels: [freshPanel('neon'), freshPanel('boulevard'), freshPanel('rooftop')],
  };
}

/** Resizes the panel list when the layout changes, keeping shared panels. */
export function resizePanels(state, scene) {
  const want = panelCount(state.layout);
  const panels = state.panels.slice(0, want);
  while (panels.length < want) {
    const donor = state.panels[(panels.length - 1) % Math.max(1, state.panels.length)] || freshPanel(scene);
    panels.push({ ...donor, source: { ...donor.source } });
  }
  state.panels = panels;
}

/** Undo/redo history: 50 JSON snapshots, cheapest correct approach. */
export class History {
  constructor() {
    this.past = [];
    this.future = [];
  }
  push(state) {
    this.past.push(JSON.stringify(state));
    if (this.past.length > 50) this.past.shift();
    this.future.length = 0;
  }
  undo(state) {
    if (!this.past.length) return null;
    this.future.push(JSON.stringify(state));
    return JSON.parse(this.past.pop());
  }
  redo(state) {
    if (!this.future.length) return null;
    this.past.push(JSON.stringify(state));
    return JSON.parse(this.future.pop());
  }
  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
}

// One-click poster presets: a title, grade, layout and scenes that belong
// together, so one click is a finished poster instead of ten fiddly choices.
export const PRESETS = [
  { name: 'Neon Shore', title: 'NEON SHORE', subtitle: 'After Dark', grade: 'neon', layout: 'hero2', scenes: ['neon', 'boulevard', 'rooftop'] },
  { name: 'Golden Getaway', title: 'GOLDEN GETAWAY', subtitle: 'Chase the Sun', grade: 'gold', layout: 'trio', scenes: ['boulevard', 'pier', 'swamp'] },
  { name: 'Pier Pressure', title: 'PIER PRESSURE', subtitle: 'Salt Air', grade: 'sunset', layout: 'quad', scenes: ['pier', 'boulevard', 'neon', 'rooftop'] },
  { name: 'Rooftop Royalty', title: 'ROOFTOP ROYALTY', subtitle: 'Skyline Stories', grade: 'teal', layout: 'solo', scenes: ['rooftop'] },
  { name: 'Swamp Run', title: 'SWAMP RUN', subtitle: 'City of Vice', grade: 'sunset', layout: 'nine', scenes: ['swamp', 'pier', 'boulevard', 'neon', 'rooftop', 'swamp', 'pier', 'boulevard', 'neon'] },
  { name: 'Vice Nights', title: 'VICE NIGHTS', subtitle: 'Midnight Drive', grade: 'noir', layout: 'tilted', scenes: ['neon', 'rooftop', 'boulevard'] },
];

/** Applies a preset to the state (panels rebuilt from its scenes). */
export function applyPreset(state, preset) {
  state.title = preset.title;
  state.subtitle = preset.subtitle;
  state.grade = preset.grade;
  state.layout = preset.layout;
  state.panels = preset.scenes.map((scene) => freshPanel(scene));
  resizePanels(state, preset.scenes[0]);
  return state;
}

/** Randomises layout, grade, scenes and title — a new poster in one click. */
export function surpriseState(state, rand = Math.random) {
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  state.layout = pick(LAYOUT_IDS);
  state.grade = pick(GRADE_IDS);
  state.title = pick(TITLES);
  state.subtitle = pick(SUBTITLES);
  state.duotone = rand() < 0.25;
  const scenes = Array.from({ length: panelCount(state.layout) }, () => pick(SCENE_IDS));
  state.panels = scenes.map((scene) => freshPanel(scene));
  return state;
}

/** Export sizes: the three common post sizes plus the vertical story size. */
export const EXPORT_SIZES = [
  { id: 'square', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 × 1080', w: 1920, h: 1080 },
  { id: 'story', label: 'Story 1080 × 1920', w: 1080, h: 1920 },
];

/** Serialises state for a snapshot, leaving photos (live Image objects) out. */
export function snapshotState(state) {
  return JSON.parse(JSON.stringify(state));
}
