import { AdvancedEQ, CalculatedDspParams, PresetConfig, Trims } from '../../types';
import { clamp, dbToGain } from './loudness';

export interface InterpolationOptions {
  preset: PresetConfig;
  intensity: number;      // 0 to 100
  trims: Trims;
  advancedEQ: AdvancedEQ;
  bypassCompare: boolean;
}

/**
 * Pure function to calculate all DSP parameters given settings and preset.
 * Ensures zero-click smoothing bounds and safety limits on all filters.
 */
export function calculateDspParams(options: InterpolationOptions): CalculatedDspParams {
  const { preset, intensity, trims, advancedEQ, bypassCompare } = options;

  // If A/B bypass is active or preset is "original", output clean transparent passthrough
  if (bypassCompare || preset.id === 'original') {
    return {
      preGainLinear: 1.0,
      eqGands: preset.eqBands.map((band) => ({
        type: band.type,
        frequency: band.frequency,
        gain: 0.0,
        q: band.q
      })),
      bassShelf: {
        type: preset.bassShelf.type,
        frequency: preset.bassShelf.frequency,
        gain: 0.0,
        q: preset.bassShelf.q
      },
      compressor: {
        threshold: 0.0,
        ratio: 1.0,
        attack: 0.010,
        release: 0.100,
        knee: 0.0
      },
      stereoSideGainLinear: 1.0,
      outputMakeupGainLinear: 1.0,
      limiterThresholdDb: -1.0,
      isBypassed: true
    };
  }

  // Normalized intensity scalar (0.0 to 1.0)
  const t = clamp(intensity, 0, 100) / 100;

  // Headroom pre-gain: smoothly scale with intensity
  const effectivePreGainDb = preset.preGainDb * t;
  const preGainLinear = dbToGain(effectivePreGainDb);

  // Bounded trims (safety limits: -3.0 dB to +3.0 dB)
  const safeBassTrim = clamp(trims.bass, -3.0, 3.0);
  const safeClarityTrim = clamp(trims.clarity, -3.0, 3.0);
  const safeWidthTrim = clamp(trims.width, -3.0, 3.0);

  // EQ Bands calculation
  // Band 1 (100 Hz Shelf): preset * t + bassTrim + advancedEQ
  const band1Gain = clamp(
    preset.eqBands[0].gain * t + safeBassTrim * 0.75 + clamp(advancedEQ.band1Gain, -12, 12),
    -12.0,
    12.0
  );

  // Band 2 (300 Hz Peaking): preset * t + advancedEQ
  const band2Gain = clamp(
    preset.eqBands[1].gain * t + clamp(advancedEQ.band2Gain, -12, 12),
    -12.0,
    12.0
  );

  // Band 3 (3000 Hz Peaking): preset * t + clarityTrim + advancedEQ
  const band3Gain = clamp(
    preset.eqBands[2].gain * t + safeClarityTrim * 0.85 + clamp(advancedEQ.band3Gain, -12, 12),
    -12.0,
    12.0
  );

  // Band 4 (6000 Hz Peaking): preset * t + advancedEQ
  const band4Gain = clamp(
    preset.eqBands[3].gain * t + clamp(advancedEQ.band4Gain, -12, 12),
    -12.0,
    12.0
  );

  // Band 5 (12000 Hz Shelf): preset * t + (clarityTrim * 0.5) + advancedEQ
  const band5Gain = clamp(
    preset.eqBands[4].gain * t + safeClarityTrim * 0.5 + clamp(advancedEQ.band5Gain, -12, 12),
    -12.0,
    12.0
  );

  // Dedicated Bass Enhancement Shelf
  const bassShelfGain = clamp(
    preset.bassShelf.gain * t + safeBassTrim * 0.75,
    -12.0,
    12.0
  );

  // Dynamics Compressor parameters
  // Interpolate threshold from 0.0 dB (no compression) down to preset threshold
  const compressorThreshold = preset.compressor.threshold * t;
  // Interpolate ratio from 1.0:1 (linear passthrough) up to preset ratio
  const compressorRatio = 1.0 + (preset.compressor.ratio - 1.0) * t;
  // Attack, release, and knee snap to musical preset values once t > 0
  const compressorAttack = preset.compressor.attack;
  const compressorRelease = preset.compressor.release;
  const compressorKnee = preset.compressor.knee * (t > 0 ? 1 : 0);

  // Stereo Enhancement (Mid/Side processing)
  // Safe side boost: 0.0 dB to 3.0 dB max to preserve mono phase coherence
  const sideBoostDb = clamp(preset.stereoWidthDb * t + safeWidthTrim, 0.0, 3.0);
  const stereoSideGainLinear = dbToGain(sideBoostDb);

  // Output Makeup Gain
  // Base preset makeup interpolated by intensity
  let effectiveMakeupDb = preset.makeupGainDb * t;
  // If user applied heavy positive bass or clarity trims, slightly temper makeup to preserve headroom
  if (safeBassTrim > 0) {
    effectiveMakeupDb -= safeBassTrim * 0.25;
  }
  if (safeClarityTrim > 0) {
    effectiveMakeupDb -= safeClarityTrim * 0.15;
  }
  const outputMakeupGainLinear = dbToGain(clamp(effectiveMakeupDb, -6.0, 6.0));

  return {
    preGainLinear,
    eqGands: [
      {
        type: preset.eqBands[0].type,
        frequency: preset.eqBands[0].frequency,
        gain: band1Gain,
        q: preset.eqBands[0].q
      },
      {
        type: preset.eqBands[1].type,
        frequency: preset.eqBands[1].frequency,
        gain: band2Gain,
        q: preset.eqBands[1].q
      },
      {
        type: preset.eqBands[2].type,
        frequency: preset.eqBands[2].frequency,
        gain: band3Gain,
        q: preset.eqBands[2].q
      },
      {
        type: preset.eqBands[3].type,
        frequency: preset.eqBands[3].frequency,
        gain: band4Gain,
        q: preset.eqBands[3].q
      },
      {
        type: preset.eqBands[4].type,
        frequency: preset.eqBands[4].frequency,
        gain: band5Gain,
        q: preset.eqBands[4].q
      }
    ],
    bassShelf: {
      type: preset.bassShelf.type,
      frequency: preset.bassShelf.frequency,
      gain: bassShelfGain,
      q: preset.bassShelf.q
    },
    compressor: {
      threshold: compressorThreshold,
      ratio: compressorRatio,
      attack: compressorAttack,
      release: compressorRelease,
      knee: compressorKnee
    },
    stereoSideGainLinear,
    outputMakeupGainLinear,
    limiterThresholdDb: preset.limiterThresholdDb,
    isBypassed: false
  };
}
