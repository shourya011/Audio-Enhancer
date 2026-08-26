const OFFSCREEN_PATH = 'offscreen/offscreen.html';

export class OffscreenManager {
  private static creatingPromise: Promise<void> | null = null;

  /**
   * Checks if an offscreen document currently exists.
   */
  public static async hasDocument(): Promise<boolean> {
    if (typeof chrome === 'undefined' || !chrome.offscreen) {
      return false;
    }

    if ('hasDocument' in chrome.offscreen && typeof chrome.offscreen.hasDocument === 'function') {
      return await chrome.offscreen.hasDocument();
    }

    return false;
  }

  /**
   * Ensures that the offscreen document is open and ready.
   * Uses an in-flight promise to prevent race conditions from concurrent calls.
   */
  public static async ensureDocument(): Promise<void> {
    if (await this.hasDocument()) {
      return;
    }

    if (this.creatingPromise) {
      await this.creatingPromise;
      return;
    }

    this.creatingPromise = (async () => {
      try {
        if (await this.hasDocument()) {
          return;
        }

        await chrome.offscreen.createDocument({
          url: OFFSCREEN_PATH,
          reasons: [chrome.offscreen.Reason.USER_MEDIA],
          justification: 'Real-time Web Audio API signal processing for tab audio capture'
        });
      } finally {
        this.creatingPromise = null;
      }
    })();

    await this.creatingPromise;
  }

  /**
   * Closes the offscreen document if it is open.
   */
  public static async closeDocument(): Promise<void> {
    if (await this.hasDocument()) {
      try {
        await chrome.offscreen.closeDocument();
      } catch (err) {
        console.warn('Error closing offscreen document:', err);
      }
    }
  }
}
