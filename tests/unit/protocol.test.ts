import { describe, expect, it } from 'vitest';
import { isValidMessage } from '../../src/messaging/protocol';

describe('Messaging Protocol Contract', () => {
  it('should accept valid extension messages', () => {
    expect(isValidMessage({ type: 'GET_STATUS' })).toBe(true);
    expect(isValidMessage({ type: 'START_CAPTURE', tabId: 101 })).toBe(true);
    expect(isValidMessage({ type: 'STOP_CAPTURE' })).toBe(true);
    expect(isValidMessage({ type: 'UPDATE_SETTINGS', settings: {} })).toBe(true);
    expect(isValidMessage({ type: 'GET_AUDIO_LEVELS' })).toBe(true);
    expect(isValidMessage({ type: 'AUDIO_LEVELS_UPDATE', levels: {} })).toBe(true);
    expect(isValidMessage({ type: 'TAB_NAVIGATED', tabId: 1, url: 'a', title: 'b' })).toBe(true);
    expect(isValidMessage({ type: 'AUDIO_ERROR', error: {} })).toBe(true);
  });

  it('should reject invalid or malformed messages', () => {
    expect(isValidMessage(null)).toBe(false);
    expect(isValidMessage(undefined)).toBe(false);
    expect(isValidMessage('GET_STATUS')).toBe(false);
    expect(isValidMessage(123)).toBe(false);
    expect(isValidMessage({})).toBe(false);
    expect(isValidMessage({ type: 'MALICIOUS_TYPE' })).toBe(false);
  });
});
