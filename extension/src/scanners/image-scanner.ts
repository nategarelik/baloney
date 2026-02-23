// extension/src/scanners/image-scanner.ts — Image analysis pipeline + IntersectionObserver

import { canScanImages } from "../guards";
import { requestQueue } from "../request-queue";
import { updateStats, updatePageStats } from "../stats";
import { createDetectionDot } from "../ui/detection-dot";
import { addFlaggedItem } from "../ui/page-indicator";
import { applyContentMode } from "../ui/content-mode";
import type { DetectionResult } from "../types";

export async function analyzeImage(img: HTMLImageElement): Promise<void> {
  if (!canScanImages()) return;
  if (img.dataset.baloneyScanned) return;
  img.dataset.baloneyScanned = "pending";

  try {
    const result = await requestQueue.add(async () => {
      const response = await new Promise<DetectionResult>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "analyze-image", url: img.src || img.currentSrc },
          (response: unknown) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response as DetectionResult);
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

// CSS Background Image Detection
const BG_SELECTORS =
  ".hero, [class*='cover'], [class*='banner'], header, [role='banner'], " +
  "[class*='background'], [class*='hero'], [class*='jumbotron'], [class*='masthead']";

const scannedBgElements = new WeakSet<Element>();
let bgScanTimer: ReturnType<typeof setTimeout> | null = null;

export function scanBackgroundImages(): void {
  if (!canScanImages()) return;

  let found = 0;
  const elements = document.querySelectorAll(BG_SELECTORS);

  for (const el of elements) {
    if (found >= 10) break;
    if (scannedBgElements.has(el)) continue;

    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (!bgImage || bgImage === "none") continue;

    const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (!urlMatch?.[1]) continue;

    const url = urlMatch[1];
    if (url.startsWith("data:") && url.length < 10000) continue;

    scannedBgElements.add(el);
    found++;

    requestQueue.add(async () => {
      try {
        const result = await new Promise<DetectionResult>((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: "analyze-image", url },
            (response: unknown) => {
              if (chrome.runtime.lastError)
                reject(new Error(chrome.runtime.lastError.message));
              else resolve(response as DetectionResult);
            },
          );
        });

        if (result && result.verdict) {
          result.sourceUrl = url;
          result.sourcePageUrl = window.location.href;
          createDetectionDot(el, result);
          addFlaggedItem(el, result.verdict, "Background: " + url.slice(0, 40));
          applyContentMode(el as HTMLElement, result.verdict);
          updateStats(result.verdict);
          updatePageStats("images", result.verdict);
        }
      } catch (error) {
        console.warn("[Baloney] Background image scan failed:", error);
      }
    });
  }
}

export function debouncedBgScan(): void {
  if (bgScanTimer) clearTimeout(bgScanTimer);
  bgScanTimer = setTimeout(scanBackgroundImages, 1000);
}
