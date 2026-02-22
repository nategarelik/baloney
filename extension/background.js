// extension/background.js — Baloney Background Service Worker (v0.5.0)
// Handles image fetching (bypasses CORS via host_permissions), API communication,
// storage defaults, migration, and sidepanel management.

const API_URL = "https://baloney.app";
const API_TIMEOUT_MS = 8000;

// Default storage values for v2.0
const STORAGE_DEFAULTS = {
  extensionEnabled: true,
  autoScanText: false,
  autoScanImages: true,
  autoScanVideos: true,
  contentMode: "scan",
  // Sync: keep in sync with extension/content.js and frontend/src/app/allowed-sites/page.tsx
  allowedSites: [
    "x.com",
    "linkedin.com",
    "substack.com",
    "reddit.com",
    "facebook.com",
    "instagram.com",
    "medium.com",
    "tiktok.com",
    "threads.net",
  ],
  sidepanelData: null,
};

// ──────────────────────────────────────────────
// Core functions
// ──────────────────────────────────────────────

// Get or create a persistent user ID
async function getUserId() {
  const data = await chrome.storage.local.get("userId");
  if (data.userId) return data.userId;
  const userId = crypto.randomUUID();
  await chrome.storage.local.set({ userId });
  return userId;
}

// Detect platform from tab URL (v2.0: expanded coverage)
function detectPlatform(url) {
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

// Fetch image and convert to base64 (CORS-exempt via host_permissions)
async function fetchImageAsBase64(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}

// Send image to backend for detection (with timeout)
async function detectImage(base64Image, platform, sourceDomain, pageUrl) {
  const userId = await getUserId();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const pageUrlHash = pageUrl ? await hashString(pageUrl) : null;

  try {
    const response = await fetch(`${API_URL}/api/detect/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        image: base64Image,
        user_id: userId,
        platform: platform,
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

// Detect with retry — real API only, no fake fallback
async function detectWithFallback(
  base64Image,
  platform,
  sourceDomain,
  pageUrl,
) {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await detectImage(base64Image, platform, sourceDomain, pageUrl);
    } catch (error) {
      lastError = error;
      // Only retry on network/timeout errors, not 4xx
      if (error.message?.includes("API error: 4")) break;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // 1s, 2s backoff
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

// Hash a string using SHA-256 (for page_url_hash)
async function hashString(s) {
  const enc = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Extract domain from URL
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Installation & storage migration
// ──────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  // Context menus
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

  // Set defaults for any missing keys
  const existing = await chrome.storage.local.get(
    Object.keys(STORAGE_DEFAULTS),
  );
  const toSet = {};
  for (const [key, defaultValue] of Object.entries(STORAGE_DEFAULTS)) {
    if (existing[key] === undefined) {
      toSet[key] = defaultValue;
    }
  }
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  // Migrate filterMode → contentMode
  if (details.reason === "update") {
    const data = await chrome.storage.local.get(["filterMode", "contentMode"]);
    if (data.filterMode && !data.contentMode) {
      const modeMap = { label: "scan", blur: "blur", hide: "block" };
      const newMode = modeMap[data.filterMode] || "scan";
      await chrome.storage.local.set({ contentMode: newMode });
      await chrome.storage.local.remove("filterMode");
      console.log("[Baloney] Migrated filterMode →", newMode);
    }
  }

  // Auto-enable community sharing for new installs
  if (details.reason === "install") {
    getUserId().then((userId) => {
      fetch(`${API_URL}/api/sharing/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, enabled: true }),
      }).catch(() => {});
    });
  }

  // Sidepanel: don't open on action click (we use popup)
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});

// ──────────────────────────────────────────────
// Shared text analysis flow (used by context menu + keyboard shortcut)
// ──────────────────────────────────────────────

async function analyzeAndSendTextResult(tab, text) {
  const textPreview = text.slice(0, 80);

  // Show loading toast immediately
  chrome.tabs.sendMessage(tab.id, {
    type: "show-text-toast-loading",
    textPreview,
  });

  const userId = await getUserId();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    const response = await fetch(`${API_URL}/api/detect/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        text,
        user_id: userId,
        platform: detectPlatform(tab?.url),
      }),
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();

    chrome.tabs.sendMessage(tab.id, {
      type: "show-text-toast-result",
      result,
      text,
      textPreview,
    });
  } catch (err) {
    console.warn("[Baloney] Text check API unavailable:", err.message);
    chrome.tabs.sendMessage(tab.id, {
      type: "show-text-toast-error",
      errorMsg: err.message || "Analysis failed",
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
        detectPlatform(tab?.url),
        extractDomain(info.srcUrl),
        tab?.url,
      );
      chrome.tabs.sendMessage(tab.id, {
        type: "show-result",
        result,
        srcUrl: info.srcUrl,
      });
    } catch (err) {
      console.error("[Baloney] Context menu scan error:", err);
    }
  }

  if (info.menuItemId === "check-text" && info.selectionText) {
    analyzeAndSendTextResult(tab, info.selectionText);
  }
});

// ──────────────────────────────────────────────
// Keyboard shortcut (Alt+B)
// ──────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "scan-selected-text") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "get-selected-text",
    });
    if (response?.text && response.text.trim().length > 0) {
      analyzeAndSendTextResult(tab, response.text.trim());
    }
  } catch (err) {
    console.warn("[Baloney] Could not get selected text:", err.message);
  }
});

// ──────────────────────────────────────────────
// Toolbar badge (red count of AI-flagged images)
// ──────────────────────────────────────────────

chrome.storage.onChanged.addListener((changes) => {
  if (changes.sessionStats) {
    const stats = changes.sessionStats.newValue;
    const count = stats?.flaggedAI || 0;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#d4456b" });
    chrome.action.setBadgeTextColor({ color: "#ffffff" });
  }
});

// ──────────────────────────────────────────────
// Message handling
// ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "analyze-image") {
    const tabUrl = sender.tab?.url || "";
    const platform = detectPlatform(tabUrl);
    const sourceDomain = extractDomain(message.url);

    fetchImageAsBase64(message.url)
      .then((base64) =>
        detectWithFallback(base64, platform, sourceDomain, tabUrl),
      )
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error("[Baloney] Detection error:", error);
        sendResponse({ error: error.message });
      });

    return true; // Keep channel open for async response
  }

  // v2.0: Handle video frame analysis (already has base64 data URI)
  if (message.type === "analyze-video-frame") {
    const tabUrl = sender.tab?.url || "";
    const platform = detectPlatform(tabUrl);
    const base64 = message.base64 || message.url;

    detectWithFallback(base64, platform, null, tabUrl)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error("[Baloney] Video frame detection error:", error);
        sendResponse({ error: error.message });
      });

    return true;
  }

  if (message.type === "analyze-text") {
    const tabUrl = sender.tab?.url || "";
    const platform = detectPlatform(tabUrl);
    const userId = getUserId();

    userId.then(async (uid) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
        const response = await fetch(`${API_URL}/api/detect/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            text: message.text,
            user_id: uid,
            platform: platform,
          }),
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const result = await response.json();
        sendResponse(result);
      } catch (error) {
        console.warn("[Baloney] Text API unavailable:", error.message);
        sendResponse({
          verdict: "unavailable",
          confidence: 0,
          ai_probability: 0,
          model: "api-unavailable",
          error: error.message || "Detection API unreachable",
        });
      }
    });

    return true; // async
  }

  if (message.type === "get-stats") {
    chrome.storage.local.get("sessionStats", (data) => {
      sendResponse(data.sessionStats || { scanned: 0, flaggedAI: 0 });
    });
    return true;
  }

  // Open analyze page with full detection result data
  if (message.type === "open-sidepanel") {
    (async () => {
      try {
        // Always open the analyze page in a new tab with result data
        const encoded = encodeURIComponent(JSON.stringify(message.data));
        const url = `${API_URL}/analyze?result=${encoded}`;
        chrome.tabs.create({ url });

        // Also store for sidepanel in case user opens it later
        await chrome.storage.local.set({ sidepanelData: message.data });
        sendResponse({ ok: true });
      } catch (err) {
        console.warn("[Baloney] Open analyze failed:", err.message);
        sendResponse({ ok: false });
      }
    })();
    return true; // async
  }
});

// ──────────────────────────────────────────────
// Initialize session
// ──────────────────────────────────────────────

// Eagerly create userId on every service worker start so content scripts can read it
getUserId();

// Only initialize session stats if missing (avoids wiping on service worker wake)
chrome.storage.local.get(["sessionStats", "sessionStartTime"], (data) => {
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

// Ensure sidepanel doesn't auto-open on action click
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
}

console.log("[Baloney] Background service worker initialized (v0.5.0)");
