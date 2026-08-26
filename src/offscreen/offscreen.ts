import { AudioEngine } from '../audio/engine/AudioEngine';
import { ExtensionMessage, isValidMessage, StartCaptureMessage, UpdateSettingsMessage } from '../messaging/protocol';
import { ErrorState, StoredSettings } from '../types';

console.info('Audio Enhancer offscreen document initialized.');

const audioEngine = new AudioEngine({
  onError: (err: Error) => {
    console.error('AudioEngine error:', err);
    const errorState: ErrorState = {
      code: 'AUDIOCONTEXT_FAILED',
      message: 'The Web Audio processing engine encountered an unexpected error.',
      recoverable: true,
      details: err.message
    };
    chrome.runtime.sendMessage({
      type: 'AUDIO_ERROR',
      error: errorState
    }).catch(() => {});
  },
  onStreamEnded: () => {
    console.info('Captured MediaStream audio track ended.');
    const errorState: ErrorState = {
      code: 'STREAM_ENDED',
      message: 'Tab audio capture ended (tab was reloaded or closed).',
      recoverable: true
    };
    chrome.runtime.sendMessage({
      type: 'AUDIO_ERROR',
      error: errorState
    }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isValidMessage(message)) {
    return false;
  }

  const msg = message as ExtensionMessage;

  switch (msg.type) {
    case 'START_CAPTURE': {
      const startMsg = msg as StartCaptureMessage;
      handleStartCapture(startMsg.streamId, startMsg.settings)
        .then((result) => sendResponse(result))
        .catch((err) => {
          sendResponse({ success: false, error: String(err) });
        });
      return true; // Keep message channel open for async response
    }

    case 'STOP_CAPTURE': {
      audioEngine.stop().then(() => {
        sendResponse({ success: true });
      });
      return true;
    }

    case 'UPDATE_SETTINGS': {
      const updateMsg = msg as UpdateSettingsMessage;
      audioEngine.applySettings(updateMsg.settings);
      sendResponse({ success: true });
      return true;
    }

    case 'GET_AUDIO_LEVELS': {
      const levels = audioEngine.getAudioLevels();
      sendResponse({ levels });
      return false;
    }

    default:
      return false;
  }
});

async function handleStartCapture(streamId?: string, settings?: StoredSettings): Promise<{ success: boolean }> {
  if (!streamId) {
    throw new Error('No streamId provided for capture.');
  }

  // Acquire tab media stream using chromeMediaSourceId
  const mediaStreamConstraints = {
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    } as unknown as MediaTrackConstraints,
    video: false
  };

  const stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);

  if (!settings) {
    throw new Error('Initial settings required to build DSP graph.');
  }

  await audioEngine.start(stream, settings);
  return { success: true };
}
