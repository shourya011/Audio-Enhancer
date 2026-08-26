import { describe, expect, it } from 'vitest';
import { PRESET_LIST, PRESETS, getPreset } from '../../src/audio/presets/presets';
import { PresetId } from '../../src/types';

describe('DSP Presets Integrity & Audio Engineering Standards', () => {
  const allPresetIds: PresetId[] = ['original', 'enhance', 'punchy', 'bass', 'vocal', 'night', 'spatial'];

  it('should include all 7 required presets', () => {
    expect(PRESET_LIST.length).toBe(7);
    for (const id of allPresetIds) {
      expect(PRESETS[id]).toBeDefined();
      expect(PRESETS[id]!.id).toBe(id);
    }
  });

  it('should fall back to enhance preset for unknown preset id', () => {
    // @ts-ignore
    const fallback = getPreset('non_existent_preset');
    expect(fallback.id).toBe('enhance');
  });

  it('every preset should have 5 valid EQ bands with valid frequencies and Q factors', () => {
    for (const preset of PRESET_LIST) {
      expect(preset.eqBands.length).toBe(5);
      for (const band of preset.eqBands) {
        expect(band.frequency).toBeGreaterThanOrEqual(20);
        expect(band.frequency).toBeLessThanOrEqual(20000);
        expect(band.gain).toBeGreaterThanOrEqual(-12);
        expect(band.gain).toBeLessThanOrEqual(12);
        expect(band.q).toBeGreaterThan(0.1);
        expect(band.q).toBeLessThan(10);
      }
    }
  });

  it('every preset compressor configuration should have valid musical ranges', () => {
    for (const preset of PRESET_LIST) {
      const comp = preset.compressor;
      expect(comp.threshold).toBeLessThanOrEqual(0);
      expect(comp.threshold).toBeGreaterThanOrEqual(-60);
      expect(comp.ratio).toBeGreaterThanOrEqual(1.0);
      expect(comp.ratio).toBeLessThanOrEqual(20.0);
      expect(comp.attack).toBeGreaterThanOrEqual(0.001);
      expect(comp.attack).toBeLessThanOrEqual(0.5);
      expect(comp.release).toBeGreaterThanOrEqual(0.01);
      expect(comp.release).toBeLessThanOrEqual(1.0);
    }
  });

  it('every preset stereo width should be within mono-safe bounds (0 to 2.5 dB)', () => {
    for (const preset of PRESET_LIST) {
      expect(preset.stereoWidthDb).toBeGreaterThanOrEqual(0);
      expect(preset.stereoWidthDb).toBeLessThanOrEqual(2.5);
    }
  });

  it('every preset limiter threshold should provide safety margin (<= -1.0 dBFS)', () => {
    for (const preset of PRESET_LIST) {
      expect(preset.limiterThresholdDb).toBeLessThanOrEqual(-1.0);
    }
  });
});
