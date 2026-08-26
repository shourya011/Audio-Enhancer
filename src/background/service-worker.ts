import { ErrorState, ExtensionStatus, TabInfo } from '../types';
import { ExtensionMessage, isValidMessage, StartCaptureMessage, StopCaptureMessage, UpdateSettingsMessage } from '../messaging/protocol';
import { SettingsStore } from '../storage/settingsStore';
import { parseTabInfo } from '../utils/siteAdapters';
import { OffscreenManager } from './offscreen-manager';

class ServiceWorkerState {
  public enabled = false;
  public processingTabId: number | null = null;
  public error: ErrorState | null = null;
}

const state = new ServiceWorkerState();

// Initialize on extension installation
chrome.runtime.onInstalled.addListener(async () => {
  console.info('Audio Enhancer extension installed.');
  await SettingsStore.load();
});

// Reset transient state on browser startup
chrome.runtime.onStartup.addListener(() => {
  console.info('Audio Enhancer starting up.');
  state.enabled = false;
  state.processingTabId = null;
  state.error = null;
});

/**
 * Gets the current active tab information.
 */
async function getActiveTabInfo(): Promise<TabInfo | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab) {
      return parseTabInfo(tab);
    }
  } catch (err) {
    console.warn('Failed to query active tab:', err);
  }
  return null;
}

/**
 * Builds the complete extension status payload.
 */
async function getFullStatus(): Promise<ExtensionStatus> {
  const settings = await SettingsStore.load();
  const activeTab = await getActiveTabInfo();

  return {
    enabled: state.enabled,
    processingTabId: state.processingTabId,
    activeTab,
    settings,
    error: state.error
  };
}

/**
 * Starts audio enhancement capture on the specified tab.
 */
async function handleStartCapture(tabId: number): Promise<ExtensionStatus> {
  state.error = null;

  try {
    // 1. Verify tab exists and is supported
    const tab = await chrome.tabs.get(tabId);
    const tabInfo = parseTabInfo(tab);
    if (!tabInfo.isSupported) {
      state.error = {
        code: 'UNSUPPORTED_PAGE',
        message: 'Enhancement is only supported on YouTube and YouTube Music tabs.',
        recoverable: false
      };
      state.enabled = false;
      state.processingTabId = null;
      return await getFullStatus();
    }

    // 2. If already capturing another tab, stop previous capture first
    if (state.enabled && state.processingTabId && state.processingTabId !== tabId) {
      await handleStopCapture(state.processingTabId, 'Switching active capture tab');
    }

    // 3. Ensure Offscreen Document is active
    await OffscreenManager.ensureDocument();

    // 4. Request tab capture stream ID
    let streamId: string;
    try {
      streamId = await new Promise<string>((resolve, reject) => {
        chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (id) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (!id) {
            reject(new Error('No streamId returned by tabCapture.getMediaStreamId'));
          } else {
            resolve(id);
          }
        });
      });
    } catch (captureErr) {
      console.error('tabCapture.getMediaStreamId failed:', captureErr);
      state.error = {
        code: 'CAPTURE_FAILED',
        message: 'Could not capture audio from this tab. Please refresh the page and try again.',
        recoverable: true,
        details: String(captureErr)
      };
      state.enabled = false;
      state.processingTabId = null;
      await OffscreenManager.closeDocument();
      return await getFullStatus();
    }

    // 5. Send start capture instruction to Offscreen Document
    const currentSettings = await SettingsStore.load();
    const startMsg: StartCaptureMessage = {
      type: 'START_CAPTURE',
      tabId,
      streamId,
      settings: currentSettings
    };

    try {
      await chrome.runtime.sendMessage(startMsg);
    } catch (msgErr) {
      console.error('Failed to send START_CAPTURE to offscreen document:', msgErr);
      state.error = {
        code: 'OFFSCREEN_LOST',
        message: 'Audio processing engine could not be contacted.',
        recoverable: true
      };
      state.enabled = false;
      state.processingTabId = null;
      await OffscreenManager.closeDocument();
      return await getFullStatus();
    }

    state.enabled = true;
    state.processingTabId = tabId;
    state.error = null;
  } catch (err) {
    console.error('Error during start capture:', err);
    state.error = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred while starting audio enhancement.',
      recoverable: true,
      details: String(err)
    };
    state.enabled = false;
    state.processingTabId = null;
    await OffscreenManager.closeDocument();
  }

  return await getFullStatus();
}

/**
 * Stops audio enhancement capture cleanly.
 */
async function handleStopCapture(tabId?: number, reason?: string): Promise<ExtensionStatus> {
  try {
    const stopMsg: StopCaptureMessage = {
      type: 'STOP_CAPTURE',
      tabId,
      reason
    };
    await chrome.runtime.sendMessage(stopMsg).catch(() => {});
  } catch {
    // Ignore message routing errors during teardown
  }

  await OffscreenManager.closeDocument();

  state.enabled = false;
  state.processingTabId = null;
  state.error = null;

  return await getFullStatus();
}

// Clean up when captured tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (state.enabled && state.processingTabId === tabId) {
    console.info(`Captured tab ${tabId} was closed. Cleaning up.`);
    await handleStopCapture(tabId, 'Tab closed');
  }
});

// Clean up when captured tab reloads or navigates away
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (state.enabled && state.processingTabId === tabId) {
    if (changeInfo.status === 'loading') {
      console.info(`Captured tab ${tabId} reloaded or navigated. Cleaning up.`);
      await handleStopCapture(tabId, 'Tab navigated or reloaded');
    }
  }
});

// Message listener
chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isValidMessage(message)) {
    return false;
  }

  const msg = message as ExtensionMessage;

  switch (msg.type) {
    case 'GET_STATUS': {
      getFullStatus().then(sendResponse);
      return true; // Keep message channel open for async response
    }

    case 'START_CAPTURE': {
      handleStartCapture(msg.tabId).then(sendResponse);
      return true;
    }

    case 'STOP_CAPTURE': {
      handleStopCapture(msg.tabId, msg.reason).then(sendResponse);
      return true;
    }

    case 'UPDATE_SETTINGS': {
      const updateMsg = msg as UpdateSettingsMessage;
      (async () => {
        if (updateMsg.immediate) {
          await SettingsStore.saveImmediate(updateMsg.settings);
        } else {
          SettingsStore.saveDebounced(updateMsg.settings);
        }

        // Forward setting update to offscreen document
        if (state.enabled) {
          chrome.runtime.sendMessage(updateMsg).catch(() => {});
        }

        sendResponse({ success: true });
      })();
      return true;
    }

    case 'AUDIO_ERROR': {
      state.error = msg.error;
      state.enabled = false;
      state.processingTabId = null;
      OffscreenManager.closeDocument().catch(() => {});
      sendResponse({ received: true });
      return true;
    }

    case 'TAB_NAVIGATED': {
      // YouTube SPA navigation notification
      sendResponse({ acknowledged: true });
      return true;
    }

    default:
      return false;
  }
});
