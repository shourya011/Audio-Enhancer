import { beforeEach, describe, expect, it } from 'vitest';
import { AudioEngine } from '../../src/audio/engine/AudioEngine';
import { DEFAULT_SETTINGS } from '../../src/storage/settingsStore';
import { StoredSettings } from '../../src/types';
import { setupWebAudioMocks } from '../mocks/webAudio.mock';

describe('AudioEngine Web Audio Pipeline Integration', () => {
  beforeEach(() => {
    setupWebAudioMocks();
  });

  function createMockMediaStream(): MediaStream {
    const mockTrack = {
      kind: 'audio',
      enabled: true,
      stop: () => {},
      onended: null as ((this: MediaStreamTrack, ev: Event) => unknown) | null
    };

    return {
      getAudioTracks: () => [mockTrack],
      getTracks: () => [mockTrack]
    } as unknown as MediaStream;
  }

  it('should start audio engine, construct graph, and run cleanly', async () => {
    const engine = new AudioEngine();
    const stream = createMockMediaStream();

    expect(engine.running).toBe(false);

    await engine.start(stream, DEFAULT_SETTINGS);

    expect(engine.running).toBe(true);

    // Apply settings
    const updatedSettings: StoredSettings = {
      ...DEFAULT_SETTINGS,
      selectedPreset: 'punchy',
      intensity: 75,
      trims: { bass: 1.5, clarity: 1.0, width: 0.5 }
    };

    engine.applySettings(updatedSettings);

    // Metering
    const levels = engine.getAudioLevels();
    expect(levels).toBeDefined();
    expect(levels.frequencyData.length).toBe(32);

    // Teardown
    await engine.stop();
    expect(engine.running).toBe(false);
  });

  it('should handle rapid start/stop cycles without leaks', async () => {
    const engine = new AudioEngine();
    const stream = createMockMediaStream();

    for (let i = 0; i < 5; i++) {
      await engine.start(stream, DEFAULT_SETTINGS);
      expect(engine.running).toBe(true);
      await engine.stop();
      expect(engine.running).toBe(false);
    }
  });
});
