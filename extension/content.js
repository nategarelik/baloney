// extension/content.js — Baloney Content Script
// Injected into Instagram and X. Detects images in viewport, sends to backend,
// injects AI detection overlay badges.

const MIN_IMAGE_SIZE = 200; // Skip avatars, icons, UI elements
const MAX_CONCURRENT = 3;
const SCAN_DEBOUNCE_MS = 300;

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
  // Skip common non-content images
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
  // Sync to extension storage for popup
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
// Scanning animation (shimmer overlay)
// ──────────────────────────────────────────────

function showScanningIndicator(img) {
  const parent = img.parentElement;
  if (!parent) return;

  const overlay = document.createElement("div");
  overlay.className = "baloney-scanning";

  const label = document.createElement("div");
  label.className = "baloney-scanning-label";
  label.textContent = "Scanning...";

  overlay.appendChild(label);
  parent.appendChild(overlay);
}

function removeScanningIndicator(img) {
  const parent = img.parentElement;
  if (!parent) return;
  const overlay = parent.querySelector(".baloney-scanning");
  if (overlay) overlay.remove();
}

// ──────────────────────────────────────────────
// Content filtering helpers
// ──────────────────────────────────────────────

function shouldFilter(verdict) {
  return verdict === "ai_generated" || verdict === "heavy_edit";
}

function applyFilter(targetEl, verdict) {
  if (!shouldFilter(verdict)) return;

  // Clean up any previous filter state
  removeFilter(targetEl);

  if (filterMode === "blur") {
    targetEl.classList.add("baloney-filtered");

    // Ensure parent is positioned for the overlay
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
    // Hide the closest article/container or the element itself
    const container = targetEl.closest("article, [role='article'], .post, .tweet") || targetEl;
    container.classList.add("baloney-hidden");
    container.dataset.baloneyHiddenBy = "filter";
  }
}

function removeFilter(targetEl) {
  targetEl.classList.remove("baloney-filtered", "baloney-revealed");

  // Remove blur-reveal overlay from parent
  const parent = targetEl.parentElement;
  if (parent) {
    const overlay = parent.querySelector("[data-baloney-reveal]");
    if (overlay) overlay.remove();
  }

  // Unhide containers
  const container = targetEl.closest("[data-baloney-hidden-by='filter']");
  if (container) {
    container.classList.remove("baloney-hidden");
    delete container.dataset.baloneyHiddenBy;
  }
}

function reapplyFilterMode() {
  // Re-process all scanned images
  document.querySelectorAll("img[data-baloney-scanned]").forEach((img) => {
    const verdict = img.dataset.baloneyScanned;
    if (!verdict || verdict === "pending" || verdict === "error") return;

    removeFilter(img);
    applyFilter(img, verdict);
  });

  // Re-process all scanned text blocks
  document.querySelectorAll("[data-baloney-text-scanned]").forEach((el) => {
    const verdict = el.dataset.baloneyTextScanned;
    if (!verdict || verdict === "pending" || verdict === "error") return;

    removeFilter(el);
    applyFilter(el, verdict);
  });
}

// ──────────────────────────────────────────────
// Badge injection
// ──────────────────────────────────────────────

function findVisibleAncestor(img) {
  // Walk up the DOM to find an ancestor that won't clip the badge
  let el = img.parentElement;
  let depth = 0;
  while (el && depth < 4) {
    const style = window.getComputedStyle(el);
    if (style.overflow === "hidden" || style.overflow === "clip") {
      el = el.parentElement;
      depth++;
      continue;
    }
    return el;
  }
  return img.parentElement;
}

function injectBadge(img, result) {
  const parent = findVisibleAncestor(img);
  if (!parent) return;

  const parentPosition = window.getComputedStyle(parent).position;
  if (parentPosition === "static") {
    parent.style.position = "relative";
  }

  const badge = document.createElement("div");
  badge.className = "baloney-badge";

  if (result.verdict === "ai_generated") {
    badge.classList.add("baloney-badge--ai");
    badge.textContent = `AI ${Math.round(result.confidence * 100)}%`;
  } else if (result.verdict === "heavy_edit") {
    badge.classList.add("baloney-badge--heavy-edit");
    badge.textContent = "\u26A0 Heavy Edit";
  } else if (result.verdict === "light_edit") {
    badge.classList.add("baloney-badge--light-edit");
    badge.textContent = "~ Light Edit";
  } else {
    badge.classList.add("baloney-badge--human");
    badge.textContent = "\u2713 Human";
  }

  parent.appendChild(badge);
}

// ──────────────────────────────────────────────
// Image analysis pipeline
// ──────────────────────────────────────────────

async function analyzeImage(img) {
  if (img.dataset.baloneyScanned) return;
  img.dataset.baloneyScanned = "pending";

  showScanningIndicator(img);

  try {
    const result = await requestQueue.add(async () => {
      // Send image URL to background worker (bypasses CORS)
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

    removeScanningIndicator(img);

    if (result && result.verdict) {
      img.dataset.baloneyScanned = result.verdict;
      injectBadge(img, result);
      applyFilter(img, result.verdict);
      updateStats(result.verdict);
      updatePageStats("images", result.verdict);
    }
  } catch (error) {
    removeScanningIndicator(img);
    console.error("[Baloney] Analysis failed:", error);
    img.dataset.baloneyScanned = "error";
  }
}

// ──────────────────────────────────────────────
// Text block scanning
// ──────────────────────────────────────────────

const TEXT_SELECTORS = "p, article, [role='article'], blockquote, .post-content, .entry-content, .article-body, .story-body";
const MIN_TEXT_LENGTH = 100;
const SKIP_CONTAINERS = ["nav", "header", "footer", "aside", "script", "style", "noscript"];

function isValidTextBlock(el) {
  // Skip navigation, headers, footers
  const parent = el.closest(SKIP_CONTAINERS.join(","));
  if (parent) return false;

  const text = el.innerText?.trim() || "";
  if (text.length < MIN_TEXT_LENGTH) return false;
  if (el.dataset.baloneyTextScanned) return false;

  return true;
}

function injectTextOverlay(el, result) {
  el.style.position = "relative";

  const colorMap = {
    ai_generated: { border: "#ef4444", bg: "rgba(239,68,68,0.08)" },
    heavy_edit: { border: "#f97316", bg: "rgba(249,115,22,0.08)" },
    light_edit: { border: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
    human: { border: "#22c55e", bg: "rgba(34,197,94,0.06)" },
  };
  const colors = colorMap[result.verdict] || colorMap.human;

  el.style.borderLeft = `4px solid ${colors.border}`;
  el.style.paddingLeft = "12px";
  el.style.backgroundColor = colors.bg;
  el.style.borderRadius = "4px";
  el.style.transition = "all 0.3s ease";

  // Small verdict badge
  const badge = document.createElement("span");
  badge.className = "baloney-text-badge";
  badge.style.cssText = `
    position:absolute; top:4px; right:4px; z-index:9999;
    padding:2px 6px; border-radius:10px; font-size:10px; font-weight:700;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    pointer-events:none; animation:baloney-badge-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    background:${colors.border}; color:#fff;
  `;

  const pct = Math.round((result.confidence || 0) * 100);
  if (result.verdict === "ai_generated") badge.textContent = `AI ${pct}%`;
  else if (result.verdict === "heavy_edit") badge.textContent = `Edit ${pct}%`;
  else if (result.verdict === "light_edit") badge.textContent = `~ ${pct}%`;
  else badge.textContent = "\u2713 Human";

  el.appendChild(badge);
}

async function analyzeTextBlock(el) {
  if (el.dataset.baloneyTextScanned) return;
  el.dataset.baloneyTextScanned = "pending";

  const text = el.innerText?.trim();
  if (!text || text.length < MIN_TEXT_LENGTH) return;

  try {
    const result = await requestQueue.add(async () => {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "analyze-text", text: text.slice(0, 2000) },
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
      el.dataset.baloneyTextScanned = result.verdict;
      injectTextOverlay(el, result);
      applyFilter(el, result.verdict);
      updateTextStats(result.verdict);
      updatePageStats("text", result.verdict);
    }
  } catch (error) {
    console.error("[Baloney] Text analysis failed:", error);
    el.dataset.baloneyTextScanned = "error";
  }
}

// Text viewport observer
const textObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (isValidTextBlock(el) && !el.dataset.baloneyTextScanned) {
          analyzeTextBlock(el);
        }
        textObserver.unobserve(el);
      }
    }
  },
  { threshold: 0.3 }
);

// ──────────────────────────────────────────────
// Viewport observer (only scan visible images)
// ──────────────────────────────────────────────

const viewportObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (isTargetImage(img) && !img.dataset.baloneyScanned) {
          analyzeImage(img);
        }
        viewportObserver.unobserve(img);
      }
    }
  },
  { threshold: 0.5 }
);

// ──────────────────────────────────────────────
// DOM observer (watch for new images as user scrolls)
// ──────────────────────────────────────────────

const domObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      // Check if the added node is an image
      if (node.tagName === "IMG") {
        viewportObserver.observe(node);
      }

      // Check for images inside the added node
      const images = node.querySelectorAll?.("img");
      if (images) {
        images.forEach((img) => viewportObserver.observe(img));
      }

      // Check for text blocks inside added nodes
      if (node.querySelectorAll) {
        const textBlocks = node.querySelectorAll(TEXT_SELECTORS);
        textBlocks.forEach((el) => {
          if (isValidTextBlock(el)) textObserver.observe(el);
        });
      }
    }
  }
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

function init() {
  console.log("[Baloney] Content script loaded");

  // Observe future DOM changes
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Scan existing images
  document.querySelectorAll("img").forEach((img) => {
    viewportObserver.observe(img);
  });

  // Scan existing text blocks
  document.querySelectorAll(TEXT_SELECTORS).forEach((el) => {
    if (isValidTextBlock(el)) textObserver.observe(el);
  });
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
    case "ai_generated": return `AI Generated · ${pct}% confidence`;
    case "heavy_edit":   return `Heavy AI Edit · ${pct}% confidence`;
    case "light_edit":   return `Light AI Edit · ${pct}% confidence`;
    default:             return `Human · ${pct}% confidence`;
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
    const preview = (message.text || "").slice(0, 60) + ((message.text?.length ?? 0) > 60 ? "…" : "");
    showToast(
      ["Baloney: Text Check", verdictLabel(result), `"${preview}"`],
      result.verdict
    );
  }
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

// Wait for page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
