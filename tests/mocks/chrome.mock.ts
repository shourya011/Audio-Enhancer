export function createMockChrome() {
  const listeners: Record<string, Array<(...args: unknown[]) => unknown>> = {
    'runtime.onMessage': [],
    'runtime.onInstalled': [],
    'runtime.onStartup': [],
    'tabs.onRemoved': [],
    'tabs.onUpdated': [],
    'tabs.onActivated': []
  };

  const storageData: Record<string, unknown> = {};

  return {
    runtime: {
      onMessage: {
        addListener: (fn: (...args: unknown[]) => unknown) => listeners['runtime.onMessage']?.push(fn),
        removeListener: (fn: (...args: unknown[]) => unknown) => {
          const idx = listeners['runtime.onMessage']?.indexOf(fn) ?? -1;
          if (idx !== -1) listeners['runtime.onMessage']?.splice(idx, 1);
        }
      },
      onInstalled: {
        addListener: (fn: (...args: unknown[]) => unknown) => listeners['runtime.onInstalled']?.push(fn)
      },
      onStartup: {
        addListener: (fn: (...args: unknown[]) => unknown) => listeners['runtime.onStartup']?.push(fn)
      },
      sendMessage: async (message: unknown) => {
        for (const listener of listeners['runtime.onMessage'] || []) {
          let sendResponseCalled = false;
          let responseData: unknown = undefined;
          const sendResponse = (data: unknown) => {
            sendResponseCalled = true;
            responseData = data;
          };
          const isAsync = listener(message, {}, sendResponse);
          if (sendResponseCalled) return responseData;
          if (isAsync) {
            await new Promise((r) => setTimeout(r, 10));
            return responseData;
          }
        }
        return { success: true };
      }
    },
    storage: {
      local: {
        get: async (key: string) => {
          return { [key]: storageData[key] };
        },
        set: async (items: Record<string, unknown>) => {
          Object.assign(storageData, items);
        },
        clear: async () => {
          for (const k of Object.keys(storageData)) {
            delete storageData[k];
          }
        }
      }
    },
    tabs: {
      query: async (_queryInfo: unknown) => {
        return [
          {
            id: 101,
            title: 'Queen – Bohemian Rhapsody (Official Video) - YouTube',
            url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
          }
        ];
      },
      get: async (tabId: number) => {
        return {
          id: tabId,
          title: 'Queen – Bohemian Rhapsody (Official Video) - YouTube',
          url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
        };
      },
      onRemoved: {
        addListener: (fn: (...args: unknown[]) => unknown) => listeners['tabs.onRemoved']?.push(fn)
      },
      onUpdated: {
        addListener: (fn: (...args: unknown[]) => unknown) => listeners['tabs.onUpdated']?.push(fn)
      },
      onActivated: {
        addListener: (fn: (...args: unknown[]) => unknown) => listeners['tabs.onActivated']?.push(fn)
      }
    },
    tabCapture: {
      getMediaStreamId: async (_options: unknown) => {
        return 'mock-stream-id-12345';
      }
    },
    offscreen: {
      Reason: { USER_MEDIA: 'USER_MEDIA' },
      hasDocument: async () => false,
      createDocument: async (_options: unknown) => {},
      closeDocument: async () => {}
    },
    _listeners: listeners,
    _storageData: storageData
  };
}
