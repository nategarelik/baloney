// extension/content.js — Baloney Content Script (v0.5.0)
// Images/videos: auto-scan in viewport with discrete detection dots.
// Text: scan on user selection, inline insight popup + colored underlines.
// All scanning gated by master toggle, allowed sites, and per-type toggles.

const API_URL = "https://baloney.app";
const MIN_IMAGE_SIZE = 200;
const MAX_CONCURRENT = 3; // v2.0: increased from 2 for faster scanning
const MIN_SELECTION_LENGTH = 20;
const VIDEO_MAX_FRAMES = 5; // v2.0: multi-frame video analysis

// HTML escape helper
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
    "linkedin.com",
    "substack.com",
    "reddit.com",
    "facebook.com",
    "instagram.com",
    "medium.com",
    "tiktok.com",
    "threads.net",
  ],
};

function loadSettings() {
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
        resolve();
      },
    );
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.extensionEnabled)
    settings.extensionEnabled = changes.extensionEnabled.newValue;
  if (changes.autoScanText) {
    settings.autoScanText = changes.autoScanText.newValue;
    if (canAutoScanText()) startTextAutoScan();
    else stopTextAutoScan();
  }
  if (changes.autoScanImages) {
    settings.autoScanImages = changes.autoScanImages.newValue;
    if (settings.autoScanImages && isEnabled() && isSiteAllowed()) {
      document.querySelectorAll("img").forEach((img) => {
        if (!img.dataset.baloneyScanned) viewportObserver.observe(img);
      });
    }
  }
  if (changes.autoScanVideos) {
    settings.autoScanVideos = changes.autoScanVideos.newValue;
    if (settings.autoScanVideos && isEnabled() && isSiteAllowed()) {
      document.querySelectorAll("video").forEach((vid) => {
        if (!vid.dataset.baloneyScanned) viewportObserver.observe(vid);
      });
    }
  }
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
  if (!src) return false;

  // Allow large data: URIs (likely AI-generated inline images), skip small ones
  if (src.startsWith("data:")) return src.length > 10000;

  // Check dimensions — use computed style as fallback when naturalWidth is 0
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (!w || !h) {
    const style = window.getComputedStyle(img);
    w = parseInt(style.width, 10) || 0;
    h = parseInt(style.height, 10) || 0;
  }
  if (w < MIN_IMAGE_SIZE || h < MIN_IMAGE_SIZE) return false;

  // Path-segment filtering (exact segment match, not substring)
  try {
    const pathSegments = new URL(src).pathname.split("/");
    const skipSegments = [
      "icon",
      "icons",
      "logo",
      "logos",
      "avatar",
      "avatars",
      "emoji",
      "emojis",
      "favicon",
    ];
    if (pathSegments.some((seg) => skipSegments.includes(seg.toLowerCase())))
      return false;
  } catch {
    // Invalid URL — allow through
  }

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

const VERDICT_COLORS = BALONEY_CONFIG.VERDICT_COLORS;

const VERDICT_LABELS = {
  ai_generated: "AI Generated",
  heavy_edit: "Heavy Edit",
  light_edit: "Light Edit",
  human: "Human Written",
  unavailable: "Unavailable",
};

// ──────────────────────────────────────────────
// Reasoning — plain-English WHY explanations
// ──────────────────────────────────────────────

function getTextReasons(result) {
  const reasons = [];
  const fv = result.feature_vector;
  if (!fv) return reasons;

  const ft = BALONEY_CONFIG.FEATURE_THRESHOLDS;
  if (fv.burstiness !== undefined) {
    if (fv.burstiness < ft.burstinessLow)
      reasons.push("Sentence lengths are very uniform, typical of AI writing");
    else if (fv.burstiness > ft.burstinessHigh)
      reasons.push("Varied sentence rhythm suggests human writing style");
  }
  if (fv.type_token_ratio !== undefined) {
    if (fv.type_token_ratio < ft.ttrLow)
      reasons.push("Vocabulary is repetitive, a common AI pattern");
    else if (fv.type_token_ratio > ft.ttrHigh)
      reasons.push("Rich vocabulary diversity indicates human authorship");
  }
  if (fv.perplexity !== undefined) {
    if (fv.perplexity < ft.perplexityLow)
      reasons.push("Text is highly predictable, consistent with AI generation");
    else if (fv.perplexity > ft.perplexityHigh)
      reasons.push("Unpredictable word choices suggest human creativity");
  }
  if (fv.repetition_score !== undefined) {
    if (fv.repetition_score > ft.repetitionHigh)
      reasons.push("High phrase repetition detected");
  }
  return reasons;
}

function getImageReasons(result) {
  const reasons = [];
  const ir = BALONEY_CONFIG.IMAGE_REASON_THRESHOLDS;
  if (result.primary_score !== undefined) {
    if (result.primary_score > ir.primaryScoreHigh)
      reasons.push("Visual patterns strongly match AI generation signatures");
    else if (result.primary_score < ir.primaryScoreLow)
      reasons.push("Visual patterns consistent with authentic photography");
  }
  if (result.secondary_score !== undefined) {
    if (result.secondary_score > ir.secondaryScoreHigh)
      reasons.push("Frequency analysis shows unusually smooth gradients");
    else if (result.secondary_score < ir.secondaryScoreLow)
      reasons.push("Natural noise patterns detected in image data");
  }
  if (result.edit_magnitude !== undefined) {
    if (result.edit_magnitude > ir.editMagnitudeHigh)
      reasons.push("Significant digital manipulation detected");
  }
  if (result.trust_score !== undefined) {
    if (result.trust_score > ir.trustScoreHigh) reasons.push("High authenticity confidence");
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
      const sc = BALONEY_CONFIG.SENTENCE_COLORS;
      const barColor =
        s.ai_probability > sc.HIGH_THRESHOLD
          ? sc.high
          : s.ai_probability > sc.MID_THRESHOLD
            ? sc.mid
            : sc.low;
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
  const analyzeUrl = `${API_URL}/analyze?result=${encodeURIComponent(resultData)}`;
  html += `<a href="${analyzeUrl}" target="_blank" class="baloney-insight__fulldata">View Full Data \u2192</a>`;

  return html;
}

// ──────────────────────────────────────────────
// Detection Dot UI (replaces hover borders)
// ──────────────────────────────────────────────

function getDotColor(confidence) {
  const dc = BALONEY_CONFIG.DOT_COLOR_THRESHOLDS;
  if (confidence >= dc.HIGH_CONFIDENCE) return dc.HIGH_COLOR;
  if (confidence >= dc.MID_CONFIDENCE) return dc.MID_COLOR;
  return dc.LOW_COLOR;
}

function getDotOpacity(confidence) {
  const op = BALONEY_CONFIG.DOT_OPACITY;
  return Math.min(op.BASE + confidence * op.SCALE, op.MAX);
}

function createDetectionDot(el, result) {
  // Only show dot when confidence >= visibility threshold (always show for ai_generated regardless)
  if (result.confidence < BALONEY_CONFIG.DOT_OPACITY.VISIBILITY_THRESHOLD && result.verdict !== "ai_generated") return null;

  const confidence = result.confidence || 0;
  const pct = Math.round(confidence * 100);
  const color = VERDICT_COLORS[result.verdict] || getDotColor(confidence);
  const opacity = getDotOpacity(confidence);

  // For images/videos, attach dot to parent; for text elements, attach to the element itself
  const isMedia = el.tagName === "IMG" || el.tagName === "VIDEO";
  const dotContainer = isMedia ? el.parentElement : el;

  if (dotContainer) {
    const pos = window.getComputedStyle(dotContainer).position;
    if (pos === "static") dotContainer.style.position = "relative";
  }

  // Extract top method names for tooltip
  let methodNames = "";
  if (result.method_scores) {
    const topMethods = Object.entries(result.method_scores)
      .filter(([, m]) => m.available)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 2)
      .map(([, m]) => m.label);
    if (topMethods.length > 0) {
      methodNames = topMethods.join(" + ");
    }
  }

  const dot = document.createElement("div");
  dot.className =
    "baloney-dot" + (methodNames ? " baloney-dot--has-methods" : "");
  dot.style.background = color;
  dot.style.opacity = opacity;

  const labelWrap = document.createElement("div");
  labelWrap.className = "baloney-dot__label";
  labelWrap.style.color = "#fff";

  const line1 = document.createElement("span");
  line1.className = "baloney-dot__label-line1";
  line1.textContent = `${pct}% AI`;
  labelWrap.appendChild(line1);

  if (methodNames) {
    const line2 = document.createElement("span");
    line2.className = "baloney-dot__label-line2";
    line2.textContent = methodNames;
    labelWrap.appendChild(line2);
  }

  dot.appendChild(labelWrap);

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

  if (dotContainer) {
    dotContainer.appendChild(dot);
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

  // Stats header: Scanned | Flagged | AI Rate
  const totalScanned = sessionStats.scanned + sessionStats.textScanned;
  const totalFlagged = sessionStats.flaggedAI + sessionStats.textFlagged;
  const aiRate =
    totalScanned > 0 ? Math.round((totalFlagged / totalScanned) * 100) : 0;

  const statsHeader = document.createElement("div");
  statsHeader.className = "baloney-page-stats";
  statsHeader.innerHTML = `
    <div class="baloney-page-stat">
      <div class="baloney-page-stat-value">${totalScanned}</div>
      <div class="baloney-page-stat-label">Scanned</div>
    </div>
    <div class="baloney-page-stat">
      <div class="baloney-page-stat-value">${totalFlagged}</div>
      <div class="baloney-page-stat-label">Flagged</div>
    </div>
    <div class="baloney-page-stat">
      <div class="baloney-page-stat-value">${aiRate}%</div>
      <div class="baloney-page-stat-label">AI Rate</div>
    </div>
  `;
  pagePanel.appendChild(statsHeader);

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
  if (!pagePanel) return;
  const isOpen = pagePanel.classList.contains("open");
  if (isOpen) {
    pagePanel.classList.remove("open");
  } else {
    // Only open if at least one scan has completed on this page
    const totalScanned = sessionStats.scanned + sessionStats.textScanned;
    if (totalScanned > 0) {
      pagePanel.classList.add("open");
    }
  }
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

    // Retry once when the image successfully loads later
    const retries = parseInt(img.dataset.baloneyRetries || "0", 10);
    if (retries < 1) {
      img.dataset.baloneyRetries = String(retries + 1);
      img.addEventListener(
        "load",
        () => {
          if (img.dataset.baloneyScanned === "error") {
            delete img.dataset.baloneyScanned;
            analyzeImage(img);
          }
        },
        { once: true },
      );
    }
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
      }, BALONEY_CONFIG.TIMEOUTS.videoSeek);
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
      if (!video.paused) {
        // Video is playing — capture only the current frame to avoid visible playback jump
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || video.clientWidth || 320;
          canvas.height = video.videoHeight || video.clientHeight || 240;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frameUrls.push(canvas.toDataURL("image/jpeg", 0.7));
        } catch {
          // Cross-origin or security error — skip
        }
      } else {
        // Video is paused — safe to seek for multi-frame analysis
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
      }
    } else if (frameUrls.length === 0) {
      // Fallback: capture current frame (even if readyState < 2)
      try {
        const cw = video.videoWidth || video.clientWidth;
        const ch = video.videoHeight || video.clientHeight;
        if (cw > 0 && ch > 0) {
          const canvas = document.createElement("canvas");
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          // Reject blank frames (all-black canvas produces a very short data URL)
          if (dataUrl.length > 1000) {
            frameUrls.push(dataUrl);
          }
        }
      } catch {
        // Cross-origin or no frame data — fall through to poster/src check below
      }
    }

    // If still no frames but we have a poster URL or video src, use that
    if (frameUrls.length === 0 && video.poster) {
      frameUrls.push(video.poster);
    }
    if (frameUrls.length === 0 && video.src && !video.src.startsWith("blob:")) {
      // Can't analyze blob URLs as images, but regular URLs work
      frameUrls.push(video.src);
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
    const va = BALONEY_CONFIG.VIDEO_AGGREGATION;
    let aggregatedResult;
    if (aiRatio > va.aiRatioHigh || avgConfidence > va.aiConfidenceHigh) {
      aggregatedResult = {
        ...frameResults[0],
        verdict: "ai_generated",
        confidence: Math.max(avgConfidence, va.aiMinConfidence),
        model_used: `multi-frame(${frameResults.length}):${frameResults[0].model_used}`,
        frames_analyzed: frameResults.length,
        frames_flagged: aiCount,
      };
    } else if (aiRatio > va.heavyEditRatio || avgConfidence > va.heavyEditConfidence) {
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

    // Add fields expected by VideoDetectionResult on the analyze page
    aggregatedResult.frame_scores = confidences;
    aggregatedResult.frames_flagged_ai = aiCount;
    aggregatedResult.ai_frame_percentage = aiRatio;
    aggregatedResult.duration_seconds = video.duration || 0;
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
    if (text.length < BALONEY_CONFIG.TEXT_SCAN.autoScanMinLength) return;

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

        if (result && result.verdict && result.verdict !== "unavailable") {
          result.sourcePageUrl = window.location.href;

          // Ensure parent is positioned for detection dot
          const pos = window.getComputedStyle(el).position;
          if (pos === "static") el.style.position = "relative";

          createDetectionDot(el, result);

          // Add colored left border to flagged text blocks for visibility
          if (
            result.verdict === "ai_generated" ||
            result.verdict === "heavy_edit"
          ) {
            const color = VERDICT_COLORS[result.verdict] || "#d4456b";
            el.style.borderLeft = `3px solid ${color}`;
            el.style.paddingLeft = el.style.paddingLeft || "8px";
          }

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
// CSS Background Image Detection
// ──────────────────────────────────────────────

const BG_SELECTORS =
  ".hero, [class*='cover'], [class*='banner'], header, [role='banner'], " +
  "[class*='background'], [class*='hero'], [class*='jumbotron'], [class*='masthead']";

const scannedBgElements = new WeakSet();
let bgScanTimer = null;

function scanBackgroundImages() {
  if (!canScanImages()) return;

  let found = 0;
  const elements = document.querySelectorAll(BG_SELECTORS);

  for (const el of elements) {
    if (found >= 10) break;
    if (scannedBgElements.has(el)) continue;

    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (!bgImage || bgImage === "none") continue;

    const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (!urlMatch || !urlMatch[1]) continue;

    const url = urlMatch[1];
    if (url.startsWith("data:") && url.length < 10000) continue;

    scannedBgElements.add(el);
    found++;

    // Analyze the background image URL
    requestQueue.add(async () => {
      try {
        const result = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: "analyze-image", url },
            (response) => {
              if (chrome.runtime.lastError)
                reject(new Error(chrome.runtime.lastError.message));
              else resolve(response);
            },
          );
        });

        if (result && result.verdict) {
          result.sourceUrl = url;
          result.sourcePageUrl = window.location.href;
          createDetectionDot(el, result);
          addFlaggedItem(el, result.verdict, "Background: " + url.slice(0, 40));
          applyContentMode(el, result.verdict);
          updateStats(result.verdict);
          updatePageStats("images", result.verdict);
        }
      } catch (error) {
        console.warn("[Baloney] Background image scan failed:", error);
      }
    });
  }
}

function debouncedBgScan() {
  if (bgScanTimer) clearTimeout(bgScanTimer);
  bgScanTimer = setTimeout(scanBackgroundImages, 1000);
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
          if (el.dataset.baloneyScanned) {
            // Already scanned or pending — skip
          } else if (el.readyState >= 2) {
            // Frame data available — check size and analyze
            const w = el.videoWidth || el.clientWidth;
            if (w > 200) {
              analyzeVideo(el);
            }
          } else {
            // Video not ready yet — schedule retries via canplay/loadeddata
            const retries = parseInt(el.dataset.baloneyRetries || "0", 10);
            if (retries < 3) {
              el.dataset.baloneyRetries = String(retries + 1);
              const reobserve = () => {
                if (!el.dataset.baloneyScanned) viewportObserver.observe(el);
              };
              // Listen for both events — whichever fires first
              el.addEventListener("loadeddata", reobserve, { once: true });
              el.addEventListener("canplay", reobserve, { once: true });
              // Timer fallback for videos whose events already fired
              // TODO: consider adding to detection-config.ts
              setTimeout(reobserve, 2000);
            } else if (el.poster || el.clientWidth > 200) {
              // Last resort: try to analyze with whatever we have (poster/current frame)
              analyzeVideo(el);
            }
          }
        }

        viewportObserver.unobserve(el);
      }
    }
  },
  { threshold: 0.1, rootMargin: "200px 0px" },
);

// ──────────────────────────────────────────────
// Attribute observer (watch src changes on lazy-loaded images)
// ──────────────────────────────────────────────

const attributeObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type !== "attributes") continue;
    const img = mutation.target;
    if (img.tagName !== "IMG") continue;

    const scanned = img.dataset.baloneyScanned;
    if (scanned && scanned !== "error") continue;

    if (isTargetImage(img)) {
      delete img.dataset.baloneyScanned;
      viewportObserver.observe(img);
    }
  }
});

function watchImageAttributes(img) {
  attributeObserver.observe(img, {
    attributes: true,
    attributeFilter: ["src", "srcset"],
  });
}

// ──────────────────────────────────────────────
// DOM observer (watch for new images/videos)
// ──────────────────────────────────────────────

const domObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      if (node.tagName === "IMG") {
        viewportObserver.observe(node);
        watchImageAttributes(node);
      }
      if (node.tagName === "VIDEO") viewportObserver.observe(node);
      if (node.tagName === "PICTURE") {
        const innerImg = node.querySelector("img");
        if (innerImg) {
          viewportObserver.observe(innerImg);
          watchImageAttributes(innerImg);
        }
      }

      if (node.querySelectorAll) {
        node.querySelectorAll("img").forEach((img) => {
          viewportObserver.observe(img);
          watchImageAttributes(img);
        });
        node
          .querySelectorAll("video")
          .forEach((vid) => viewportObserver.observe(vid));
        node.querySelectorAll("picture").forEach((pic) => {
          const innerImg = pic.querySelector("img");
          if (innerImg) {
            viewportObserver.observe(innerImg);
            watchImageAttributes(innerImg);
          }
        });

        // Auto-scan new text elements if enabled
        if (textObserver) {
          node.querySelectorAll(TEXT_SELECTORS).forEach((el) => {
            if (!el.dataset.baloneyTextScanned) textObserver.observe(el);
          });
        }
      }
    }
  }

  // Re-scan for background images after DOM changes
  debouncedBgScan();
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

function init() {
  if (!isEnabled()) return;
  if (!isSiteAllowed()) return;

  createLoadingIndicator();

  // Observe future DOM changes
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Scan existing images (including inside <picture> elements)
  document.querySelectorAll("img").forEach((img) => {
    viewportObserver.observe(img);
    watchImageAttributes(img);
  });

  document.querySelectorAll("picture").forEach((pic) => {
    const innerImg = pic.querySelector("img");
    if (innerImg) {
      viewportObserver.observe(innerImg);
      watchImageAttributes(innerImg);
    }
  });

  // Scan existing videos
  document.querySelectorAll("video").forEach((vid) => {
    viewportObserver.observe(vid);
  });

  // Start auto-scan text if enabled
  if (canAutoScanText()) {
    startTextAutoScan();
  }

  // Scan CSS background images on hero/cover elements
  scanBackgroundImages();

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

  // Clean up escape key listener
  if (activeToastCard._escHandler) {
    document.removeEventListener("keydown", activeToastCard._escHandler);
    activeToastCard._escHandler = null;
  }

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

// TODO: consider adding to detection-config.ts
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
      // TODO: sync with detection-config.ts → DETECTION_CONFIG.ui.scoreColors.high (0.65) / medium (0.35)
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
  const resultData = JSON.stringify({
    result,
    type: "text",
    sourceUrl: result.sourceUrl,
    sourcePageUrl: result.sourcePageUrl,
  });
  const analyzeUrl = `${API_URL}/analyze?result=${encodeURIComponent(resultData)}`;

  // Method mini-bars (top 2 methods)
  let methodsHTML = "";
  if (result.method_scores) {
    const methods = Object.entries(result.method_scores)
      .filter(([, m]) => m.available)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 2);
    if (methods.length > 0) {
      methodsHTML = '<div class="baloney-toast-methods">';
      methods.forEach(([, m]) => {
        const pct = Math.round(m.score * 100);
        // TODO: sync with detection-config.ts → DETECTION_CONFIG.ui.scoreColors.high (0.65) / medium (0.35)
        const mColor =
          m.score > 0.65 ? "#d4456b" : m.score > 0.35 ? "#f59e0b" : "#16a34a";
        methodsHTML += `<div class="baloney-toast-method-row">
          <span class="baloney-toast-method-label">${esc(m.label)}</span>
          <div class="baloney-toast-method-bar"><div style="width:${pct}%;background:${mColor}"></div></div>
          <span class="baloney-toast-method-pct">${pct}%</span>
        </div>`;
      });
      methodsHTML += "</div>";
    }
  }

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
    ${methodsHTML}
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
        // TODO: sync with detection-config.ts → DETECTION_CONFIG.ui.scoreColors.high (0.65) / medium (0.35)
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

  // Escape to dismiss (stored on card for cleanup in dismissTextToast)
  const escHandler = (e) => {
    if (e.key === "Escape") {
      dismissTextToast(true);
    }
  };
  document.addEventListener("keydown", escHandler);
  card._escHandler = escHandler;

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
  // Image context menu result — attach dot + show interactive toast
  if (message.type === "show-result" && message.result) {
    const result = message.result;
    result.sourceUrl = message.srcUrl;
    result.sourcePageUrl = window.location.href;

    // Find the matching <img> element and attach a detection dot
    if (message.srcUrl) {
      const imgs = document.querySelectorAll("img");
      for (const img of imgs) {
        const imgSrc = img.src || img.currentSrc || "";
        if (imgSrc === message.srcUrl) {
          if (!img.dataset.baloneyScanned) {
            img.dataset.baloneyScanned = result.verdict;
            img.dataset.baloneyResult = JSON.stringify(result);
            createDetectionDot(img, result);
            addFlaggedItem(
              img,
              result.verdict,
              "Image: " + (img.alt || imgSrc.slice(0, 40) || "unknown"),
            );
            applyContentMode(img, result.verdict);
            updateStats(result.verdict);
            updatePageStats("images", result.verdict);
          }
          break;
        }
      }
    }

    // Show interactive toast that navigates to analysis page on click
    const color = VERDICT_COLORS[result.verdict] || "#4a3728";
    const label = VERDICT_LABELS[result.verdict] || result.verdict;
    const confidence = Math.round((result.confidence || 0) * 100);
    const reasons = getImageReasons(result).slice(0, 2);
    const resultData = JSON.stringify({
      result,
      type: "image",
      sourceUrl: result.sourceUrl,
      sourcePageUrl: result.sourcePageUrl,
    });
    const analyzeUrl = `${API_URL}/analyze?result=${encodeURIComponent(resultData)}`;

    const card = createToastCardShell();
    card.style.borderLeftColor = color;

    let reasonsHTML = "";
    if (reasons.length > 0) {
      reasonsHTML = `<div class="baloney-toast-card__reasons">${reasons.map((r) => `<div class="baloney-toast-card__reason">\u2022 ${r}</div>`).join("")}</div>`;
    }

    // Method mini-bars
    let methodsHTML = "";
    if (result.method_scores) {
      const methods = Object.entries(result.method_scores)
        .filter(([, m]) => m.available)
        .sort((a, b) => b[1].weight - a[1].weight)
        .slice(0, 2);
      if (methods.length > 0) {
        methodsHTML = '<div class="baloney-toast-methods">';
        methods.forEach(([, m]) => {
          const pct = Math.round(m.score * 100);
          // TODO: sync with detection-config.ts → DETECTION_CONFIG.ui.scoreColors.high (0.65) / medium (0.35)
          const mColor =
            m.score > 0.65 ? "#d4456b" : m.score > 0.35 ? "#f59e0b" : "#16a34a";
          methodsHTML += `<div class="baloney-toast-method-row">
            <span class="baloney-toast-method-label">${esc(m.label)}</span>
            <div class="baloney-toast-method-bar"><div style="width:${pct}%;background:${mColor}"></div></div>
            <span class="baloney-toast-method-pct">${pct}%</span>
          </div>`;
        });
        methodsHTML += "</div>";
      }
    }

    const model = (result.model_used || result.model || "unknown").replace(
      /</g,
      "&lt;",
    );

    card.innerHTML = `
      <div class="baloney-toast-card__header">
        <span class="baloney-toast-card__icon">\uD83D\uDC37</span>
        <span class="baloney-toast-card__title">Baloney Image Scan</span>
        <button class="baloney-toast-card__close" id="baloney-toast-close">\u00D7</button>
      </div>
      <div class="baloney-toast-card__verdict" id="baloney-toast-verdict" style="cursor:pointer">
        <div class="baloney-toast-card__verdict-dot" style="background:${color}"></div>
        <span class="baloney-toast-card__verdict-label">${label}</span>
        <span class="baloney-toast-card__verdict-pct">${confidence}%</span>
      </div>
      <div class="baloney-toast-card__bar">
        <div class="baloney-toast-card__bar-fill" style="background:${color}" id="baloney-toast-bar-fill"></div>
      </div>
      ${methodsHTML}
      ${reasonsHTML}
      <div class="baloney-toast-card__footer">
        <span class="baloney-toast-card__model">${model}</span>
        <a href="${analyzeUrl}" target="_blank" class="baloney-toast-card__link">View Full Data \u2192</a>
      </div>
    `;

    // Animate confidence bar
    requestAnimationFrame(() => {
      const barFill = document.getElementById("baloney-toast-bar-fill");
      if (barFill) {
        requestAnimationFrame(() => {
          barFill.style.width = `${confidence}%`;
        });
      }
    });

    // Close button
    const closeBtn = document.getElementById("baloney-toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dismissTextToast(true);
      });
    }

    // Click verdict → open analysis page
    const verdictEl = document.getElementById("baloney-toast-verdict");
    if (verdictEl) {
      verdictEl.addEventListener("click", () => openSidepanel(result, "image"));
    }

    startAutoDismiss(12000);
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
  window.location.hostname === "baloney.app" ||
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

loadSettings().then(() => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
});
