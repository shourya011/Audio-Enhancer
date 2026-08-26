import { PresetConfig, PresetId } from '../../types';

export const PRESETS: Record<PresetId, PresetConfig> = {
  original: {
    id: 'original',
    name: 'Original',
    tagline: 'Clean Bypass',
    description: 'Dry, unaltered audio directly from the source. Zero coloration or processing.',
    icon: '⚪',
    preGainDb: 0.0,
    eqBands: [
      { type: 'lowshelf', frequency: 100, gain: 0.0, q: 0.7 },
      { type: 'peaking', frequency: 300, gain: 0.0, q: 1.0 },
      { type: 'peaking', frequency: 3000, gain: 0.0, q: 1.2 },
      { type: 'peaking', frequency: 6000, gain: 0.0, q: 1.0 },
      { type: 'highshelf', frequency: 12000, gain: 0.0, q: 0.7 }
    ],
    bassShelf: { type: 'lowshelf', frequency: 100, gain: 0.0, q: 0.7 },
    compressor: {
      threshold: 0.0,
      ratio: 1.0,
      attack: 0.010,
      release: 0.100,
      knee: 0.0
    },
    stereoWidthDb: 0.0,
    makeupGainDb: 0.0,
    limiterThresholdDb: -1.0
  },

  enhance: {
    id: 'enhance',
    name: 'Enhance',
    tagline: 'All-Day Flagship',
    description: 'Balanced clarity, decluttered mids, punchy low-end, and airy treble. Tuned for fatigue-free long listening.',
    icon: '⚡',
    preGainDb: -4.0,
    eqBands: [
      { type: 'lowshelf', frequency: 100, gain: 1.5, q: 0.7 },
      { type: 'peaking', frequency: 300, gain: -1.0, q: 1.0 },
      { type: 'peaking', frequency: 3000, gain: 2.0, q: 1.2 },
      { type: 'peaking', frequency: 6000, gain: 1.0, q: 1.0 },
      { type: 'highshelf', frequency: 12000, gain: 1.5, q: 0.7 }
    ],
    bassShelf: { type: 'lowshelf', frequency: 100, gain: 1.5, q: 0.7 },
    compressor: {
      threshold: -18.0,
      ratio: 2.5,
      attack: 0.008,
      release: 0.150,
      knee: 8.0
    },
    stereoWidthDb: 1.0,
    makeupGainDb: 2.5,
    limiterThresholdDb: -1.0
  },

  punchy: {
    id: 'punchy',
    name: 'Punchy',
    tagline: 'Dynamic & Energetic',
    description: 'Fast transient attack, snappy punch, and bright definition. Perfect for EDM, pop, hip-hop, and short-form edits.',
    icon: '💥',
    preGainDb: -6.0,
    eqBands: [
      { type: 'lowshelf', frequency: 90, gain: 2.5, q: 0.8 },
      { type: 'peaking', frequency: 350, gain: -1.5, q: 1.1 },
      { type: 'peaking', frequency: 3500, gain: 3.0, q: 1.2 },
      { type: 'peaking', frequency: 7000, gain: 1.5, q: 1.0 },
      { type: 'highshelf', frequency: 12000, gain: 2.0, q: 0.7 }
    ],
    bassShelf: { type: 'lowshelf', frequency: 90, gain: 2.5, q: 0.8 },
    compressor: {
      threshold: -16.0,
      ratio: 3.5,
      attack: 0.005,
      release: 0.200,
      knee: 6.0
    },
    stereoWidthDb: 2.0,
    makeupGainDb: 3.0,
    limiterThresholdDb: -1.0
  },

  bass: {
    id: 'bass',
    name: 'Bass Boost',
    tagline: 'Deep & Controlled',
    description: 'Authoritative sub-bass weight with low-mid decluttering so vocals and snares remain clear and unmasked.',
    icon: '🔊',
    preGainDb: -6.0,
    eqBands: [
      { type: 'lowshelf', frequency: 80, gain: 3.0, q: 0.8 },
      { type: 'peaking', frequency: 250, gain: -1.5, q: 1.0 },
      { type: 'peaking', frequency: 3000, gain: 1.0, q: 1.0 },
      { type: 'peaking', frequency: 6000, gain: 0.0, q: 1.0 },
      { type: 'highshelf', frequency: 12000, gain: 1.0, q: 0.7 }
    ],
    bassShelf: { type: 'lowshelf', frequency: 80, gain: 4.0, q: 0.8 },
    compressor: {
      threshold: -20.0,
      ratio: 3.0,
      attack: 0.010,
      release: 0.180,
      knee: 8.0
    },
    stereoWidthDb: 0.5,
    makeupGainDb: 1.5,
    limiterThresholdDb: -1.0
  },

  vocal: {
    id: 'vocal',
    name: 'Vocal',
    tagline: 'Dialogue & Lyrics Focus',
    description: 'Clean speech presence, reduced boominess, and smooth compression for acoustic tracks, podcasts, and lyrical music.',
    icon: '🎙️',
    preGainDb: -4.0,
    eqBands: [
      { type: 'lowshelf', frequency: 150, gain: -2.0, q: 0.7 },
      { type: 'peaking', frequency: 400, gain: -1.0, q: 1.0 },
      { type: 'peaking', frequency: 3000, gain: 3.0, q: 1.3 },
      { type: 'peaking', frequency: 5000, gain: 2.0, q: 1.1 },
      { type: 'highshelf', frequency: 12000, gain: 1.0, q: 0.7 }
    ],
    bassShelf: { type: 'lowshelf', frequency: 150, gain: -1.0, q: 0.7 },
    compressor: {
      threshold: -22.0,
      ratio: 3.0,
      attack: 0.005,
      release: 0.120,
      knee: 6.0
    },
    stereoWidthDb: 0.0,
    makeupGainDb: 2.0,
    limiterThresholdDb: -1.0
  },

  night: {
    id: 'night',
    name: 'Night Mode',
    tagline: 'Low-Volume Dynamic Leveling',
    description: 'Levels out loud peaks and lifts quiet passages with gentle dialogue presence for late-night listening without waking others.',
    icon: '🌙',
    preGainDb: -5.0,
    eqBands: [
      { type: 'lowshelf', frequency: 100, gain: 0.5, q: 0.7 },
      { type: 'peaking', frequency: 300, gain: -0.5, q: 1.0 },
      { type: 'peaking', frequency: 3000, gain: 1.5, q: 1.2 },
      { type: 'peaking', frequency: 6000, gain: 0.5, q: 1.0 },
      { type: 'highshelf', frequency: 10000, gain: 0.5, q: 0.7 }
    ],
    bassShelf: { type: 'lowshelf', frequency: 100, gain: 0.5, q: 0.7 },
    compressor: {
      threshold: -28.0,
      ratio: 6.0,
      attack: 0.010,
      release: 0.200,
      knee: 10.0
    },
    stereoWidthDb: 0.5,
    makeupGainDb: 3.5,
    limiterThresholdDb: -2.0
  },

  spatial: {
    id: 'spatial',
    name: 'Spatial',
    tagline: 'Immersive Stereo Image',
    description: 'Expansive soundstage using phase-safe Mid/Side widening. Fully mono-compatible with zero vocal cancellation.',
    icon: '🌐',
    preGainDb: -4.5,
    eqBands: [
      { type: 'lowshelf', frequency: 100, gain: 1.5, q: 0.7 },
      { type: 'peaking', frequency: 300, gain: -1.0, q: 1.0 },
      { type: 'peaking', frequency: 3000, gain: 2.0, q: 1.2 },
      { type: 'peaking', frequency: 6000, gain: 1.0, q: 1.0 },
      { type: 'highshelf', frequency: 12000, gain: 2.0, q: 0.7 }
    ],
    bassShelf: { type: 'lowshelf', frequency: 100, gain: 1.0, q: 0.7 },
    compressor: {
      threshold: -18.0,
      ratio: 2.5,
      attack: 0.008,
      release: 0.150,
      knee: 8.0
    },
    stereoWidthDb: 2.5,
    makeupGainDb: 2.0,
    limiterThresholdDb: -1.0
  }
};

export const PRESET_LIST: PresetConfig[] = [
  PRESETS.enhance,
  PRESETS.punchy,
  PRESETS.bass,
  PRESETS.vocal,
  PRESETS.night,
  PRESETS.spatial,
  PRESETS.original
];

export function getPreset(id: PresetId): PresetConfig {
  return PRESETS[id] ?? PRESETS.enhance;
}
