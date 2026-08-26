import { AudioLevels, ErrorState, ExtensionStatus, StoredSettings } from '../types';

export type MessageType =
  | 'GET_STATUS'
  | 'STATUS_UPDATE'
  | 'START_CAPTURE'
  | 'STOP_CAPTURE'
  | 'UPDATE_SETTINGS'
  | 'GET_AUDIO_LEVELS'
  | 'AUDIO_LEVELS_UPDATE'
  | 'TAB_NAVIGATED'
  | 'AUDIO_ERROR';

export interface GetStatusMessage {
  type: 'GET_STATUS';
}

export interface StatusUpdateMessage {
  type: 'STATUS_UPDATE';
  status: ExtensionStatus;
}

export interface StartCaptureMessage {
  type: 'START_CAPTURE';
  tabId: number;
  streamId?: string;
  settings?: StoredSettings;
}

export interface StopCaptureMessage {
  type: 'STOP_CAPTURE';
  tabId?: number;
  reason?: string;
}

export interface UpdateSettingsMessage {
  type: 'UPDATE_SETTINGS';
  settings: StoredSettings;
  immediate?: boolean;
}

export interface GetAudioLevelsMessage {
  type: 'GET_AUDIO_LEVELS';
}

export interface AudioLevelsUpdateMessage {
  type: 'AUDIO_LEVELS_UPDATE';
  levels: AudioLevels;
}

export interface TabNavigatedMessage {
  type: 'TAB_NAVIGATED';
  tabId: number;
  url: string;
  title: string;
}

export interface AudioErrorMessage {
  type: 'AUDIO_ERROR';
  error: ErrorState;
}

export type ExtensionMessage =
  | GetStatusMessage
  | StatusUpdateMessage
  | StartCaptureMessage
  | StopCaptureMessage
  | UpdateSettingsMessage
  | GetAudioLevelsMessage
  | AudioLevelsUpdateMessage
  | TabNavigatedMessage
  | AudioErrorMessage;

export function isValidMessage(msg: unknown): msg is ExtensionMessage {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as Record<string, unknown>;
  const validTypes: MessageType[] = [
    'GET_STATUS',
    'STATUS_UPDATE',
    'START_CAPTURE',
    'STOP_CAPTURE',
    'UPDATE_SETTINGS',
    'GET_AUDIO_LEVELS',
    'AUDIO_LEVELS_UPDATE',
    'TAB_NAVIGATED',
    'AUDIO_ERROR'
  ];
  return typeof m.type === 'string' && validTypes.includes(m.type as MessageType);
}
