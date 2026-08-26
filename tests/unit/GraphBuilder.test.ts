import { describe, expect, it } from 'vitest';
import { GraphBuilder } from '../../src/audio/engine/GraphBuilder';
import { CalculatedDspParams, StoredSettings } from '../../src/types';

describe('GraphBuilder Validation and Calculation', () => {
  const sampleSettings: StoredSettings = {
    schemaVersion: 1,
    selectedPreset: 'enhance',
    intensity: 85,
    trims: { bass: 1.0, clarity: 0.5, width: 0.5 },
    advancedEQ: { band1Gain: 0, band2Gain: 0, band3Gain: 0, band4Gain: 0, band5Gain: 0 },
    bypassCompare: false
  };

  it('should build valid DSP parameters from settings', () => {
    const params = GraphBuilder.buildParams(sampleSettings);
    expect(params).toBeDefined();
    expect(params.isBypassed).toBe(false);
    expect(GraphBuilder.validateParams(params)).toBe(true);
  });

  it('should validate parameters correctly and reject corrupt values', () => {
    const params = GraphBuilder.buildParams(sampleSettings);

    // Corrupt frequency
    const invalidFreqParams: CalculatedDspParams = {
      ...params,
      eqGands: [{ ...params.eqGands[0]!, frequency: -500 }]
    };
    expect(GraphBuilder.validateParams(invalidFreqParams)).toBe(false);

    // Corrupt gain
    const invalidGainParams: CalculatedDspParams = {
      ...params,
      outputMakeupGainLinear: -10
    };
    expect(GraphBuilder.validateParams(invalidGainParams)).toBe(false);
  });
});
