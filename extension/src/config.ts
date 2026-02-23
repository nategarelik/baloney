// extension/src/config.ts — Configuration and settings management

const DEFAULT_API_URL = "https://trustlens-nu.vercel.app";

export const MIN_IMAGE_SIZE = 200;
export const MAX_CONCURRENT = 3;
export const MIN_SELECTION_LENGTH = 20;
export const VIDEO_MAX_FRAMES = 5;

export type ContentMode = "scan" | "blur" | "block";

export type Verdict = "ai_generated" | "heavy_edit" | "light_edit" | "human" | "unavailable";

export interface Settings {
  extensionEnabled: boolean;
  autoScanText: boolean;
  autoScanImages: boolean;
  autoScanVideos: boolean;
  contentMode: ContentMode;
  allowedSites: string[];
}

export const DEFAULT_ALLOWED_SITES: readonly string[] = [
  "x.com",
  "linkedin.com",
  "substack.com",
  "reddit.com",
  "facebook.com",
  "instagram.com",
  "medium.com",
  "tiktok.com",
  "threads.net",
] as const;

export const settings: Settings = {
  extensionEnabled: true,
  autoScanText: false,
  autoScanImages: true,
  autoScanVideos: true,
  contentMode: "scan",
  allowedSites: [...DEFAULT_ALLOWED_SITES],
};

export async function getApiUrl(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get("apiUrl", (data: Record<string, unknown>) => {
      const url = data.apiUrl;
      resolve(typeof url === "string" && url.length > 0 ? url : DEFAULT_API_URL);
    });
  });
}

let cachedApiUrl: string = DEFAULT_API_URL;

export function getApiUrlSync(): string {
  return cachedApiUrl;
}

export async function initApiUrl(): Promise<void> {
  cachedApiUrl = await getApiUrl();
}

export function loadSettings(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [
        "extensionEnabled",
        "autoScanText",
        "autoScanImages",
        "autoScanVideos",
        "contentMode",
        "allowedSites",
      ],
      (data: Record<string, unknown>) => {
        if (data.extensionEnabled !== undefined)
          settings.extensionEnabled = data.extensionEnabled as boolean;
        if (data.autoScanText !== undefined)
          settings.autoScanText = data.autoScanText as boolean;
        if (data.autoScanImages !== undefined)
          settings.autoScanImages = data.autoScanImages as boolean;
        if (data.autoScanVideos !== undefined)
          settings.autoScanVideos = data.autoScanVideos as boolean;
        if (data.contentMode !== undefined)
          settings.contentMode = data.contentMode as ContentMode;
        if (data.allowedSites !== undefined)
          settings.allowedSites = data.allowedSites as string[];
        resolve();
      },
    );
  });
}

export const VERDICT_COLORS: Record<string, string> = {
  ai_generated: "#d4456b",
  heavy_edit: "#f97316",
  light_edit: "#f59e0b",
  human: "#16a34a",
  unavailable: "#94a3b8",
};

export const VERDICT_LABELS: Record<string, string> = {
  ai_generated: "AI Generated",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human Written",
  unavailable: "Unavailable",
};
