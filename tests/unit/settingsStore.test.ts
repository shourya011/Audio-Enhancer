import { beforeEach, describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, DEFAULT_SETTINGS, SettingsStore, migrateSettings } from '../../src/storage/settingsStore';
import { StoredSettings } from '../../src/types';

describe('SettingsStore & Schema Migrations', () => {
  beforeEach(() => {
    // Clean memory fallback
    SettingsStore.saveImmediate({ ...DEFAULT_SETTINGS });
  });

  it('should return default settings when raw input is null or undefined', () => {
    const result = migrateSettings(null);
    expect(result).toEqual(DEFAULT_SETTINGS);

    const result2 = migrateSettings(undefined);
    expect(result2).toEqual(DEFAULT_SETTINGS);
  });

  it('should migrate older schema or partial data into valid schema version', () => {
    const legacyRaw = {
      selectedPreset: 'bass',
      intensity: 75,
      trims: { bass: 2.0 }
    };

    const migrated = migrateSettings(legacyRaw);
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.selectedPreset).toBe('bass');
    expect(migrated.intensity).toBe(75);
    expect(migrated.trims.bass).toBe(2.0);
    expect(migrated.trims.clarity).toBe(0.0); // defaults filled in
    expect(migrated.advancedEQ).toEqual(DEFAULT_SETTINGS.advancedEQ);
  });

  it('should sanitize out-of-range values during migration', () => {
    const corruptRaw = {
      schemaVersion: 0,
      selectedPreset: 'invalid_preset_name',
      intensity: 9999,
      trims: { bass: 50.0, clarity: -100.0, width: 'invalid' }
    };

    const migrated = migrateSettings(corruptRaw);
    expect(migrated.selectedPreset).toBe('enhance'); // fallback to default
    expect(migrated.intensity).toBe(100); // clamped to 100
    expect(migrated.trims.bass).toBe(3.0); // clamped to +3.0
    expect(migrated.trims.clarity).toBe(-3.0); // clamped to -3.0
    expect(migrated.trims.width).toBe(0.0); // fallback for non-number
  });

  it('should persist and load settings in memory fallback', async () => {
    const testSettings: StoredSettings = {
      schemaVersion: 1,
      selectedPreset: 'vocal',
      intensity: 80,
      trims: { bass: -1.0, clarity: 1.5, width: 0.0 },
      advancedEQ: { band1Gain: 1, band2Gain: -1, band3Gain: 2, band4Gain: 0, band5Gain: 1 },
      bypassCompare: false
    };

    await SettingsStore.saveImmediate(testSettings);
    const loaded = await SettingsStore.load();
    expect(loaded).toEqual(testSettings);
  });
});
