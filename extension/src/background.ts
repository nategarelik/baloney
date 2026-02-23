// extension/src/background.ts — Baloney Background Service Worker (v0.5.0)
// Handles image fetching (bypasses CORS via host_permissions), API communication,
// storage defaults, migration, and sidepanel management.

import { DEFAULT_ALLOWED_SITES, getApiUrl } from "./config";

const API_TIMEOUT_MS = 8000;

const STORAGE_DEFAULTS: Record<string, unknown> = {
  extensionEnabled: true,
  autoScanText: false,
  autoScanImages: true,
  autoScanVideos: true,
  contentMode: "scan",
  allowedSites: [...DEFAULT_ALLOWED_SITES],
  sidepanelData: null,
};

// ──────────────────────────────────────────────
// Core functions
// ──────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const data = await chrome.storage.local.get("userId") as Record<string, unknown>;
  if (data.userId) return data.userId as string;
  const userId = crypto.randomUUID();
  await chrome.storage.local.set({ userId });
  return userId;
}

function detectPlatform(url: string): string {
  if (!url) return "unknown";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("x.com") || url.includes("twitter.com")) return "x";
  if (url.includes("reddit.com")) return "reddit";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("medium.com")) return "medium";
  if (url.includes("substack.com")) return "substack";
  if (url.includes("threads.net")) return "threads";
  return "other";
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}

async function hashString(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function detectImage(
  base64Image: string,
  platform: string,
  sourceDomain: string | null,
  pageUrl: string,
): Promise<unknown> {
  const apiUrl = await getApiUrl();
  const userId = await getUserId();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const pageUrlHash = pageUrl ? await hashString(pageUrl) : null;

  try {
    const response = await fetch(`${apiUrl}/api/detect/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        image: base64Image,
        user_id: userId,
        platform,
        source_domain: sourceDomain,
        page_url_hash: pageUrlHash,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function detectWithFallback(
  base64Image: string,
  platform: string,
  sourceDomain: string | null,
  pageUrl: string,
): Promise<unknown> {
  const maxRetries = 2;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await detectImage(base64Image, platform, sourceDomain, pageUrl);
    } catch (error) {
      lastError = error as Error;
      if (lastError.message?.includes("API error: 4")) break;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  console.warn("[Baloney] API unavailable after retries:", lastError?.message);
  return {
    verdict: "unavailable",
    confidence: 0,
    model: "api-unavailable",
    error: lastError?.message || "Detection API unreachable",
  };
}

// ──────────────────────────────────────────────
// Installation & storage migration
// ──────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details: { reason: string }) => {
  chrome.contextMenus.create({
    id: "scan-image",
    title: "Scan with Baloney",
    contexts: ["image"],
  });
  chrome.contextMenus.create({
    id: "check-text",
    title: "Check with Baloney",
    contexts: ["selection"],
  });

  const existing = await chrome.storage.local.get(Object.keys(STORAGE_DEFAULTS)) as Record<string, unknown>;
  const toSet: Record<string, unknown> = {};
  for (const [key, defaultValue] of Object.entries(STORAGE_DEFAULTS)) {
    if (existing[key] === undefined) {
      toSet[key] = defaultValue;
    }
  }
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  if (details.reason === "update") {
    const data = await chrome.storage.local.get(["filterMode", "contentMode"]) as Record<string, unknown>;
    if (data.filterMode && !data.contentMode) {
      const modeMap: Record<string, string> = { label: "scan", blur: "blur", hide: "block" };
      const newMode = modeMap[data.filterMode as string] || "scan";
      await chrome.storage.local.set({ contentMode: newMode });
      await chrome.storage.local.remove("filterMode");
      console.log("[Baloney] Migrated filterMode ->", newMode);
    }
  }

  if (details.reason === "install") {
    const apiUrl = await getApiUrl();
    getUserId().then((userId) => {
      fetch(`${apiUrl}/api/sharing/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, enabled: true }),
      }).catch(() => {});
    });
  }

  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});

// ──────────────────────────────────────────────
// Shared text analysis flow (used by context menu + keyboard shortcut)
// ──────────────────────────────────────────────

async function analyzeAndSendTextResult(tab: chrome.tabs.Tab, text: string): Promise<void> {
  const textPreview = text.slice(0, 80);

  chrome.tabs.sendMessage(tab.id!, {
    type: "show-text-toast-loading",
    textPreview,
  });

  const apiUrl = await getApiUrl();
  const userId = await getUserId();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    const response = await fetch(`${apiUrl}/api/detect/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        text,
        user_id: userId,
        platform: detectPlatform(tab.url || ""),
      }),
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();

    chrome.tabs.sendMessage(tab.id!, {
      type: "show-text-toast-result",
      result,
      text,
      textPreview,
    });
  } catch (err) {
    const error = err as Error;
    console.warn("[Baloney] Text check API unavailable:", error.message);
    chrome.tabs.sendMessage(tab.id!, {
      type: "show-text-toast-error",
      errorMsg: error.message || "Analysis failed",
      text,
    });
  }
}

// ──────────────────────────────────────────────
// Context menus
// ──────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "scan-image" && info.srcUrl) {
    try {
      const base64 = await fetchImageAsBase64(info.srcUrl);
      const result = await detectWithFallback(
        base64,
        detectPlatform(tab?.url || ""),
        extractDomain(info.srcUrl),
        tab?.url || "",
      );
      chrome.tabs.sendMessage(tab!.id!, {
        type: "show-result",
        result,
        srcUrl: info.srcUrl,
      });
    } catch (err) {
      console.error("[Baloney] Context menu scan error:", err);
    }
  }

  if (info.menuItemId === "check-text" && info.selectionText) {
    analyzeAndSendTextResult(tab!, info.selectionText);
  }
});

// ──────────────────────────────────────────────
// Keyboard shortcut (Alt+B)
// ──────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command: string) => {
  if (command !== "scan-selected-text") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const response = await new Promise<{ text?: string }>((resolve) => {
      chrome.tabs.sendMessage(tab.id!, { type: "get-selected-text" }, (resp: unknown) => {
        resolve((resp || {}) as { text?: string });
      });
    });
    if (response.text && response.text.trim().length > 0) {
      analyzeAndSendTextResult(tab, response.text.trim());
    }
  } catch (err) {
    console.warn("[Baloney] Could not get selected text:", (err as Error).message);
  }
});

// ──────────────────────────────────────────────
// Toolbar badge (red count of AI-flagged images)
// ──────────────────────────────────────────────

chrome.storage.onChanged.addListener((changes: Record<string, { newValue?: unknown }>) => {
  if (changes.sessionStats) {
    const stats = changes.sessionStats.newValue as { flaggedAI?: number } | undefined;
    const count = stats?.flaggedAI || 0;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#d4456b" });
    chrome.action.setBadgeTextColor({ color: "#ffffff" });
  }
});

// ──────────────────────────────────────────────
// Message handling
// ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message: Record<string, unknown>, sender, sendResponse) => {
  if (message.type === "analyze-image") {
    const tabUrl = sender.tab?.url || "";
    const platform = detectPlatform(tabUrl);
    const sourceDomain = extractDomain(message.url as string);

    fetchImageAsBase64(message.url as string)
      .then((base64) => detectWithFallback(base64, platform, sourceDomain, tabUrl))
      .then((result) => sendResponse(result))
      .catch((error: Error) => {
        console.error("[Baloney] Detection error:", error);
        sendResponse({ error: error.message });
      });

    return true;
  }

  if (message.type === "analyze-video-frame") {
    const tabUrl = sender.tab?.url || "";
    const platform = detectPlatform(tabUrl);
    const base64 = (message.base64 || message.url) as string;

    detectWithFallback(base64, platform, null, tabUrl)
      .then((result) => sendResponse(result))
      .catch((error: Error) => {
        console.error("[Baloney] Video frame detection error:", error);
        sendResponse({ error: error.message });
      });

    return true;
  }

  if (message.type === "analyze-text") {
    const tabUrl = sender.tab?.url || "";
    const platform = detectPlatform(tabUrl);

    (async () => {
      const apiUrl = await getApiUrl();
      const uid = await getUserId();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
        const response = await fetch(`${apiUrl}/api/detect/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            text: message.text,
            user_id: uid,
            platform,
          }),
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const result = await response.json();
        sendResponse(result);
      } catch (error) {
        const err = error as Error;
        console.warn("[Baloney] Text API unavailable:", err.message);
        sendResponse({
          verdict: "unavailable",
          confidence: 0,
          ai_probability: 0,
          model: "api-unavailable",
          error: err.message || "Detection API unreachable",
        });
      }
    })();

    return true;
  }

  if (message.type === "get-stats") {
    chrome.storage.local.get("sessionStats", (data: Record<string, unknown>) => {
      sendResponse(data.sessionStats || { scanned: 0, flaggedAI: 0 });
    });
    return true;
  }

  if (message.type === "open-sidepanel") {
    (async () => {
      try {
        const apiUrl = await getApiUrl();
        const encoded = encodeURIComponent(JSON.stringify(message.data));
        const url = `${apiUrl}/analyze?result=${encoded}`;
        chrome.tabs.create({ url });

        await chrome.storage.local.set({ sidepanelData: message.data });
        sendResponse({ ok: true });
      } catch (err) {
        console.warn("[Baloney] Open analyze failed:", (err as Error).message);
        sendResponse({ ok: false });
      }
    })();
    return true;
  }
});

// ──────────────────────────────────────────────
// Initialize session
// ──────────────────────────────────────────────

getUserId();

chrome.storage.local.get(["sessionStats", "sessionStartTime"], (data: Record<string, unknown>) => {
  if (!data.sessionStats) {
    chrome.storage.local.set({
      sessionStats: {
        scanned: 0,
        flaggedAI: 0,
        textScanned: 0,
        textFlagged: 0,
      },
      sessionStartTime: Date.now(),
    });
  }
});

if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
}

console.log("[Baloney] Background service worker initialized (v0.5.0)");
