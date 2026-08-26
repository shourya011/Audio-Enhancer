import { beforeEach, describe, expect, it } from 'vitest';
import { OffscreenManager } from '../../src/background/offscreen-manager';
import { createMockChrome } from '../mocks/chrome.mock';

describe('Service Worker & Extension Architecture Integration', () => {
  let mockChrome: ReturnType<typeof createMockChrome>;

  beforeEach(() => {
    mockChrome = createMockChrome();
    // @ts-ignore
    global.chrome = mockChrome;
  });

  it('OffscreenManager should handle document creation idempotently', async () => {
    let createCount = 0;
    mockChrome.offscreen.createDocument = async () => {
      createCount++;
    };

    const p1 = OffscreenManager.ensureDocument();
    const p2 = OffscreenManager.ensureDocument();

    await Promise.all([p1, p2]);
    expect(createCount).toBe(1);
  });
});
