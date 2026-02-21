// extension/content.js — TrustLens Content Script
// Injected into Instagram and X. Detects images in viewport, sends to backend,
// injects AI detection overlay badges.

const MIN_IMAGE_SIZE = 200; // Skip avatars, icons, UI elements
const MAX_CONCURRENT = 3;
const SCAN_DEBOUNCE_MS = 300;

// ──────────────────────────────────────────────
// CDN pattern matching (resilient to UI changes)
// ──────────────────────────────────────────────

const CDN_PATTERNS = [
  /cdninstagram\.com/,
  /fbcdn\.net/,
  /pbs\.twimg\.com/,
  /video\.twimg\.com/,
];

function isTargetImage(img) {
  const src = img.src || img.currentSrc || "";
  if (!src || src.startsWith("data:")) return false;
  if (img.naturalWidth < MIN_IMAGE_SIZE || img.naturalHeight < MIN_IMAGE_SIZE) return false;
  return CDN_PATTERNS.some((pattern) => pattern.test(src));
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

let sessionStats = { scanned: 0, flaggedAI: 0 };

function updateStats(verdict) {
  sessionStats.scanned++;
  if (verdict === "ai_generated") sessionStats.flaggedAI++;
  // Sync to extension storage for popup
  chrome.storage.local.set({ sessionStats });
}

// ──────────────────────────────────────────────
// Scanning animation (shimmer overlay)
// ──────────────────────────────────────────────

function showScanningIndicator(img) {
  const parent = img.parentElement;
  if (!parent) return;

  const overlay = document.createElement("div");
  overlay.className = "trustlens-scanning";

  const label = document.createElement("div");
  label.className = "trustlens-scanning-label";
  label.textContent = "Scanning...";

  overlay.appendChild(label);
  parent.appendChild(overlay);
}

function removeScanningIndicator(img) {
  const parent = img.parentElement;
  if (!parent) return;
  const overlay = parent.querySelector(".trustlens-scanning");
  if (overlay) overlay.remove();
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
  badge.className = "trustlens-badge";

  if (result.verdict === "ai_generated") {
    badge.classList.add("trustlens-badge--ai");
    badge.textContent = `AI ${Math.round(result.confidence * 100)}%`;
  } else if (result.verdict === "likely_human") {
    badge.classList.add("trustlens-badge--human");
    badge.textContent = "\u2713 Human";
  } else {
    badge.classList.add("trustlens-badge--unclear");
    badge.textContent = "? Unclear";
  }

  parent.appendChild(badge);
}

// ──────────────────────────────────────────────
// Image analysis pipeline
// ──────────────────────────────────────────────

async function analyzeImage(img) {
  if (img.dataset.trustlensScanned) return;
  img.dataset.trustlensScanned = "pending";

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
      img.dataset.trustlensScanned = result.verdict;
      injectBadge(img, result);
      updateStats(result.verdict);
    }
  } catch (error) {
    removeScanningIndicator(img);
    console.error("[TrustLens] Analysis failed:", error);
    img.dataset.trustlensScanned = "error";
  }
}

// ──────────────────────────────────────────────
// Viewport observer (only scan visible images)
// ──────────────────────────────────────────────

const viewportObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (isTargetImage(img) && !img.dataset.trustlensScanned) {
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
    }
  }
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

function init() {
  console.log("[TrustLens] Content script loaded");

  // Observe future DOM changes
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Scan existing images
  document.querySelectorAll("img").forEach((img) => {
    viewportObserver.observe(img);
  });
}

// Wait for page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
