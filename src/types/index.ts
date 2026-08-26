/**
 * Core type definitions for Audio Enhancer Chrome Extension
 */

export type PresetId =
  | 'original'
  | 'enhance'
  | 'punchy'
  | 'bass'
  | 'vocal'
  | 'night'
  | 'spatial';

export type ErrorCode =
  | 'CAPTURE_FAILED'
  | 'UNSUPPORTED_PAGE'
  | 'PERMISSION_DENIED'
  | 'AUDIOCONTEXT_FAILED'
  | 'STREAM_ENDED'
  | 'OFFSCREEN_LOST'
  | 'UNKNOWN_ERROR';

export interface ErrorState {
  code: ErrorCode;
  message: string;
  recoverable: boolean;
  details?: string;
}

export interface Trims {
  bass: number;    // dB trim: -3.0 to +3.0
  clarity: number; // dB trim: -3.0 to +3.0
  width: number;   // dB trim: -3.0 to +3.0
}

export interface AdvancedEQ {
  band1Gain: number; // 100 Hz Low Shelf (dB: -12 to +12)
  band2Gain: number; // 300 Hz Low-Mid (dB: -12 to +12)
  band3Gain: number; // 3 kHz Presence (dB: -12 to +12)
  band4Gain: number; // 6 kHz High-Mid (dB: -12 to +12)
  band5Gain: number; // 12 kHz Air Shelf (dB: -12 to +12)
}

export interface StoredSettings {
  schemaVersion: number;
  selectedPreset: PresetId;
  intensity: number; // 0 to 100
  trims: Trims;
  advancedEQ: AdvancedEQ;
  bypassCompare: boolean; // Instant A/B comparison bypass
}

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  isSupported: boolean;
  siteName: 'youtube' | 'youtubemusic' | 'unsupported';
}

export interface EQBandSpec {
  type: BiquadFilterType;
  frequency: number; // Hz
  gain: number;      // dB
  q: number;         // Q factor
}

export interface PresetConfig {
  id: PresetId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  preGainDb: number;
  eqBands: [EQBandSpec, EQBandSpec, EQBandSpec, EQBandSpec, EQBandSpec];
  bassShelf: EQBandSpec;
  compressor: {
    threshold: number; // dB (-40 to 0)
    ratio: number;     // ratio (1 to 20)
    attack: number;    // seconds (0.001 to 0.1)
    release: number;   // seconds (0.05 to 1.0)
    knee: number;      // dB (0 to 40)
  };
  stereoWidthDb: number; // Side channel boost dB (0 to 2.5)
  makeupGainDb: number;  // Computed loudness-matched gain dB
  limiterThresholdDb: number; // Fast-limiter threshold dB (-2.0 to 0.0)
}

export interface CalculatedDspParams {
  preGainLinear: number;
  eqGands: Array<{
    type: BiquadFilterType;
    frequency: number;
    gain: number;
    q: number;
  }>;
  bassShelf: {
    type: BiquadFilterType;
    frequency: number;
    gain: number;
    q: number;
  };
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    knee: number;
  };
  stereoSideGainLinear: number;
  outputMakeupGainLinear: number;
  limiterThresholdDb: number;
  isBypassed: boolean;
}

export interface AudioLevels {
  rms: number;      // 0.0 to 1.0
  peak: number;     // 0.0 to 1.0
  frequencyData: number[]; // 32 frequency bins (0-255)
}

export interface ExtensionStatus {
  enabled: boolean;
  processingTabId: number | null;
  activeTab: TabInfo | null;
  settings: StoredSettings;
  error: ErrorState | null;
  audioLevels?: AudioLevels;
}
