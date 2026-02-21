// extension/content.js — Baloney Content Script (Selection + Hover UX v0.3.0)
// Images/videos: auto-scan in viewport (max 2 concurrent), colored border on hover,
// insight tooltip when cursor touches border edge.
// Text: scan only on user selection, inline insight popup.

const MIN_IMAGE_SIZE = 200;
const MAX_CONCURRENT = 2;
const MIN_SELECTION_LENGTH = 20;
const EDGE_THRESHOLD = 15; // px from image edge to trigger tooltip

// ──────────────────────────────────────────────
// Content filter mode: "label" | "blur" | "hide"
// ──────────────────────────────────────────────

let filterMode = "label";

chrome.storage.local.get("filterMode", (data) => {
  filterMode = data.filterMode || "label";
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.filterMode) {
    filterMode = changes.filterMode.newValue || "label";
    reapplyFilterMode();
  }
});

// ──────────────────────────────────────────────
// Image filtering
// ──────────────────────────────────────────────

function isTargetImage(img) {
  const src = img.src || img.currentSrc || "";
  if (!src || src.startsWith("data:")) return false;
  if (img.naturalWidth < MIN_IMAGE_SIZE || img.naturalHeight < MIN_IMAGE_SIZE) return false;
  if (src.includes("/icon") || src.includes("/logo") || src.includes("/avatar") || src.includes("/emoji")) return false;
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

function updateStats(verdict) {
  sessionStats.scanned++;
  if (verdict === "ai_generated" || verdict === "heavy_edit") sessionStats.flaggedAI++;
  chrome.storage.local.set({ sessionStats });
}

function updateTextStats(verdict) {
  sessionStats.textScanned++;
  if (verdict === "ai_generated" || verdict === "heavy_edit") sessionStats.textFlagged++;
  chrome.storage.local.set({ sessionStats });
}

// Per-page stats
const pageHostname = window.location.hostname;

function updatePageStats(type, verdict) {
  chrome.storage.local.get("pageStats", (data) => {
    const pageStats = data.pageStats || {};
    if (!pageStats[pageHostname]) {
      pageStats[pageHostname] = { images: 0, text: 0, flagged: 0, lastScan: Date.now() };
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

function getVerdictClass(verdict) {
  if (verdict === "ai_generated") return "ai";
  if (verdict === "heavy_edit") return "heavy";
  if (verdict === "light_edit") return "light";
  return "human";
}

const VERDICT_COLORS = {
  ai_generated: "#ef4444", heavy_edit: "#f97316",
  light_edit: "#f59e0b", human: "#22c55e"
};

const VERDICT_LABELS = {
  ai_generated: "AI Generated", heavy_edit: "Heavy Edit",
  light_edit: "Light Edit", human: "Human Written"
};

// ──────────────────────────────────────────────
// Reasoning — plain-English WHY explanations
// ──────────────────────────────────────────────

function getTextReasons(result) {
  const reasons = [];
  const fv = result.feature_vector;
  if (!fv) return reasons;

  if (fv.burstiness !== undefined) {
    if (fv.burstiness < 0.2) reasons.push("Sentence lengths are very uniform, typical of AI writing");
    else if (fv.burstiness > 0.5) reasons.push("Varied sentence rhythm suggests human writing style");
  }
  if (fv.type_token_ratio !== undefined) {
    if (fv.type_token_ratio < 0.4) reasons.push("Vocabulary is repetitive, a common AI pattern");
    else if (fv.type_token_ratio > 0.7) reasons.push("Rich vocabulary diversity indicates human authorship");
  }
  if (fv.perplexity !== undefined) {
    if (fv.perplexity < 80) reasons.push("Text is highly predictable, consistent with AI generation");
    else if (fv.perplexity > 150) reasons.push("Unpredictable word choices suggest human creativity");
  }
  if (fv.repetition_score !== undefined) {
    if (fv.repetition_score > 0.6) reasons.push("High phrase repetition detected");
  }
  return reasons;
}

function getImageReasons(result) {
  const reasons = [];
  if (result.primary_score !== undefined) {
    if (result.primary_score > 0.7) reasons.push("Visual patterns strongly match AI generation signatures");
    else if (result.primary_score < 0.3) reasons.push("Visual patterns consistent with authentic photography");
  }
  if (result.secondary_score !== undefined) {
    if (result.secondary_score > 0.6) reasons.push("Frequency analysis shows unusually smooth gradients");
    else if (result.secondary_score < 0.3) reasons.push("Natural noise patterns detected in image data");
  }
  if (result.edit_magnitude !== undefined) {
    if (result.edit_magnitude > 0.7) reasons.push("Significant digital manipulation detected");
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
  const color = VERDICT_COLORS[result.verdict] || "#3b82f6";
  const label = VERDICT_LABELS[result.verdict] || result.verdict;
  const confidence = Math.round((result.confidence || 0) * 100);

  let html = `
    <div class="baloney-insight__header">
      <div class="baloney-insight__dot" style="background:${color}"></div>
      <span>${label}</span>
      <span class="baloney-insight__confidence">${confidence}%</span>
    </div>
  `;

  // Caveat text
  if (result.caveat) {
    const safeCaveat = result.caveat.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html += `<div class="baloney-insight__caveat">${safeCaveat}</div>`;
  }

  // Reasoning bullets
  const reasons = type === "text" ? getTextReasons(result) : getImageReasons(result);
  if (reasons.length > 0) {
    html += `<div class="baloney-insight__reasons">`;
    reasons.forEach((r) => {
      html += `<div class="baloney-insight__reason">\u2022 ${r}</div>`;
    });
    html += `</div>`;
  }

  // Sentence-level breakdown (text only, up to 5)
  if (result.sentence_scores && result.sentence_scores.length > 0) {
    html += `<div class="baloney-insight__sentences">`;
    result.sentence_scores.slice(0, 5).forEach((s) => {
      const pct = Math.round(s.ai_probability * 100);
      const barColor = s.ai_probability > 0.6 ? "#ef4444" : s.ai_probability > 0.4 ? "#f59e0b" : "#22c55e";
      const safeText = s.text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const preview = safeText.length > 40 ? safeText.slice(0, 40) + "\u2026" : safeText;
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

  // Model footer
  const model = (result.model_used || result.model || "unknown").replace(/</g, "&lt;");
  html += `<div class="baloney-insight__model">Model: ${model}</div>`;

  return html;
}

function buildTooltipHTML(result) {
  return buildInsightHTML(result, result.feature_vector ? "text" : "image");
}

// ──────────────────────────────────────────────
// Tooltip system (image/video hover)
// ──────────────────────────────────────────────

let tooltipEl = null;
let tooltipTimeout = null;
let hideTimeout = null;

function ensureTooltip() {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "baloney-tooltip";
  tooltipEl.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
  });
  tooltipEl.addEventListener("mouseleave", (e) => {
    scheduleHideTooltip(e);
  });
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function showTooltip(element) {
  clearTimeout(hideTimeout);
  clearTimeout(tooltipTimeout);

  tooltipTimeout = setTimeout(() => {
    const resultStr = element.dataset.baloneyResult;
    if (!resultStr) return;

    let result;
    try { result = JSON.parse(resultStr); } catch { return; }

    const tip = ensureTooltip();
    tip.innerHTML = buildTooltipHTML(result);

    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tipWidth = 280;
    const tipHeight = tip.offsetHeight || 200;

    let top = rect.top - tipHeight - 8;
    let left = rect.left + (rect.width / 2) - (tipWidth / 2);

    // Flip below if near top
    if (top < 8) top = rect.bottom + 8;
    // Keep in viewport horizontally
    left = Math.max(8, Math.min(left, window.innerWidth - tipWidth - 8));

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
    tip.classList.add("visible");
  }, 200);
}

function scheduleHideTooltip(e) {
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    if (tooltipEl) tooltipEl.classList.remove("visible");
  }, 100);
}

function hideTooltip() {
  clearTimeout(tooltipTimeout);
  clearTimeout(hideTimeout);
  if (tooltipEl) tooltipEl.classList.remove("visible");
}

// ──────────────────────────────────────────────
// Floating page indicator
// ──────────────────────────────────────────────

let flaggedItems = [];
let pageIndicator = null;
let pagePanel = null;

function ensurePageIndicator() {
  if (pageIndicator) return;

  pageIndicator = document.createElement("div");
  pageIndicator.className = "baloney-page-indicator baloney-page-indicator--clean";
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

  pageIndicator.classList.remove("baloney-page-indicator--clean", "baloney-page-indicator--warn", "baloney-page-indicator--alert");
  if (count === 0) pageIndicator.classList.add("baloney-page-indicator--clean");
  else if (count <= 3) pageIndicator.classList.add("baloney-page-indicator--warn");
  else pageIndicator.classList.add("baloney-page-indicator--alert");

  // Update panel
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
    const colors = { ai_generated: "#ef4444", heavy_edit: "#f97316", light_edit: "#f59e0b", human: "#22c55e" };
    dot.style.background = colors[item.verdict] || "#3b82f6";

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
  if (verdict === "ai_generated" || verdict === "heavy_edit") {
    flaggedItems.push({ element, verdict, preview });
    updatePageIndicator();
  } else {
    ensurePageIndicator();
  }
}

// ──────────────────────────────────────────────
// Content filtering helpers
// ──────────────────────────────────────────────

function shouldFilter(verdict) {
  return verdict === "ai_generated" || verdict === "heavy_edit";
}

function applyFilter(targetEl, verdict) {
  if (!shouldFilter(verdict)) return;

  removeFilter(targetEl);

  if (filterMode === "blur") {
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
  } else if (filterMode === "hide") {
    const container = targetEl.closest("article, [role='article'], .post, .tweet") || targetEl;
    container.classList.add("baloney-hidden");
    container.dataset.baloneyHiddenBy = "filter";
  }
}

function removeFilter(targetEl) {
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

function reapplyFilterMode() {
  // Re-process all scanned images and videos
  document.querySelectorAll("img[data-baloney-scanned], video[data-baloney-scanned]").forEach((el) => {
    const verdict = el.dataset.baloneyScanned;
    if (!verdict || verdict === "pending" || verdict === "error") return;

    removeFilter(el);
    applyFilter(el, verdict);
  });
}

// ──────────────────────────────────────────────
// Image/Video indicator — hover borders
// ──────────────────────────────────────────────

function applyImageIndicator(el, result) {
  el.dataset.baloneyResult = JSON.stringify(result);
  el.dataset.baloneyVerdict = getVerdictClass(result.verdict);
  el.classList.add("baloney-scanned-image");

  el.addEventListener("mouseenter", () => {
    el.classList.add("baloney-scanned-image--hover");
  });

  el.addEventListener("mouseleave", () => {
    el.classList.remove("baloney-scanned-image--hover");
    hideTooltip();
  });

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const nearLeft = e.clientX - rect.left < EDGE_THRESHOLD;
    const nearRight = rect.right - e.clientX < EDGE_THRESHOLD;
    const nearTop = e.clientY - rect.top < EDGE_THRESHOLD;
    const nearBottom = rect.bottom - e.clientY < EDGE_THRESHOLD;

    if (nearLeft || nearRight || nearTop || nearBottom) {
      showTooltip(el);
    } else {
      hideTooltip();
    }
  });
}

// ──────────────────────────────────────────────
// Image analysis pipeline
// ──────────────────────────────────────────────

async function analyzeImage(img) {
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
          }
        );
      });
      return response;
    });

    if (result && result.verdict) {
      img.dataset.baloneyScanned = result.verdict;
      applyImageIndicator(img, result);
      addFlaggedItem(img, result.verdict, "Image: " + (img.alt || img.src?.slice(0, 40) || "unknown"));
      applyFilter(img, result.verdict);
      updateStats(result.verdict);
      updatePageStats("images", result.verdict);
    }
  } catch (error) {
    console.error("[Baloney] Image analysis failed:", error);
    img.dataset.baloneyScanned = "error";
  }
}

// ──────────────────────────────────────────────
// Video analysis pipeline
// ──────────────────────────────────────────────

async function analyzeVideo(video) {
  if (video.dataset.baloneyScanned) return;
  video.dataset.baloneyScanned = "pending";

  try {
    let imageUrl;

    // Prefer poster attribute; otherwise capture current frame
    if (video.poster) {
      imageUrl = video.poster;
    } else {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || video.clientWidth || 320;
        canvas.height = video.videoHeight || video.clientHeight || 240;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageUrl = canvas.toDataURL("image/jpeg", 0.7);
      } catch {
        video.dataset.baloneyScanned = "error";
        return;
      }
    }

    if (!imageUrl) {
      video.dataset.baloneyScanned = "error";
      return;
    }

    const result = await requestQueue.add(async () => {
      // Send through existing analyze-image channel
      // data: URLs are supported by fetch() in service workers
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "analyze-image", url: imageUrl },
          (response) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else resolve(response);
          }
        );
      });
      return response;
    });

    if (result && result.verdict) {
      video.dataset.baloneyScanned = result.verdict;
      applyImageIndicator(video, result);
      addFlaggedItem(video, result.verdict, "Video: " + (video.title || video.src?.slice(0, 40) || "video"));
      applyFilter(video, result.verdict);
      updateStats(result.verdict);
      updatePageStats("images", result.verdict);
    }
  } catch (error) {
    console.error("[Baloney] Video analysis failed:", error);
    video.dataset.baloneyScanned = "error";
  }
}

// ──────────────────────────────────────────────
// Text Selection System
// ──────────────────────────────────────────────

let selectionPopup = null;
let selectionScrollY = null;
let selectionDebounceTimer = null;

function handleTextSelection() {
  clearTimeout(selectionDebounceTimer);
  selectionDebounceTimer = setTimeout(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length < MIN_SELECTION_LENGTH) return;

    let range;
    try { range = selection.getRangeAt(0); } catch { return; }
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    showSelectionPopup(text, rect);
  }, 150);
}

function showSelectionPopup(text, selectionRect) {
  dismissSelectionPopup();

  selectionScrollY = window.scrollY;

  const popup = document.createElement("div");
  popup.className = "baloney-selection-popup";
  popup.id = "baloney-selection-popup";

  // Scan button
  const btn = document.createElement("button");
  btn.className = "baloney-scan-btn";
  btn.textContent = "\uD83D\uDC37 Scan with Baloney";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    scanSelectedText(text, popup);
  });
  popup.appendChild(btn);

  document.body.appendChild(popup);

  // Position below selection, centered
  const popupWidth = 300;
  let top = selectionRect.bottom + window.scrollY + 8;
  let left = selectionRect.left + window.scrollX + (selectionRect.width / 2) - (popupWidth / 2);

  // Flip above if near bottom of viewport
  if (selectionRect.bottom + 200 > window.innerHeight) {
    top = selectionRect.top + window.scrollY - 60;
  }

  // Viewport clamp
  left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;

  // Animate in
  requestAnimationFrame(() => popup.classList.add("visible"));

  selectionPopup = popup;
}

async function scanSelectedText(text, popup) {
  // Loading state
  popup.innerHTML = "";
  const loading = document.createElement("div");
  loading.className = "baloney-scan-loading";

  const spinner = document.createElement("div");
  spinner.className = "baloney-scan-spinner";
  loading.appendChild(spinner);

  const loadingText = document.createElement("span");
  loadingText.textContent = "Analyzing text\u2026";
  loading.appendChild(loadingText);

  popup.appendChild(loading);

  try {
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "analyze-text", text: text.slice(0, 2000) },
        (response) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(response);
        }
      );
    });

    if (!result || !result.verdict) {
      popup.innerHTML = `<div class="baloney-scan-error">Analysis failed. Try again.</div>`;
      return;
    }

    // Show insight
    popup.innerHTML = buildInsightHTML(result, "text");

    // Update stats
    updateTextStats(result.verdict);
    updatePageStats("text", result.verdict);
  } catch (error) {
    console.error("[Baloney] Selection scan failed:", error);
    popup.innerHTML = `<div class="baloney-scan-error">Analysis failed. Try again.</div>`;
  }
}

function dismissSelectionPopup() {
  if (selectionPopup) {
    selectionPopup.remove();
    selectionPopup = null;
    selectionScrollY = null;
  }
}

// Dismiss on click outside
document.addEventListener("mousedown", (e) => {
  if (selectionPopup && !selectionPopup.contains(e.target)) {
    dismissSelectionPopup();
  }
});

// Dismiss on scroll > 200px
window.addEventListener("scroll", () => {
  if (selectionPopup && selectionScrollY !== null) {
    if (Math.abs(window.scrollY - selectionScrollY) > 200) {
      dismissSelectionPopup();
    }
  }
}, { passive: true });

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
  { threshold: 0.5 }
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
        node.querySelectorAll("img").forEach((img) => viewportObserver.observe(img));
        node.querySelectorAll("video").forEach((vid) => viewportObserver.observe(vid));
      }
    }
  }
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

function init() {
  console.log("[Baloney] Content script loaded (v0.3.0 \u2014 selection + hover UX)");

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

  // Text selection listener
  document.addEventListener("mouseup", handleTextSelection);

  ensurePageIndicator();
}

// ──────────────────────────────────────────────
// Context menu result toasts
// ──────────────────────────────────────────────

function showToast(lines, verdict) {
  const existing = document.getElementById("baloney-toast");
  if (existing) existing.remove();

  const colorMap = {
    ai_generated: "#ef4444",
    heavy_edit: "#f97316",
    light_edit: "#eab308",
    human: "#22c55e",
  };
  const color = colorMap[verdict] || "#3b82f6";

  const toast = document.createElement("div");
  toast.id = "baloney-toast";
  toast.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "right:24px",
    "z-index:2147483647",
    "background:#0f1a2e",
    `border-left:4px solid ${color}`,
    "border-radius:8px",
    "padding:12px 16px",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "font-size:13px",
    "color:#e2e8f0",
    "box-shadow:0 4px 20px rgba(0,0,0,0.5)",
    "max-width:300px",
    "animation:baloney-toast-in 0.25s ease both",
  ].join(";");

  const style = document.createElement("style");
  style.textContent = "@keyframes baloney-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}";
  toast.appendChild(style);

  lines.forEach((line, i) => {
    const p = document.createElement("p");
    p.textContent = line;
    p.style.cssText = i === 0
      ? "font-weight:700;color:#fff;margin-bottom:4px"
      : "color:#94a3b8;font-size:11px;margin:0";
    toast.appendChild(p);
  });

  document.body.appendChild(toast);
  setTimeout(() => toast?.remove(), 5000);
}

function verdictLabel(result) {
  const pct = Math.round((result.confidence ?? 0) * 100);
  switch (result.verdict) {
    case "ai_generated": return `AI Generated \u00b7 ${pct}% confidence`;
    case "heavy_edit":   return `Heavy AI Edit \u00b7 ${pct}% confidence`;
    case "light_edit":   return `Light AI Edit \u00b7 ${pct}% confidence`;
    default:             return `Human \u00b7 ${pct}% confidence`;
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "show-result" && message.result) {
    const result = message.result;
    showToast(
      ["Baloney: Image Scan", verdictLabel(result)],
      result.verdict
    );
  }

  if (message.type === "show-text-result" && message.result) {
    const result = message.result;
    const preview = (message.text || "").slice(0, 60) + ((message.text?.length ?? 0) > 60 ? "\u2026" : "");
    showToast(
      ["Baloney: Text Check", verdictLabel(result), `"${preview}"`],
      result.verdict
    );
  }
});

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
