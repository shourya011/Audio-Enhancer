import { PresetId, StoredSettings } from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: StoredSettings = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  selectedPreset: 'enhance',
  intensity: 100,
  trims: {
    bass: 0,
    clarity: 0,
    width: 0
  },
  advancedEQ: {
    band1Gain: 0,
    band2Gain: 0,
    band3Gain: 0,
    band4Gain: 0,
    band5Gain: 0
  },
  bypassCompare: false
};

const STORAGE_KEY = 'audio_enhancer_settings';

export function migrateSettings(raw: unknown): StoredSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const obj = raw as Record<string, unknown>;

  // Clone default baseline
  const migrated: StoredSettings = {
    ...DEFAULT_SETTINGS,
    trims: { ...DEFAULT_SETTINGS.trims },
    advancedEQ: { ...DEFAULT_SETTINGS.advancedEQ }
  };

  // Valid preset check
  const validPresets: PresetId[] = ['original', 'enhance', 'punchy', 'bass', 'vocal', 'night', 'spatial'];
  if (typeof obj.selectedPreset === 'string' && validPresets.includes(obj.selectedPreset as PresetId)) {
    migrated.selectedPreset = obj.selectedPreset as PresetId;
  }

  // Intensity validation
  if (typeof obj.intensity === 'number' && !isNaN(obj.intensity)) {
    migrated.intensity = Math.min(100, Math.max(0, Math.round(obj.intensity)));
  }

  // Trims validation
  if (obj.trims && typeof obj.trims === 'object') {
    const t = obj.trims as Record<string, unknown>;
    const clampTrim = (v: unknown): number => {
      const num = typeof v === 'number' && !isNaN(v) ? v : 0;
      return Math.min(3.0, Math.max(-3.0, num));
    };
    migrated.trims = {
      bass: clampTrim(t.bass),
      clarity: clampTrim(t.clarity),
      width: clampTrim(t.width)
    };
  }

  // Advanced EQ validation
  if (obj.advancedEQ && typeof obj.advancedEQ === 'object') {
    const eq = obj.advancedEQ as Record<string, unknown>;
    const clampGain = (v: unknown): number => {
      const num = typeof v === 'number' && !isNaN(v) ? v : 0;
      return Math.min(12.0, Math.max(-12.0, num));
    };
    migrated.advancedEQ = {
      band1Gain: clampGain(eq.band1Gain),
      band2Gain: clampGain(eq.band2Gain),
      band3Gain: clampGain(eq.band3Gain),
      band4Gain: clampGain(eq.band4Gain),
      band5Gain: clampGain(eq.band5Gain)
    };
  }

  // Bypass state
  if (typeof obj.bypassCompare === 'boolean') {
    migrated.bypassCompare = obj.bypassCompare;
  }

  // Update schema version to latest
  migrated.schemaVersion = CURRENT_SCHEMA_VERSION;
  return migrated;
}

export class SettingsStore {
  private static memoryFallback: StoredSettings = { ...DEFAULT_SETTINGS };
  private static debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private static pendingSettings: StoredSettings | null = null;

  /**
   * Loads settings from chrome.storage.local with automatic schema migration.
   */
  public static async load(): Promise<StoredSettings> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];
        const migrated = migrateSettings(stored);
        if (!stored || (stored as { schemaVersion?: number }).schemaVersion !== CURRENT_SCHEMA_VERSION) {
          // Save migrated settings back to storage
          await chrome.storage.local.set({ [STORAGE_KEY]: migrated });
        }
        return migrated;
      } catch (err) {
        console.warn('Failed to load settings from chrome.storage.local, using fallback:', err);
        return { ...this.memoryFallback };
      }
    }
    return { ...this.memoryFallback };
  }

  /**
   * Saves settings immediately to chrome.storage.local.
   */
  public static async saveImmediate(settings: StoredSettings): Promise<void> {
    this.memoryFallback = {
      ...settings,
      trims: { ...settings.trims },
      advancedEQ: { ...settings.advancedEQ }
    };

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      this.pendingSettings = null;
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: settings });
      } catch (err) {
        console.error('Failed to save settings to chrome.storage.local:', err);
      }
    }
  }

  /**
   * Saves settings with debouncing to prevent excessive disk/storage IO during slider dragging.
   */
  public static saveDebounced(settings: StoredSettings, delayMs = 250): void {
    this.pendingSettings = {
      ...settings,
      trims: { ...settings.trims },
      advancedEQ: { ...settings.advancedEQ }
    };
    this.memoryFallback = { ...this.pendingSettings };

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.pendingSettings) {
        this.saveImmediate(this.pendingSettings);
      }
    }, delayMs);
  }

  /**
   * Flushes any pending debounced writes immediately.
   */
  public static async flush(): Promise<void> {
    if (this.debounceTimer && this.pendingSettings) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      await this.saveImmediate(this.pendingSettings);
    }
  }
}
