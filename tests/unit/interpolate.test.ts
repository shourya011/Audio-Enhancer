import { describe, expect, it } from 'vitest';
import { PRESETS } from '../../src/audio/presets/presets';
import { calculateDspParams } from '../../src/audio/utils/interpolate';
import { AdvancedEQ, Trims } from '../../src/types';

describe('Interpolation & DSP Calculation Engine', () => {
  const defaultTrims: Trims = { bass: 0, clarity: 0, width: 0 };
  const defaultAdvancedEQ: AdvancedEQ = {
    band1Gain: 0,
    band2Gain: 0,
    band3Gain: 0,
    band4Gain: 0,
    band5Gain: 0
  };

  it('should return transparent passthrough when bypassed or preset is original', () => {
    const params = calculateDspParams({
      preset: PRESETS.enhance,
      intensity: 100,
      trims: defaultTrims,
      advancedEQ: defaultAdvancedEQ,
      bypassCompare: true
    });

    expect(params.isBypassed).toBe(true);
    expect(params.preGainLinear).toBe(1.0);
    expect(params.outputMakeupGainLinear).toBe(1.0);
    expect(params.stereoSideGainLinear).toBe(1.0);
    expect(params.compressor.ratio).toBe(1.0);
    expect(params.compressor.threshold).toBe(0.0);
    expect(params.eqGands.every((b) => b.gain === 0)).toBe(true);
  });

  it('should interpolate parameters cleanly at 0% intensity', () => {
    const params = calculateDspParams({
      preset: PRESETS.enhance,
      intensity: 0,
      trims: defaultTrims,
      advancedEQ: defaultAdvancedEQ,
      bypassCompare: false
    });

    expect(params.preGainLinear).toBeCloseTo(1.0, 4);
    expect(params.compressor.ratio).toBeCloseTo(1.0, 4);
    expect(params.compressor.threshold).toBeCloseTo(0.0, 4);
    expect(params.stereoSideGainLinear).toBeCloseTo(1.0, 4);
    expect(params.eqGands.every((b) => Math.abs(b.gain) < 0.001)).toBe(true);
  });

  it('should interpolate parameters cleanly at 50% intensity', () => {
    const params = calculateDspParams({
      preset: PRESETS.enhance,
      intensity: 50,
      trims: defaultTrims,
      advancedEQ: defaultAdvancedEQ,
      bypassCompare: false
    });

    // Enhance preset has preGainDb = -4.0 dB. At 50%, preGainDb = -2.0 dB -> linear ~0.7943
    expect(params.preGainLinear).toBeCloseTo(Math.pow(10, -2.0 / 20), 3);

    // Enhance preset compressor: threshold -18 dB -> at 50% = -9 dB
    expect(params.compressor.threshold).toBeCloseTo(-9.0, 3);

    // Enhance preset compressor: ratio 2.5:1 -> at 50% = 1.0 + (2.5 - 1.0)*0.5 = 1.75
    expect(params.compressor.ratio).toBeCloseTo(1.75, 3);
  });

  it('should calculate exact full preset values at 100% intensity', () => {
    const params = calculateDspParams({
      preset: PRESETS.punchy,
      intensity: 100,
      trims: defaultTrims,
      advancedEQ: defaultAdvancedEQ,
      bypassCompare: false
    });

    // Punchy preset preGain = -6.0 dB
    expect(params.preGainLinear).toBeCloseTo(Math.pow(10, -6.0 / 20), 3);
    // Punchy compressor: threshold -16 dB, ratio 3.5:1
    expect(params.compressor.threshold).toBeCloseTo(-16.0, 3);
    expect(params.compressor.ratio).toBeCloseTo(3.5, 3);
    // Punchy stereo width: +2.0 dB -> linear side gain
    expect(params.stereoSideGainLinear).toBeCloseTo(Math.pow(10, 2.0 / 20), 3);
  });

  it('should apply quick control trims additively with safety bounds', () => {
    const trims: Trims = { bass: 2.0, clarity: 1.5, width: 1.0 };
    const params = calculateDspParams({
      preset: PRESETS.enhance,
      intensity: 100,
      trims,
      advancedEQ: defaultAdvancedEQ,
      bypassCompare: false
    });

    // Band 1 (low shelf) has base 1.5 dB + (2.0 * 0.75) = 3.0 dB
    expect(params.eqGands[0]!.gain).toBeCloseTo(3.0, 2);

    // Band 3 (presence) has base 2.0 dB + (1.5 * 0.85) = 3.275 dB
    expect(params.eqGands[2]!.gain).toBeCloseTo(3.275, 2);

    // Stereo side boost has base 1.0 dB + 1.0 dB = 2.0 dB
    expect(params.stereoSideGainLinear).toBeCloseTo(Math.pow(10, 2.0 / 20), 3);
  });

  it('should safely clamp extreme out-of-range trims and intensities', () => {
    const extremeTrims: Trims = { bass: 10.0, clarity: -10.0, width: 20.0 };
    const params = calculateDspParams({
      preset: PRESETS.enhance,
      intensity: 999, // out of range
      trims: extremeTrims,
      advancedEQ: defaultAdvancedEQ,
      bypassCompare: false
    });

    // Intensity clamped to 100%
    expect(params.compressor.ratio).toBeCloseTo(PRESETS.enhance.compressor.ratio, 3);
    // EQ gains clamped within safe bounds (±12 dB)
    for (const b of params.eqGands) {
      expect(b.gain).toBeGreaterThanOrEqual(-12.0);
      expect(b.gain).toBeLessThanOrEqual(12.0);
    }
  });
});
