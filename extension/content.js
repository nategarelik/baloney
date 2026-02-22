// extension/content.js — Baloney Content Script (v0.4.0 — Dot UI + Gating + Underlines)
// Images/videos: auto-scan in viewport with discrete detection dots.
// Text: scan on user selection, inline insight popup + colored underlines.
// All scanning gated by master toggle, allowed sites, and per-type toggles.

const MIN_IMAGE_SIZE = 200;
const MAX_CONCURRENT = 3; // v2.0: increased from 2 for faster scanning
const MIN_SELECTION_LENGTH = 20;
const VIDEO_MAX_FRAMES = 5; // v2.0: multi-frame video analysis

// ──────────────────────────────────────────────
// Settings cache (populated from chrome.storage)
// ──────────────────────────────────────────────

let settings = {
  extensionEnabled: true,
  autoScanText: false,
  autoScanImages: true,
  autoScanVideos: true,
  contentMode: "scan",
  // Sync: keep in sync with extension/background.js and frontend/src/app/allowed-sites/page.tsx
  allowedSites: [
    "x.com",
    "twitter.com",
    "linkedin.com",
    "substack.com",
    "reddit.com",
    "facebook.com",
    "instagram.com",
    "medium.com",
    "tiktok.com",
    "threads.net",
    "bsky.app",
    "mastodon.social",
    "news.ycombinator.com",
  ],
};

function loadSettings() {
  chrome.storage.local.get(
    [
      "extensionEnabled",
      "autoScanText",
      "autoScanImages",
      "autoScanVideos",
      "contentMode",
      "allowedSites",
    ],
    (data) => {
      if (data.extensionEnabled !== undefined)
        settings.extensionEnabled = data.extensionEnabled;
      if (data.autoScanText !== undefined)
        settings.autoScanText = data.autoScanText;
      if (data.autoScanImages !== undefined)
        settings.autoScanImages = data.autoScanImages;
      if (data.autoScanVideos !== undefined)
        settings.autoScanVideos = data.autoScanVideos;
      if (data.contentMode !== undefined)
        settings.contentMode = data.contentMode;
      if (data.allowedSites !== undefined)
        settings.allowedSites = data.allowedSites;
    },
  );
}

loadSettings();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.extensionEnabled)
    settings.extensionEnabled = changes.extensionEnabled.newValue;
  if (changes.autoScanText) {
    settings.autoScanText = changes.autoScanText.newValue;
    if (canAutoScanText()) startTextAutoScan();
    else stopTextAutoScan();
  }
  if (changes.autoScanImages)
    settings.autoScanImages = changes.autoScanImages.newValue;
  if (changes.autoScanVideos)
    settings.autoScanVideos = changes.autoScanVideos.newValue;
  if (changes.contentMode) {
    settings.contentMode = changes.contentMode.newValue;
    reapplyContentMode();
  }
  if (changes.allowedSites)
    settings.allowedSites = changes.allowedSites.newValue;
});

// ──────────────────────────────────────────────
// Gating checks
// ──────────────────────────────────────────────

function isEnabled() {
  return settings.extensionEnabled === true;
}

function isSiteAllowed() {
  const hostname = window.location.hostname;
  return settings.allowedSites.some(
    (site) => hostname === site || hostname.endsWith("." + site),
  );
}

function canScanImages() {
  return isEnabled() && isSiteAllowed() && settings.autoScanImages;
}

function canScanVideos() {
  return isEnabled() && isSiteAllowed() && settings.autoScanVideos;
}

function canAutoScanText() {
  return isEnabled() && isSiteAllowed() && settings.autoScanText;
}

// Selection-based text scanning always works (if extension enabled + site allowed)
function canManualScanText() {
  return isEnabled() && isSiteAllowed();
}

// ──────────────────────────────────────────────
// Image filtering
// ──────────────────────────────────────────────

function isTargetImage(img) {
  const src = img.src || img.currentSrc || "";
  if (!src || src.startsWith("data:")) return false;
  if (img.naturalWidth < MIN_IMAGE_SIZE || img.naturalHeight < MIN_IMAGE_SIZE)
    return false;
  if (
    src.includes("/icon") ||
    src.includes("/logo") ||
    src.includes("/avatar") ||
    src.includes("/emoji")
  )
    return false;
  return true;
}

// ──────────────────────────────────────────────
// Request queue (max concurrent API calls)
// ──────────────────────────────────────────────

class RequestQueue {
  constructor(maxConcurrent) {
    this.max = maxConcurrent;
    this.active = 0;
    this.queue = [];
  }

  async add(fn) {
    if (this.active >= this.max) {
      await new Promise((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      if (this.queue.length > 0) {
        this.queue.shift()();
      }
    }
  }
}

const requestQueue = new RequestQueue(MAX_CONCURRENT);

// ──────────────────────────────────────────────
// Session tracking
// ──────────────────────────────────────────────

let sessionStats = { scanned: 0, flaggedAI: 0, textScanned: 0, textFlagged: 0 };

// Load persisted session stats on init
chrome.storage.local.get("sessionStats", (data) => {
  if (data.sessionStats) {
    sessionStats = { ...sessionStats, ...data.sessionStats };
  }
});

function updateStats(verdict) {
  sessionStats.scanned++;
  if (verdict === "ai_generated" || verdict === "heavy_edit")
    sessionStats.flaggedAI++;
  chrome.storage.local.set({ sessionStats });
}

function updateTextStats(verdict) {
  sessionStats.textScanned++;
  if (verdict === "ai_generated" || verdict === "heavy_edit")
    sessionStats.textFlagged++;
  chrome.storage.local.set({ sessionStats });
}

// Per-page stats
const pageHostname = window.location.hostname;

function updatePageStats(type, verdict) {
  chrome.storage.local.get("pageStats", (data) => {
    const pageStats = data.pageStats || {};
    if (!pageStats[pageHostname]) {
      pageStats[pageHostname] = {
        images: 0,
        text: 0,
        flagged: 0,
        lastScan: Date.now(),
      };
    }
    pageStats[pageHostname][type]++;
    if (verdict === "ai_generated" || verdict === "heavy_edit") {
      pageStats[pageHostname].flagged++;
    }
    pageStats[pageHostname].lastScan = Date.now();
    chrome.storage.local.set({ pageStats });
  });
}

// ──────────────────────────────────────────────
// Verdict helpers
// ──────────────────────────────────────────────

const VERDICT_COLORS = {
  ai_generated: "#d4456b",
  heavy_edit: "#f97316",
  light_edit: "#f59e0b",
  human: "#16a34a",
};

const VERDICT_LABELS = {
  ai_generated: "AI Generated",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human Written",
};

// ──────────────────────────────────────────────
// Reasoning — plain-English WHY explanations
// ──────────────────────────────────────────────

function getTextReasons(result) {
  const reasons = [];
  const fv = result.feature_vector;
  if (!fv) return reasons;

  if (fv.burstiness !== undefined) {
    if (fv.burstiness < 0.2)
      reasons.push("Sentence lengths are very uniform, typical of AI writing");
    else if (fv.burstiness > 0.5)
      reasons.push("Varied sentence rhythm suggests human writing style");
  }
  if (fv.type_token_ratio !== undefined) {
    if (fv.type_token_ratio < 0.4)
      reasons.push("Vocabulary is repetitive, a common AI pattern");
    else if (fv.type_token_ratio > 0.7)
      reasons.push("Rich vocabulary diversity indicates human authorship");
  }
  if (fv.perplexity !== undefined) {
    if (fv.perplexity < 80)
      reasons.push("Text is highly predictable, consistent with AI generation");
    else if (fv.perplexity > 150)
      reasons.push("Unpredictable word choices suggest human creativity");
  }
  if (fv.repetition_score !== undefined) {
    if (fv.repetition_score > 0.6)
      reasons.push("High phrase repetition detected");
  }
  return reasons;
}

function getImageReasons(result) {
  const reasons = [];
  if (result.primary_score !== undefined) {
    if (result.primary_score > 0.7)
      reasons.push("Visual patterns strongly match AI generation signatures");
    else if (result.primary_score < 0.3)
      reasons.push("Visual patterns consistent with authentic photography");
  }
  if (result.secondary_score !== undefined) {
    if (result.secondary_score > 0.6)
      reasons.push("Frequency analysis shows unusually smooth gradients");
    else if (result.secondary_score < 0.3)
      reasons.push("Natural noise patterns detected in image data");
  }
  if (result.edit_magnitude !== undefined) {
    if (result.edit_magnitude > 0.7)
      reasons.push("Significant digital manipulation detected");
  }
  if (result.trust_score !== undefined) {
    if (result.trust_score > 0.75) reasons.push("High authenticity confidence");
  }
  return reasons;
}

// ──────────────────────────────────────────────
// Insight HTML builder (shared by popup + tooltip)
// ──────────────────────────────────────────────

function buildInsightHTML(result, type) {
  const color = VERDICT_COLORS[result.verdict] || "#4a3728";
  const label = VERDICT_LABELS[result.verdict] || result.verdict;
  const confidence = Math.round((result.confidence || 0) * 100);

  let html = `
    <div class="baloney-insight__header">
      <div class="baloney-insight__dot" style="background:${color}"></div>
      <span>${label}</span>
      <span class="baloney-insight__confidence">${confidence}%</span>
    </div>
  `;

  if (result.caveat) {
    const safeCaveat = result.caveat
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    html += `<div class="baloney-insight__caveat">${safeCaveat}</div>`;
  }

  const reasons =
    type === "text" ? getTextReasons(result) : getImageReasons(result);
  if (reasons.length > 0) {
    html += `<div class="baloney-insight__reasons">`;
    reasons.forEach((r) => {
      html += `<div class="baloney-insight__reason">\u2022 ${r}</div>`;
    });
    html += `</div>`;
  }

  if (result.sentence_scores && result.sentence_scores.length > 0) {
    html += `<div class="baloney-insight__sentences">`;
    result.sentence_scores.slice(0, 5).forEach((s) => {
      const pct = Math.round(s.ai_probability * 100);
      const barColor =
        s.ai_probability > 0.6
          ? "#d4456b"
          : s.ai_probability > 0.4
            ? "#f59e0b"
            : "#16a34a";
      const safeText = s.text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
      const preview =
        safeText.length > 40 ? safeText.slice(0, 40) + "\u2026" : safeText;
      html += `
        <div class="baloney-insight__sentence">
          <div class="baloney-insight__sentence-bar">
            <div class="baloney-insight__sentence-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <span class="baloney-insight__sentence-text" title="${safeText}">${preview}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  const model = (result.model_used || result.model || "unknown").replace(
    /</g,
    "&lt;",
  );
  html += `<div class="baloney-insight__model">Model: ${model}</div>`;

  const resultData = JSON.stringify({
    result,
    type,
    sourceUrl: result.sourceUrl,
    sourcePageUrl: result.sourcePageUrl,
  });
  const analyzeUrl = `https://trustlens-nu.vercel.app/analyze?result=${encodeURIComponent(resultData)}`;
  html += `<a href="${analyzeUrl}" target="_blank" class="baloney-insight__fulldata">View Full Data \u2192</a>`;

  return html;
}

// ──────────────────────────────────────────────
// Detection Dot UI (replaces hover borders)
// ──────────────────────────────────────────────

function getDotColor(confidence) {
  if (confidence >= 0.8) return "#d4456b"; // red/pink — high confidence AI
  if (confidence >= 0.7) return "#f97316"; // orange
  return "#f59e0b"; // amber — lower confidence
}

function getDotOpacity(confidence) {
  // Never 100% opacity — max ~0.85
  return Math.min(0.55 + confidence * 0.3, 0.85);
}

function createDetectionDot(el, result) {
  // Only show dot when confidence >= 0.5 (always show for ai_generated regardless)
  if (result.confidence < 0.5 && result.verdict !== "ai_generated") return null;

  const confidence = result.confidence || 0;
  const pct = Math.round(confidence * 100);
  const color = VERDICT_COLORS[result.verdict] || getDotColor(confidence);
  const opacity = getDotOpacity(confidence);

  // Ensure parent is positioned
  const parent = el.parentElement;
  if (parent) {
    const pos = window.getComputedStyle(parent).position;
    if (pos === "static") parent.style.position = "relative";
  }

  const dot = document.createElement("div");
  dot.className = "baloney-dot";
  dot.style.background = color;
  dot.style.opacity = opacity;

  const labelSpan = document.createElement("span");
  labelSpan.className = "baloney-dot__label";
  labelSpan.textContent = `${pct}% AI`;
  labelSpan.style.color = "#fff";
  dot.appendChild(labelSpan);

  // Click → open sidepanel with full analysis
  dot.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const type = result.feature_vector
      ? "text"
      : result.frames_analyzed
        ? "video"
        : "image";
    openSidepanel(result, type);
  });

  if (parent) {
    parent.appendChild(dot);
  }

  return dot;
}

function openSidepanel(result, type) {
  chrome.runtime.sendMessage({
    type: "open-sidepanel",
    data: {
      result,
      type,
      sourceUrl: result.sourceUrl,
      sourcePageUrl: result.sourcePageUrl,
    },
  });
}

// ──────────────────────────────────────────────
// Content mode helpers (scan / blur / block)
// ──────────────────────────────────────────────

function shouldFilter(verdict) {
  return verdict === "ai_generated" || verdict === "heavy_edit";
}

function applyContentMode(targetEl, verdict) {
  if (!shouldFilter(verdict)) return;

  removeContentMode(targetEl);

  if (settings.contentMode === "blur") {
    targetEl.classList.add("baloney-filtered");

    const parent = targetEl.parentElement;
    if (parent) {
      const parentPos = window.getComputedStyle(parent).position;
      if (parentPos === "static") parent.style.position = "relative";

      const overlay = document.createElement("div");
      overlay.className = "baloney-blur-reveal";
      overlay.textContent = "AI Content \u2014 Click to Reveal";
      overlay.dataset.baloneyReveal = "true";
      overlay.addEventListener("click", () => {
        targetEl.classList.add("baloney-revealed");
        overlay.remove();
      });
      parent.appendChild(overlay);
    }
  } else if (settings.contentMode === "block") {
    const container =
      targetEl.closest("article, [role='article'], .post, .tweet") || targetEl;
    container.classList.add("baloney-hidden");
    container.dataset.baloneyHiddenBy = "filter";
  }
}

function removeContentMode(targetEl) {
  targetEl.classList.remove("baloney-filtered", "baloney-revealed");

  const parent = targetEl.parentElement;
  if (parent) {
    const overlay = parent.querySelector("[data-baloney-reveal]");
    if (overlay) overlay.remove();
  }

  const container = targetEl.closest("[data-baloney-hidden-by='filter']");
  if (container) {
    container.classList.remove("baloney-hidden");
    delete container.dataset.baloneyHiddenBy;
  }
}

function reapplyContentMode() {
  document
    .querySelectorAll("img[data-baloney-scanned], video[data-baloney-scanned]")
    .forEach((el) => {
      const verdict = el.dataset.baloneyScanned;
      if (!verdict || verdict === "pending" || verdict === "error") return;

      removeContentMode(el);
      applyContentMode(el, verdict);
    });
}

// ──────────────────────────────────────────────
// Floating page indicator
// ──────────────────────────────────────────────

let flaggedItems = [];
let pageIndicator = null;
let pagePanel = null;
let loadingIndicator = null;
let hasFirstDetection = false;

function createLoadingIndicator() {
  if (loadingIndicator) return;

  loadingIndicator = document.createElement("div");
  loadingIndicator.className = "baloney-loading-indicator";

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.className = "baloney-loading-dot";
    loadingIndicator.appendChild(dot);
  }

  document.body.appendChild(loadingIndicator);
}

function transitionToCounter() {
  if (hasFirstDetection) return;
  hasFirstDetection = true;

  if (loadingIndicator) {
    loadingIndicator.classList.add("baloney-loading-indicator--hidden");
    loadingIndicator.addEventListener(
      "transitionend",
      () => {
        loadingIndicator.remove();
        loadingIndicator = null;
      },
      { once: true },
    );
  }

  ensurePageIndicator();
  pageIndicator.classList.add("baloney-page-indicator--fade-in");
}

function ensurePageIndicator() {
  if (pageIndicator) return;

  pageIndicator = document.createElement("div");
  pageIndicator.className =
    "baloney-page-indicator baloney-page-indicator--clean";
  pageIndicator.textContent = "0";
  pageIndicator.addEventListener("click", togglePagePanel);
  document.body.appendChild(pageIndicator);

  pagePanel = document.createElement("div");
  pagePanel.className = "baloney-page-panel";
  document.body.appendChild(pagePanel);
}

function updatePageIndicator() {
  ensurePageIndicator();
  const count = flaggedItems.length;
  pageIndicator.textContent = String(count);

  pageIndicator.classList.remove(
    "baloney-page-indicator--clean",
    "baloney-page-indicator--warn",
    "baloney-page-indicator--alert",
  );
  if (count === 0) pageIndicator.classList.add("baloney-page-indicator--clean");
  else if (count <= 3)
    pageIndicator.classList.add("baloney-page-indicator--warn");
  else pageIndicator.classList.add("baloney-page-indicator--alert");

  pagePanel.innerHTML = "";

  const title = document.createElement("div");
  title.className = "baloney-page-panel__title";
  title.textContent = `Flagged Items (${count})`;
  pagePanel.appendChild(title);

  flaggedItems.forEach((item) => {
    const el = document.createElement("div");
    el.className = "baloney-page-panel__item";

    const dot = document.createElement("div");
    dot.className = "baloney-page-panel__item-dot";
    dot.style.background = VERDICT_COLORS[item.verdict] || "#4a3728";

    const text = document.createElement("span");
    text.className = "baloney-page-panel__item-text";
    text.textContent = item.preview;

    el.appendChild(dot);
    el.appendChild(text);
    el.addEventListener("click", () => {
      item.element.scrollIntoView({ behavior: "smooth", block: "center" });
      pagePanel.classList.remove("open");
    });
    pagePanel.appendChild(el);
  });
}

function togglePagePanel() {
  if (pagePanel) pagePanel.classList.toggle("open");
}

function addFlaggedItem(element, verdict, preview) {
  transitionToCounter();
  if (verdict === "ai_generated" || verdict === "heavy_edit") {
    flaggedItems.push({ element, verdict, preview });
    updatePageIndicator();
  }
}

// ──────────────────────────────────────────────
// Image analysis pipeline
// ──────────────────────────────────────────────

async function analyzeImage(img) {
  if (!canScanImages()) return;
  if (img.dataset.baloneyScanned) return;
  img.dataset.baloneyScanned = "pending";

  try {
    const result = await requestQueue.add(async () => {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "analyze-image", url: img.src || img.currentSrc },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          },
        );
      });
      return response;
    });

    if (result && result.verdict) {
      result.sourceUrl = img.src || img.currentSrc;
      result.sourcePageUrl = window.location.href;
      img.dataset.baloneyScanned = result.verdict;
      img.dataset.baloneyResult = JSON.stringify(result);
      createDetectionDot(img, result);
      addFlaggedItem(
        img,
        result.verdict,
        "Image: " + (img.alt || img.src?.slice(0, 40) || "unknown"),
      );
      applyContentMode(img, result.verdict);
      updateStats(result.verdict);
      updatePageStats("images", result.verdict);
    }
  } catch (error) {
    console.error("[Baloney] Image analysis failed:", error);
    img.dataset.baloneyScanned = "error";
  }
}

// ──────────────────────────────────────────────
// Video analysis pipeline (v2.0 — multi-frame analysis)
// Captures multiple frames at different timestamps,
// sends them all for analysis, and combines results
// ──────────────────────────────────────────────

function captureVideoFrame(video, seekTime) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || video.clientWidth || 320;
    canvas.height = video.videoHeight || video.clientHeight || 240;

    const onSeeked = () => {
      try {
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(null);
      }
      video.removeEventListener("seeked", onSeeked);
    };

    if (video.readyState >= 2 && Math.abs(video.currentTime - seekTime) < 0.5) {
      // Already at desired time
      try {
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(null);
      }
    } else {
      video.addEventListener("seeked", onSeeked);
      // Timeout in case seeking fails
      setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve(null);
      }, 3000);
      video.currentTime = seekTime;
    }
  });
}

async function analyzeVideo(video) {
  if (!canScanVideos()) return;
  if (video.dataset.baloneyScanned) return;
  video.dataset.baloneyScanned = "pending";

  try {
    const frameUrls = [];

    // v2.0: Multi-frame extraction strategy
    if (video.poster) {
      frameUrls.push(video.poster);
    }

    // Try to capture frames at different timestamps
    if (
      video.readyState >= 2 &&
      video.duration > 0 &&
      isFinite(video.duration)
    ) {
      const savedTime = video.currentTime;
      const numFrames = Math.min(
        VIDEO_MAX_FRAMES,
        Math.ceil(video.duration / 2),
      );
      const interval = video.duration / (numFrames + 1);

      for (let i = 1; i <= numFrames; i++) {
        const seekTime = interval * i;
        const frameUrl = await captureVideoFrame(video, seekTime);
        if (frameUrl) frameUrls.push(frameUrl);
      }

      // Restore original playback position
      try {
        video.currentTime = savedTime;
      } catch {
        /* ignore */
      }
    } else if (frameUrls.length === 0) {
      // Fallback: capture current frame
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || video.clientWidth || 320;
        canvas.height = video.videoHeight || video.clientHeight || 240;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frameUrls.push(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        video.dataset.baloneyScanned = "error";
        return;
      }
    }

    if (frameUrls.length === 0) {
      video.dataset.baloneyScanned = "error";
      return;
    }

    // v2.0: Analyze multiple frames and aggregate results
    const frameResults = [];
    for (const frameUrl of frameUrls.slice(0, VIDEO_MAX_FRAMES)) {
      try {
        const result = await requestQueue.add(async () => {
          const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              {
                type: frameUrl.startsWith("data:")
                  ? "analyze-video-frame"
                  : "analyze-image",
                url: frameUrl,
                base64: frameUrl.startsWith("data:") ? frameUrl : undefined,
              },
              (response) => {
                if (chrome.runtime.lastError)
                  reject(new Error(chrome.runtime.lastError.message));
                else resolve(response);
              },
            );
          });
          return response;
        });
        if (result && result.verdict) frameResults.push(result);
      } catch {
        // Skip failed frames
      }
    }

    if (frameResults.length === 0) {
      video.dataset.baloneyScanned = "error";
      return;
    }

    // v2.0: Aggregate multi-frame results
    const confidences = frameResults.map((r) => r.confidence || 0);
    const avgConfidence =
      confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const aiCount = frameResults.filter(
      (r) => r.verdict === "ai_generated" || r.verdict === "heavy_edit",
    ).length;
    const aiRatio = aiCount / frameResults.length;

    // Determine video-level verdict from frame consensus
    let aggregatedResult;
    if (aiRatio > 0.5 || avgConfidence > 0.65) {
      aggregatedResult = {
        ...frameResults[0],
        verdict: "ai_generated",
        confidence: Math.max(avgConfidence, 0.7),
        model_used: `multi-frame(${frameResults.length}):${frameResults[0].model_used}`,
        frames_analyzed: frameResults.length,
        frames_flagged: aiCount,
      };
    } else if (aiRatio > 0.2 || avgConfidence > 0.45) {
      aggregatedResult = {
        ...frameResults[0],
        verdict: "heavy_edit",
        confidence: avgConfidence,
        model_used: `multi-frame(${frameResults.length}):${frameResults[0].model_used}`,
        frames_analyzed: frameResults.length,
        frames_flagged: aiCount,
      };
    } else {
      // Use the single most confident frame result
      const bestResult = frameResults.reduce((best, r) =>
        (r.confidence || 0) > (best.confidence || 0) ? r : best,
      );
      aggregatedResult = {
        ...bestResult,
        model_used: `multi-frame(${frameResults.length}):${bestResult.model_used}`,
        frames_analyzed: frameResults.length,
        frames_flagged: aiCount,
      };
    }

    aggregatedResult.sourceUrl = video.poster || video.src;
    aggregatedResult.sourcePageUrl = window.location.href;
    video.dataset.baloneyScanned = aggregatedResult.verdict;
    video.dataset.baloneyResult = JSON.stringify(aggregatedResult);
    createDetectionDot(video, aggregatedResult);
    addFlaggedItem(
      video,
      aggregatedResult.verdict,
      `Video (${frameResults.length} frames): ${video.title || video.src?.slice(0, 30) || "video"}`,
    );
    applyContentMode(video, aggregatedResult.verdict);
    updateStats(aggregatedResult.verdict);
    updatePageStats("images", aggregatedResult.verdict);
  } catch (error) {
    console.error("[Baloney] Video analysis failed:", error);
    video.dataset.baloneyScanned = "error";
  }
}

// (Text selection popup + underlines removed in v0.5.0 — replaced by toast card system)

// ──────────────────────────────────────────────
// Auto-scan text nodes
// ──────────────────────────────────────────────

// v2.0: Expanded selectors to cover more platforms
const TEXT_SELECTORS =
  "p, article, [role='article'], .tweet-text, .feed-shared-update-v2__description, " +
  "[data-testid='tweetText'], .post-content, .entry-content, .article-body, " +
  // Reddit
  "[data-testid='post-content'], .md, [slot='text-body'], " +
  // Medium
  ".pw-post-body-paragraph, .graf, " +
  // Facebook
  "[data-ad-comet-preview='message'], [data-ad-preview='message'], " +
  // LinkedIn
  ".feed-shared-text, .update-components-text, " +
  // Substack
  ".body.markup, .post-content-final, " +
  // General news sites
  ".story-body, .article-text, .post-body, [itemprop='articleBody']";

let textObserver = null;

function autoScanTextNodes(elements) {
  const toScan = [];

  elements.forEach((el) => {
    if (el.dataset.baloneyTextScanned) return;
    const text = (el.innerText || "").trim();
    if (text.length < 100) return;

    el.dataset.baloneyTextScanned = "1";
    toScan.push(el);
  });

  toScan.forEach((el) => {
    const text = (el.innerText || "").trim().slice(0, 2000);

    requestQueue.add(async () => {
      try {
        const result = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: "analyze-text", text },
            (response) => {
              if (chrome.runtime.lastError)
                reject(new Error(chrome.runtime.lastError.message));
              else resolve(response);
            },
          );
        });

        if (result && result.verdict) {
          createDetectionDot(el, result);
          addFlaggedItem(
            el,
            result.verdict,
            "Text: " + text.slice(0, 40) + "\u2026",
          );
          updateTextStats(result.verdict);
          updatePageStats("text", result.verdict);
        }
      } catch (error) {
        console.error("[Baloney] Auto text scan failed:", error);
      }
    });
  });
}

function startTextAutoScan() {
  if (textObserver) return;

  textObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target);
      if (visible.length > 0) {
        autoScanTextNodes(visible);
        visible.forEach((el) => textObserver.unobserve(el));
      }
    },
    { threshold: 0.3 },
  );

  // Observe existing text elements
  document.querySelectorAll(TEXT_SELECTORS).forEach((el) => {
    if (!el.dataset.baloneyTextScanned) textObserver.observe(el);
  });
}

function stopTextAutoScan() {
  if (textObserver) {
    textObserver.disconnect();
    textObserver = null;
  }
}

// ──────────────────────────────────────────────
// Viewport observer (images + videos)
// ──────────────────────────────────────────────

const viewportObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const el = entry.target;

        if (el.tagName === "IMG") {
          if (isTargetImage(el) && !el.dataset.baloneyScanned) {
            analyzeImage(el);
          }
        } else if (el.tagName === "VIDEO") {
          const w = el.videoWidth || el.clientWidth;
          if (w > 200 && !el.dataset.baloneyScanned) {
            analyzeVideo(el);
          }
        }

        viewportObserver.unobserve(el);
      }
    }
  },
  { threshold: 0.5 },
);

// ──────────────────────────────────────────────
// DOM observer (watch for new images/videos)
// ──────────────────────────────────────────────

const domObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      if (node.tagName === "IMG") viewportObserver.observe(node);
      if (node.tagName === "VIDEO") viewportObserver.observe(node);

      if (node.querySelectorAll) {
        node
          .querySelectorAll("img")
          .forEach((img) => viewportObserver.observe(img));
        node
          .querySelectorAll("video")
          .forEach((vid) => viewportObserver.observe(vid));

        // Auto-scan new text elements if enabled
        if (textObserver) {
          node.querySelectorAll(TEXT_SELECTORS).forEach((el) => {
            if (!el.dataset.baloneyTextScanned) textObserver.observe(el);
          });
        }
      }
    }
  }
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

function init() {
  if (!isEnabled()) {
    console.log("[Baloney] Extension is disabled");
    return;
  }

  if (!isSiteAllowed()) {
    console.log("[Baloney] Site not in allowed list:", pageHostname);
    return;
  }

  console.log(
    "[Baloney] Content script loaded (v0.4.0 \u2014 dot UI + gating)",
  );

  // Observe future DOM changes
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Scan existing images
  document.querySelectorAll("img").forEach((img) => {
    viewportObserver.observe(img);
  });

  // Scan existing videos
  document.querySelectorAll("video").forEach((vid) => {
    viewportObserver.observe(vid);
  });

  // Start auto-scan text if enabled
  if (canAutoScanText()) {
    startTextAutoScan();
  }

  ensurePageIndicator();
}

// ──────────────────────────────────────────────
// Toast Card System (v0.5.0 — replaces selection popup + inline underlines)
// ──────────────────────────────────────────────

let activeToastCard = null;
let toastAutoDismissTimer = null;
let toastLastText = null;

function getToastBottom() {
  return pageIndicator ? 72 : 24;
}

function dismissTextToast(animate = true) {
  if (toastAutoDismissTimer) {
    clearTimeout(toastAutoDismissTimer);
    toastAutoDismissTimer = null;
  }
  if (!activeToastCard) return;

  if (animate) {
    activeToastCard.style.animation = "baloney-card-out 0.2s ease forwards";
    const card = activeToastCard;
    setTimeout(() => card?.remove(), 200);
  } else {
    activeToastCard.remove();
  }
  activeToastCard = null;
}

function createToastCardShell() {
  dismissTextToast(false);

  const card = document.createElement("div");
  card.className = "baloney-toast-card";
  card.id = "baloney-toast-card";
  card.style.bottom = `${getToastBottom()}px`;

  card.addEventListener("mouseenter", () => {
    if (toastAutoDismissTimer) {
      clearTimeout(toastAutoDismissTimer);
      toastAutoDismissTimer = null;
    }
  });
  card.addEventListener("mouseleave", () => {
    startAutoDismiss(3000);
  });

  document.body.appendChild(card);
  activeToastCard = card;
  return card;
}

function startAutoDismiss(ms = 12000) {
  if (toastAutoDismissTimer) clearTimeout(toastAutoDismissTimer);
  toastAutoDismissTimer = setTimeout(() => dismissTextToast(true), ms);
}

function showTextToastLoading(textPreview) {
  const card = createToastCardShell();
  card.dataset.state = "loading";

  const preview = (textPreview || "").slice(0, 80);
  const previewSuffix = (textPreview || "").length > 80 ? "\u2026" : "";

  card.innerHTML = `
    <div class="baloney-toast-card__header">
      <span class="baloney-toast-card__icon">\uD83D\uDC37</span>
      <span class="baloney-toast-card__title">Baloney Text Check</span>
    </div>
    <div class="baloney-toast-card__loading">
      <div class="baloney-scan-spinner"></div>
      <span>Sniffing for AI\u2026</span>
    </div>
    ${preview ? `<div class="baloney-toast-card__preview">\u201C${preview.replace(/</g, "&lt;").replace(/>/g, "&gt;")}${previewSuffix}\u201D</div>` : ""}
    <div class="baloney-toast-card__skeleton">
      <div class="baloney-toast-card__skeleton-bar" style="width:70%"></div>
      <div class="baloney-toast-card__skeleton-bar" style="width:100%"></div>
      <div class="baloney-toast-card__skeleton-bar" style="width:45%"></div>
    </div>
  `;
}

function showTextToastResult(result, textPreview) {
  if (!result || !result.verdict) {
    showTextToastError("No result returned");
    return;
  }

  const card = activeToastCard || createToastCardShell();
  card.dataset.state = "result";

  const color = VERDICT_COLORS[result.verdict] || "#4a3728";
  const label = VERDICT_LABELS[result.verdict] || result.verdict;
  const confidence = Math.round((result.confidence || 0) * 100);
  const reasons = getTextReasons(result).slice(0, 2);

  // Sentence breakdown
  let sentencesHTML = "";
  const sentences = result.sentence_scores || [];
  const visibleSentences = sentences.slice(0, 3);
  const hiddenCount = Math.max(0, sentences.length - 3);

  if (visibleSentences.length > 0) {
    sentencesHTML = `<div class="baloney-toast-card__sentences">`;
    visibleSentences.forEach((s, i) => {
      const pct = Math.round(s.ai_probability * 100);
      const barColor =
        s.ai_probability > 0.6
          ? "#d4456b"
          : s.ai_probability > 0.4
            ? "#f59e0b"
            : "#16a34a";
      const safeText = s.text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
      const sPreview =
        safeText.length > 50 ? safeText.slice(0, 50) + "\u2026" : safeText;
      sentencesHTML += `
        <div class="baloney-toast-card__sentence" style="animation-delay:${i * 80}ms">
          <div class="baloney-toast-card__sentence-bar">
            <div class="baloney-toast-card__sentence-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <span class="baloney-toast-card__sentence-pct">${pct}%</span>
          <span class="baloney-toast-card__sentence-text" title="${safeText}">${sPreview}</span>
        </div>
      `;
    });
    if (hiddenCount > 0) {
      sentencesHTML += `<div class="baloney-toast-card__more" id="baloney-toast-more">+${hiddenCount} more</div>`;
    }
    sentencesHTML += `</div>`;
  }

  // Caveat
  let caveatHTML = "";
  if (result.caveat) {
    const safeCaveat = result.caveat
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    caveatHTML = `<div class="baloney-toast-card__caveat">${safeCaveat}</div>`;
  }

  // Footer
  const model = (result.model_used || result.model || "unknown").replace(
    /</g,
    "&lt;",
  );
  const resultData = JSON.stringify({ result, type: "text" });
  const analyzeUrl = `https://trustlens-nu.vercel.app/analyze?result=${encodeURIComponent(resultData)}`;

  card.style.borderLeftColor = color;

  card.innerHTML = `
    <div class="baloney-toast-card__header">
      <span class="baloney-toast-card__icon">\uD83D\uDC37</span>
      <span class="baloney-toast-card__title">Baloney Text Check</span>
      <button class="baloney-toast-card__close" id="baloney-toast-close">\u00D7</button>
    </div>
    <div class="baloney-toast-card__verdict" id="baloney-toast-verdict">
      <div class="baloney-toast-card__verdict-dot" style="background:${color}"></div>
      <span class="baloney-toast-card__verdict-label">${label}</span>
      <span class="baloney-toast-card__verdict-pct">${confidence}%</span>
    </div>
    <div class="baloney-toast-card__bar">
      <div class="baloney-toast-card__bar-fill" style="background:${color}" id="baloney-toast-bar-fill"></div>
    </div>
    ${reasons.length > 0 ? `<div class="baloney-toast-card__reasons">${reasons.map((r) => `<div class="baloney-toast-card__reason">\u2022 ${r}</div>`).join("")}</div>` : ""}
    ${sentencesHTML}
    ${caveatHTML}
    <div class="baloney-toast-card__footer">
      <span class="baloney-toast-card__model">${model}</span>
      <a href="${analyzeUrl}" target="_blank" class="baloney-toast-card__link">View Full Data \u2192</a>
    </div>
  `;

  // Animate confidence bar fill
  requestAnimationFrame(() => {
    const barFill = document.getElementById("baloney-toast-bar-fill");
    if (barFill) {
      requestAnimationFrame(() => {
        barFill.style.width = `${confidence}%`;
      });
    }
  });

  // Expand hidden sentences
  const moreBtn = document.getElementById("baloney-toast-more");
  if (moreBtn && hiddenCount > 0) {
    moreBtn.addEventListener("click", () => {
      const container = moreBtn.parentElement;
      sentences.slice(3).forEach((s, i) => {
        const pct = Math.round(s.ai_probability * 100);
        const barColor =
          s.ai_probability > 0.6
            ? "#d4456b"
            : s.ai_probability > 0.4
              ? "#f59e0b"
              : "#16a34a";
        const safeText = s.text
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
        const sPreview =
          safeText.length > 50 ? safeText.slice(0, 50) + "\u2026" : safeText;
        const el = document.createElement("div");
        el.className = "baloney-toast-card__sentence";
        el.style.animationDelay = `${(i + 3) * 80}ms`;
        el.innerHTML = `
          <div class="baloney-toast-card__sentence-bar">
            <div class="baloney-toast-card__sentence-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <span class="baloney-toast-card__sentence-pct">${pct}%</span>
          <span class="baloney-toast-card__sentence-text" title="${safeText}">${sPreview}</span>
        `;
        container.insertBefore(el, moreBtn);
      });
      moreBtn.remove();
    });
  }

  // Close button
  const closeBtn = document.getElementById("baloney-toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissTextToast(true);
    });
  }

  // Click verdict → open sidepanel
  const verdictEl = document.getElementById("baloney-toast-verdict");
  if (verdictEl) {
    verdictEl.style.cursor = "pointer";
    verdictEl.addEventListener("click", () => openSidepanel(result, "text"));
  }

  // Escape to dismiss
  const escHandler = (e) => {
    if (e.key === "Escape") {
      dismissTextToast(true);
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  // Stats
  updateTextStats(result.verdict);
  updatePageStats("text", result.verdict);

  // Page indicator
  const textSnippet = (textPreview || "").slice(0, 40);
  addFlaggedItem(
    document.body,
    result.verdict,
    "Text: " + textSnippet + "\u2026",
  );

  startAutoDismiss(12000);
}

function showTextToastError(errorMsg) {
  const card = activeToastCard || createToastCardShell();
  card.dataset.state = "error";
  card.style.borderLeftColor = "#d4456b";

  card.innerHTML = `
    <div class="baloney-toast-card__header">
      <span class="baloney-toast-card__icon">\uD83D\uDC37</span>
      <span class="baloney-toast-card__title">Baloney Text Check</span>
      <button class="baloney-toast-card__close" id="baloney-toast-close">\u00D7</button>
    </div>
    <div class="baloney-toast-card__error">
      <div class="baloney-toast-card__error-msg">Analysis failed</div>
      <button class="baloney-toast-card__retry" id="baloney-toast-retry">Try Again</button>
    </div>
  `;

  const closeBtn = document.getElementById("baloney-toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissTextToast(true);
    });
  }

  const retryBtn = document.getElementById("baloney-toast-retry");
  if (retryBtn && toastLastText) {
    retryBtn.addEventListener("click", () => {
      showTextToastLoading(toastLastText.slice(0, 80));
      chrome.runtime.sendMessage(
        { type: "analyze-text", text: toastLastText.slice(0, 2000) },
        (response) => {
          if (response && response.verdict) {
            showTextToastResult(response, toastLastText);
          } else {
            showTextToastError("Still unavailable");
          }
        },
      );
    });
  }

  startAutoDismiss(12000);
}

function showTextToastMinLength() {
  const card = createToastCardShell();
  card.dataset.state = "min-length";

  card.innerHTML = `
    <div class="baloney-toast-card__header">
      <span class="baloney-toast-card__icon">\uD83D\uDC37</span>
      <span class="baloney-toast-card__title">Baloney Text Check</span>
    </div>
    <div class="baloney-toast-card__min-length">Select at least 20 characters to analyze.</div>
  `;

  startAutoDismiss(4000);
}

// ──────────────────────────────────────────────
// Context menu result toasts (image scan — kept)
// ──────────────────────────────────────────────

function showToast(lines, verdict) {
  const existing = document.getElementById("baloney-toast");
  if (existing) existing.remove();

  const color = VERDICT_COLORS[verdict] || "#4a3728";

  const toast = document.createElement("div");
  toast.id = "baloney-toast";
  toast.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "right:24px",
    "z-index:2147483647",
    "background:#f0e6ca",
    `border-left:4px solid ${color}`,
    "border-radius:10px",
    "padding:12px 16px",
    "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "font-size:13px",
    "color:#4a3728",
    "box-shadow:0 4px 20px rgba(74,55,40,0.15)",
    "max-width:300px",
    "animation:baloney-toast-in 0.25s ease both",
  ].join(";");

  const style = document.createElement("style");
  style.textContent =
    "@keyframes baloney-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}";
  toast.appendChild(style);

  lines.forEach((line, i) => {
    const p = document.createElement("p");
    p.textContent = line;
    p.style.cssText =
      i === 0
        ? "font-weight:700;color:#4a3728;margin-bottom:4px"
        : "color:rgba(74,55,40,0.6);font-size:11px;margin:0";
    toast.appendChild(p);
  });

  document.body.appendChild(toast);
  setTimeout(() => toast?.remove(), 5000);
}

function verdictLabel(result) {
  const pct = Math.round((result.confidence ?? 0) * 100);
  switch (result.verdict) {
    case "ai_generated":
      return `AI Generated \u00b7 ${pct}% confidence`;
    case "heavy_edit":
      return `Heavy AI Edit \u00b7 ${pct}% confidence`;
    case "light_edit":
      return `Light AI Edit \u00b7 ${pct}% confidence`;
    default:
      return `Human \u00b7 ${pct}% confidence`;
  }
}

// ──────────────────────────────────────────────
// Message listeners
// ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Image context menu result (kept as-is)
  if (message.type === "show-result" && message.result) {
    showToast(
      ["Baloney: Image Scan", verdictLabel(message.result)],
      message.result.verdict,
    );
  }

  // Keyboard shortcut: return selected text
  if (message.type === "get-selected-text") {
    sendResponse({ text: window.getSelection()?.toString() || "" });
    return;
  }

  // Toast card: loading state
  if (message.type === "show-text-toast-loading") {
    toastLastText = null;
    showTextToastLoading(message.textPreview);
  }

  // Toast card: full result
  if (message.type === "show-text-toast-result") {
    toastLastText = message.text || null;
    showTextToastResult(
      message.result,
      message.textPreview || (message.text || "").slice(0, 80),
    );
  }

  // Toast card: error
  if (message.type === "show-text-toast-error") {
    toastLastText = message.text || null;
    showTextToastError(message.errorMsg);
  }

  // Legacy: show-text-result → redirect to toast card
  if (message.type === "show-text-result" && message.result) {
    toastLastText = message.text || null;
    showTextToastResult(message.result, (message.text || "").slice(0, 80));
  }
});

// ──────────────────────────────────────────────
// Allowed-sites page communication
// ──────────────────────────────────────────────

window.addEventListener("baloney-get-sites", () => {
  chrome.storage.local.get("allowedSites", (data) => {
    window.dispatchEvent(
      new CustomEvent("baloney-sites-response", {
        detail: { sites: data.allowedSites || settings.allowedSites },
      }),
    );
  });
});

window.addEventListener("baloney-update-sites", (e) => {
  const sites = e.detail?.sites;
  if (Array.isArray(sites)) {
    chrome.storage.local.set({ allowedSites: sites });
  }
});

// ──────────────────────────────────────────────
// Identity bridge: share userId with webapp via localStorage
// ──────────────────────────────────────────────

if (
  window.location.hostname === "trustlens-nu.vercel.app" ||
  window.location.hostname === "localhost"
) {
  chrome.storage.local.get("userId", (data) => {
    if (data.userId) {
      try {
        localStorage.setItem("baloney-user-id", data.userId);
        window.dispatchEvent(
          new CustomEvent("baloney-userid-ready", {
            detail: { userId: data.userId },
          }),
        );
      } catch {}
    }
  });
}

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
