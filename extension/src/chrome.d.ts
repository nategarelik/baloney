// Ambient Chrome API type declarations for Manifest V3

declare namespace chrome {
  namespace storage {
    interface StorageChange {
      oldValue?: unknown;
      newValue?: unknown;
    }

    interface StorageArea {
      get(keys: string | string[] | Record<string, unknown>, callback: (items: Record<string, unknown>) => void): void;
      get(keys: string | string[] | Record<string, unknown>): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>, callback?: () => void): void;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[], callback?: () => void): void;
    }

    const local: StorageArea;

    const onChanged: {
      addListener(callback: (changes: Record<string, StorageChange>) => void): void;
    };
  }

  namespace runtime {
    const lastError: { message: string } | undefined;

    function sendMessage(message: unknown, callback?: (response: unknown) => void): void;

    const onMessage: {
      addListener(
        callback: (
          message: Record<string, unknown>,
          sender: { tab?: { id?: number; url?: string } },
          sendResponse: (response?: unknown) => void,
        ) => boolean | void,
      ): void;
    };

    const onInstalled: {
      addListener(callback: (details: { reason: string }) => void): void;
    };
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
    }

    function query(queryInfo: Record<string, unknown>, callback?: (tabs: Tab[]) => void): Promise<Tab[]>;
    function sendMessage(tabId: number, message: unknown, callback?: (response: unknown) => void): void;
    function create(createProperties: { url: string }): void;
  }

  namespace contextMenus {
    interface CreateProperties {
      id: string;
      title: string;
      contexts: string[];
    }

    function create(createProperties: CreateProperties): void;

    const onClicked: {
      addListener(
        callback: (
          info: { menuItemId: string; srcUrl?: string; selectionText?: string },
          tab?: chrome.tabs.Tab,
        ) => void,
      ): void;
    };
  }

  namespace commands {
    const onCommand: {
      addListener(callback: (command: string) => void): void;
    };
  }

  namespace action {
    function setBadgeText(details: { text: string }): void;
    function setBadgeBackgroundColor(details: { color: string }): void;
    function setBadgeTextColor(details: { color: string }): void;
  }

  namespace sidePanel {
    function setPanelBehavior(behavior: { openPanelOnActionClick: boolean }): void;
  }
}
