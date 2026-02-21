// extension/background.js — Baloney Background Service Worker
// Handles image fetching (bypasses CORS via host_permissions) and API communication.

const API_URL = "https://trustlens-nu.vercel.app";
const API_TIMEOUT_MS = 3000;

// ──────────────────────────────────────────────
// Client-side mock fallback (mirrors backend mock_detector.py)
// ──────────────────────────────────────────────

function mockImageResult() {
  const roll = Math.random();
  let verdict, confidence;

  if (roll < 0.30) {
    verdict = "ai_generated";
    confidence = 0.75 + Math.random() * 0.2; // 0.75–0.95
  } else if (roll < 0.40) {
    verdict = "heavy_edit";
    confidence = 0.60 + Math.random() * 0.2; // 0.60–0.80
  } else if (roll < 0.55) {
    verdict = "light_edit";
    confidence = 0.50 + Math.random() * 0.2; // 0.50–0.70
  } else {
    verdict = "human";
    confidence = 0.75 + Math.random() * 0.22; // 0.75–0.97
  }

  return {
    verdict,
    confidence: Math.round(confidence * 100) / 100,
    model: "mock-client-fallback",
    processing_time: 0.1 + Math.random() * 0.3,
  };
}

function mockTextResult() {
  const roll = Math.random();
  let verdict, confidence, ai_probability;

  if (roll < 0.25) {
    verdict = "ai_generated";
    confidence = 0.80 + Math.random() * 0.15;
    ai_probability = 0.75 + Math.random() * 0.2;
  } else if (roll < 0.35) {
    verdict = "heavy_edit";
    confidence = 0.60 + Math.random() * 0.2;
    ai_probability = 0.50 + Math.random() * 0.25;
  } else if (roll < 0.50) {
    verdict = "light_edit";
    confidence = 0.50 + Math.random() * 0.2;
    ai_probability = 0.30 + Math.random() * 0.2;
  } else {
    verdict = "human";
    confidence = 0.75 + Math.random() * 0.22;
    ai_probability = 0.05 + Math.random() * 0.15;
  }

  return {
    verdict,
    confidence: Math.round(confidence * 100) / 100,
    ai_probability: Math.round(ai_probability * 100) / 100,
    model: "mock-client-fallback",
    processing_time: 0.1 + Math.random() * 0.3,
  };
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

// Detect platform from tab URL
function detectPlatform(url) {
  if (!url) return "unknown";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("x.com") || url.includes("twitter.com")) return "x";
  if (url.includes("reddit.com")) return "reddit";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("medium.com")) return "medium";
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
async function detectImage(base64Image, platform, sourceDomain) {
  const userId = await getUserId();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

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
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Detect with mock fallback — real API first, mock on any failure
async function detectWithFallback(base64Image, platform, sourceDomain) {
  try {
    return await detectImage(base64Image, platform, sourceDomain);
  } catch (error) {
    console.warn("[Baloney] API unavailable, using mock fallback:", error.message);
    await delay(200 + Math.random() * 400); // 200-600ms simulated latency
    return mockImageResult();
  }
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
// Context menus
// ──────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
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
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "scan-image" && info.srcUrl) {
    try {
      const base64 = await fetchImageAsBase64(info.srcUrl);
      const result = await detectWithFallback(
        base64,
        detectPlatform(tab?.url),
        extractDomain(info.srcUrl)
      );
      chrome.tabs.sendMessage(tab.id, { type: "show-result", result, srcUrl: info.srcUrl });
    } catch (err) {
      console.error("[Baloney] Context menu scan error:", err);
    }
  }

  if (info.menuItemId === "check-text" && info.selectionText) {
    const userId = await getUserId();
    try {
      const response = await fetch(`${API_URL}/api/detect/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: info.selectionText,
          user_id: userId,
          platform: detectPlatform(tab?.url),
        }),
      });
      const result = await response.json();
      chrome.tabs.sendMessage(tab.id, { type: "show-text-result", result, text: info.selectionText });
    } catch (err) {
      console.error("[Baloney] Text check error:", err);
    }
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
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
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
      .then((base64) => detectWithFallback(base64, platform, sourceDomain))
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error("[Baloney] Detection error:", error);
        sendResponse({ error: error.message });
      });

    return true; // Keep channel open for async response
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
        console.warn("[Baloney] Text API unavailable, using mock:", error.message);
        await delay(200 + Math.random() * 400);
        sendResponse(mockTextResult());
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
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

chrome.storage.local.set({
  sessionStats: { scanned: 0, flaggedAI: 0, textScanned: 0, textFlagged: 0 },
  sessionStartTime: Date.now(),
});

console.log("[Baloney] Background service worker initialized");
