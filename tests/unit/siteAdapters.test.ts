import { describe, expect, it } from 'vitest';
import { getSiteAdapter, parseTabInfo } from '../../src/utils/siteAdapters';

describe('Site Adapters & Tab Parsing', () => {
  it('should identify and match standard YouTube URLs', () => {
    const urls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/shorts/abcdefghijk',
      'https://m.youtube.com/watch?v=12345'
    ];

    for (const url of urls) {
      const adapter = getSiteAdapter(url);
      expect(adapter).toBeDefined();
      expect(adapter?.id).toBe('youtube');
    }
  });

  it('should identify and match YouTube Music URLs', () => {
    const url = 'https://music.youtube.com/watch?v=9bZkp7q19f0';
    const adapter = getSiteAdapter(url);
    expect(adapter).toBeDefined();
    expect(adapter?.id).toBe('youtubemusic');
  });

  it('should reject unsupported domains', () => {
    const urls = [
      'https://www.spotify.com/track/12345',
      'https://vimeo.com/12345678',
      'https://www.google.com'
    ];

    for (const url of urls) {
      const adapter = getSiteAdapter(url);
      expect(adapter).toBeNull();
    }
  });

  it('should format tab titles cleanly by stripping redundant suffixes', () => {
    const tab: chrome.tabs.Tab = {
      id: 42,
      index: 0,
      pinned: false,
      highlighted: false,
      windowId: 1,
      active: true,
      incognito: false,
      selected: true,
      discarded: false,
      autoDiscardable: true,
      groupId: -1,
      title: 'Queen – Bohemian Rhapsody (Official Video) - YouTube',
      url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
    };

    const tabInfo = parseTabInfo(tab);
    expect(tabInfo.isSupported).toBe(true);
    expect(tabInfo.siteName).toBe('youtube');
    expect(tabInfo.title).toBe('Queen – Bohemian Rhapsody (Official Video)');
  });
});
