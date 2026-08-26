import { TabInfo } from '../types';

export interface SiteAdapter {
  id: 'youtube' | 'youtubemusic';
  name: string;
  matches: (url: string) => boolean;
  formatTitle: (title: string, url: string) => string;
}

export const YOUTUBE_ADAPTER: SiteAdapter = {
  id: 'youtube',
  name: 'YouTube',
  matches: (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com' || u.hostname === 'm.youtube.com';
    } catch {
      return false;
    }
  },
  formatTitle: (rawTitle: string) => {
    let title = rawTitle.trim();
    // Strip trailing " - YouTube"
    if (title.endsWith(' - YouTube')) {
      title = title.slice(0, -10).trim();
    }
    return title || 'YouTube Video';
  }
};

export const YOUTUBE_MUSIC_ADAPTER: SiteAdapter = {
  id: 'youtubemusic',
  name: 'YouTube Music',
  matches: (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname === 'music.youtube.com';
    } catch {
      return false;
    }
  },
  formatTitle: (rawTitle: string) => {
    let title = rawTitle.trim();
    if (title.endsWith(' - YouTube Music')) {
      title = title.slice(0, -16).trim();
    }
    return title || 'YouTube Music Track';
  }
};

const SITE_ADAPTERS: SiteAdapter[] = [YOUTUBE_MUSIC_ADAPTER, YOUTUBE_ADAPTER];

export function getSiteAdapter(url: string): SiteAdapter | null {
  for (const adapter of SITE_ADAPTERS) {
    if (adapter.matches(url)) {
      return adapter;
    }
  }
  return null;
}

export function parseTabInfo(tab: chrome.tabs.Tab): TabInfo {
  const url = tab.url || tab.pendingUrl || '';
  const adapter = getSiteAdapter(url);

  if (adapter) {
    return {
      id: tab.id ?? -1,
      title: adapter.formatTitle(tab.title || '', url),
      url,
      isSupported: true,
      siteName: adapter.id
    };
  }

  return {
    id: tab.id ?? -1,
    title: tab.title || 'Unsupported Page',
    url,
    isSupported: false,
    siteName: 'unsupported'
  };
}
