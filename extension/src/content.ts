// extension/src/content.ts — Baloney Content Script (v0.5.0)
// Main entry point: MutationObserver, init, message listener, ties everything together.

import {
  settings,
  loadSettings,
  initApiUrl,
  VERDICT_COLORS,
} from "./config";
import { isEnabled, isSiteAllowed, isTargetImage, canAutoScanText } from "./guards";
import { initSessionStats, updateStats, updatePageStats } from "./stats";
import { analyzeImage, scanBackgroundImages, debouncedBgScan } from "./scanners/image-scanner";
import { analyzeVideo } from "./scanners/video-scanner";
import {
  startTextAutoScan,
  stopTextAutoScan,
  observeNewTextElements,
} from "./scanners/text-scanner";
import { createDetectionDot } from "./ui/detection-dot";
import {
  createLoadingIndicator,
  ensurePageIndicator,
  addFlaggedItem,
} from "./ui/page-indicator";
import {
  showTextToastLoading,
  showTextToastResult,
  showTextToastError,
  showTextToastMinLength,
  showImageToastResult,
  setToastLastText,
  dismissTextToast,
} from "./ui/toast";
import { applyContentMode, reapplyContentMode } from "./ui/content-mode";
import type { DetectionResult } from "./types";

// ──────────────────────────────────────────────
// Session stats initialization
// ──────────────────────────────────────────────

initSessionStats();

// ──────────────────────────────────────────────
// Settings change listener
// ──────────────────────────────────────────────

chrome.storage.onChanged.addListener((changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => {
  if (changes.extensionEnabled)
    settings.extensionEnabled = changes.extensionEnabled.newValue as boolean;
  if (changes.autoScanText) {
    settings.autoScanText = changes.autoScanText.newValue as boolean;
    if (canAutoScanText()) startTextAutoScan();
    else stopTextAutoScan();
  }
  if (changes.autoScanImages) {
    settings.autoScanImages = changes.autoScanImages.newValue as boolean;
    if (settings.autoScanImages && isEnabled() && isSiteAllowed()) {
      document.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        if (!img.dataset.baloneyScanned) viewportObserver.observe(img);
      });
    }
  }
  if (changes.autoScanVideos) {
    settings.autoScanVideos = changes.autoScanVideos.newValue as boolean;
    if (settings.autoScanVideos && isEnabled() && isSiteAllowed()) {
      document.querySelectorAll<HTMLVideoElement>("video").forEach((vid) => {
        if (!vid.dataset.baloneyScanned) viewportObserver.observe(vid);
      });
    }
  }
  if (changes.contentMode) {
    settings.contentMode = changes.contentMode.newValue as "scan" | "blur" | "block";
    reapplyContentMode();
  }
  if (changes.allowedSites)
    settings.allowedSites = changes.allowedSites.newValue as string[];
});

// ──────────────────────────────────────────────
// Viewport observer (images + videos)
// ──────────────────────────────────────────────

const viewportObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;

      if (el.tagName === "IMG") {
        const img = el as HTMLImageElement;
        if (isTargetImage(img) && !img.dataset.baloneyScanned) {
          analyzeImage(img);
        }
      } else if (el.tagName === "VIDEO") {
        const vid = el as HTMLVideoElement;
        if (vid.dataset.baloneyScanned) {
          // Already scanned or pending
        } else if (vid.readyState >= 2) {
          const w = vid.videoWidth || vid.clientWidth;
          if (w > 200) {
            analyzeVideo(vid);
          }
        } else {
          const retries = parseInt(vid.dataset.baloneyRetries || "0", 10);
          if (retries < 3) {
            vid.dataset.baloneyRetries = String(retries + 1);
            const reobserve = (): void => {
              if (!vid.dataset.baloneyScanned) viewportObserver.observe(vid);
            };
            vid.addEventListener("loadeddata", reobserve, { once: true });
            vid.addEventListener("canplay", reobserve, { once: true });
            setTimeout(reobserve, 2000);
          } else if (vid.poster || vid.clientWidth > 200) {
            analyzeVideo(vid);
          }
        }
      }

      viewportObserver.unobserve(el);
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
    const img = mutation.target as HTMLImageElement;
    if (img.tagName !== "IMG") continue;

    const scanned = img.dataset.baloneyScanned;
    if (scanned && scanned !== "error") continue;

    if (isTargetImage(img)) {
      delete img.dataset.baloneyScanned;
      viewportObserver.observe(img);
    }
  }
});

function watchImageAttributes(img: HTMLImageElement): void {
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
      const el = node as HTMLElement;

      if (el.tagName === "IMG") {
        viewportObserver.observe(el);
        watchImageAttributes(el as HTMLImageElement);
      }
      if (el.tagName === "VIDEO") viewportObserver.observe(el);
      if (el.tagName === "PICTURE") {
        const innerImg = el.querySelector("img");
        if (innerImg) {
          viewportObserver.observe(innerImg);
          watchImageAttributes(innerImg);
        }
      }

      if (el.querySelectorAll) {
        el.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
          viewportObserver.observe(img);
          watchImageAttributes(img);
        });
        el.querySelectorAll<HTMLVideoElement>("video").forEach((vid) => {
          viewportObserver.observe(vid);
        });
        el.querySelectorAll("picture").forEach((pic) => {
          const innerImg = pic.querySelector("img");
          if (innerImg) {
            viewportObserver.observe(innerImg);
            watchImageAttributes(innerImg);
          }
        });

        observeNewTextElements(el);
      }
    }
  }

  debouncedBgScan();
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────

function init(): void {
  if (!isEnabled()) return;
  if (!isSiteAllowed()) return;

  createLoadingIndicator();

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  document.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
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

  document.querySelectorAll<HTMLVideoElement>("video").forEach((vid) => {
    viewportObserver.observe(vid);
  });

  if (canAutoScanText()) {
    startTextAutoScan();
  }

  scanBackgroundImages();
  ensurePageIndicator();
}

// ──────────────────────────────────────────────
// Message listeners
// ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message: Record<string, unknown>, _sender, sendResponse) => {
  // Image context menu result
  if (message.type === "show-result" && message.result) {
    const result = message.result as DetectionResult;
    const srcUrl = message.srcUrl as string | undefined;
    result.sourceUrl = srcUrl;
    result.sourcePageUrl = window.location.href;

    if (srcUrl) {
      const imgs = document.querySelectorAll<HTMLImageElement>("img");
      for (const img of imgs) {
        const imgSrc = img.src || img.currentSrc || "";
        if (imgSrc === srcUrl) {
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

    showImageToastResult(result, srcUrl || "");
  }

  // Keyboard shortcut: return selected text
  if (message.type === "get-selected-text") {
    sendResponse({ text: window.getSelection()?.toString() || "" });
    return;
  }

  // Toast card: loading state
  if (message.type === "show-text-toast-loading") {
    setToastLastText(null);
    showTextToastLoading(message.textPreview as string);
  }

  // Toast card: full result
  if (message.type === "show-text-toast-result") {
    setToastLastText((message.text as string) || null);
    showTextToastResult(
      message.result as DetectionResult,
      (message.textPreview as string) || ((message.text as string) || "").slice(0, 80),
    );
  }

  // Toast card: error
  if (message.type === "show-text-toast-error") {
    setToastLastText((message.text as string) || null);
    showTextToastError(message.errorMsg as string);
  }

  // Legacy: show-text-result -> redirect to toast card
  if (message.type === "show-text-result" && message.result) {
    setToastLastText((message.text as string) || null);
    showTextToastResult(
      message.result as DetectionResult,
      ((message.text as string) || "").slice(0, 80),
    );
  }
});

// ──────────────────────────────────────────────
// Allowed-sites page communication
// ──────────────────────────────────────────────

window.addEventListener("baloney-get-sites", () => {
  chrome.storage.local.get("allowedSites", (data: Record<string, unknown>) => {
    window.dispatchEvent(
      new CustomEvent("baloney-sites-response", {
        detail: { sites: data.allowedSites || settings.allowedSites },
      }),
    );
  });
});

window.addEventListener("baloney-update-sites", (e) => {
  const sites = (e as CustomEvent).detail?.sites;
  if (Array.isArray(sites)) {
    chrome.storage.local.set({ allowedSites: sites });
  }
});

// ──────────────────────────────────────────────
// Identity bridge: share userId with webapp via localStorage
// ──────────────────────────────────────────────

if (
  window.location.hostname === "trustlens-nu.vercel.app" ||
  window.location.hostname === "baloney.app" ||
  window.location.hostname === "localhost"
) {
  chrome.storage.local.get("userId", (data: Record<string, unknown>) => {
    if (data.userId) {
      try {
        localStorage.setItem("baloney-user-id", data.userId as string);
        window.dispatchEvent(
          new CustomEvent("baloney-userid-ready", {
            detail: { userId: data.userId },
          }),
        );
      } catch {
        // Storage access denied
      }
    }
  });
}

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────

Promise.all([loadSettings(), initApiUrl()]).then(() => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
});
