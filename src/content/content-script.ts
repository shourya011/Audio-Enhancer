/**
 * Lightweight content script injected into YouTube and YouTube Music tabs
 * to detect Single-Page-Application (SPA) video and track transitions.
 */

function notifyTabNavigation(): void {
  try {
    const title = document.title;
    const url = window.location.href;

    chrome.runtime.sendMessage({
      type: 'TAB_NAVIGATED',
      url,
      title
    }).catch(() => {
      // Background service worker may be suspended; this is harmless
    });
  } catch {
    // Ignore runtime errors
  }
}

// Listen for YouTube SPA navigation completion
window.addEventListener('yt-navigate-finish', () => {
  // Give document.title a tick to update
  setTimeout(notifyTabNavigation, 200);
});

// Also listen for YouTube Music page data updates
window.addEventListener('yt-page-data-updated', () => {
  setTimeout(notifyTabNavigation, 200);
});

// Initial load notification
if (document.readyState === 'complete') {
  notifyTabNavigation();
} else {
  window.addEventListener('DOMContentLoaded', notifyTabNavigation);
}
