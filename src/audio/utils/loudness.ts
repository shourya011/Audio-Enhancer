/**
 * Audio gain, dB conversion, and loudness utility functions
 */

export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

export function gainToDb(gain: number): number {
  if (gain <= 0.000001) return -120;
  return 20 * Math.log10(gain);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates estimated perceptual loudness offset across 5 bands
 * to ensure presets maintain consistent subjective loudness relative to Original.
 */
export function calculateLoudnessCorrection(
  bandGainsDb: number[],
  preGainDb: number,
  compressionRatio: number,
  compressionThresholdDb: number
): number {
  // Approximate frequency weighting factors:
  // Sub/Bass ~ 0.15, Low-Mid ~ 0.25, Presence ~ 0.35, High-Mid ~ 0.15, Air ~ 0.10
  const weights = [0.15, 0.25, 0.35, 0.15, 0.10];
  let weightedBoost = 0;
  for (let i = 0; i < bandGainsDb.length && i < weights.length; i++) {
    weightedBoost += (bandGainsDb[i] ?? 0) * (weights[i] ?? 0);
  }

  // Estimated compression attenuation offset under typical music levels (-14 dBFS average)
  const avgLevel = -14;
  let compressionAttenuation = 0;
  if (avgLevel > compressionThresholdDb && compressionRatio > 1) {
    const overThreshold = avgLevel - compressionThresholdDb;
    const compressedOver = overThreshold / compressionRatio;
    compressionAttenuation = overThreshold - compressedOver;
  }

  // Target makeup offset to match original volume without loudness creep
  const targetMakeup = -(preGainDb + weightedBoost * 0.4) + compressionAttenuation * 0.6;
  return clamp(targetMakeup, -6.0, 6.0);
}
