import { CalculatedDspParams, StoredSettings } from '../../types';
import { getPreset } from '../presets/presets';
import { calculateDspParams } from '../utils/interpolate';

export class GraphBuilder {
  /**
   * Computes DSP parameters from current stored settings.
   */
  public static buildParams(settings: StoredSettings): CalculatedDspParams {
    const preset = getPreset(settings.selectedPreset);
    return calculateDspParams({
      preset,
      intensity: settings.intensity,
      trims: settings.trims,
      advancedEQ: settings.advancedEQ,
      bypassCompare: settings.bypassCompare
    });
  }

  /**
   * Validates calculated DSP parameters to ensure every value is within valid Web Audio API ranges.
   */
  public static validateParams(params: CalculatedDspParams): boolean {
    if (params.preGainLinear < 0.001 || params.preGainLinear > 10.0) return false;
    if (params.outputMakeupGainLinear < 0.001 || params.outputMakeupGainLinear > 10.0) return false;
    if (params.stereoSideGainLinear < 0.1 || params.stereoSideGainLinear > 5.0) return false;

    // Validate EQ Bands
    for (const band of params.eqGands) {
      if (band.frequency < 20 || band.frequency > 22000) return false;
      if (band.gain < -24 || band.gain > 24) return false;
      if (band.q < 0.1 || band.q > 20) return false;
    }

    // Validate Bass Shelf
    if (params.bassShelf.frequency < 20 || params.bassShelf.frequency > 500) return false;
    if (params.bassShelf.gain < -24 || params.bassShelf.gain > 24) return false;

    // Validate Compressor
    if (params.compressor.threshold < -100 || params.compressor.threshold > 0) return false;
    if (params.compressor.ratio < 1 || params.compressor.ratio > 50) return false;
    if (params.compressor.attack < 0.0001 || params.compressor.attack > 1.0) return false;
    if (params.compressor.release < 0.01 || params.compressor.release > 5.0) return false;

    return true;
  }
}
