// extension/src/scanners/text-scanner.ts — Text selection detection + auto-scan

import { VERDICT_COLORS } from "../config";
import { requestQueue } from "../request-queue";
import { updateTextStats, updatePageStats } from "../stats";
import { createDetectionDot } from "../ui/detection-dot";
import { addFlaggedItem } from "../ui/page-indicator";
import type { DetectionResult } from "../types";

export const TEXT_SELECTORS =
  "p, article, [role='article'], .tweet-text, .feed-shared-update-v2__description, " +
  "[data-testid='tweetText'], .post-content, .entry-content, .article-body, " +
  "[data-testid='post-content'], .md, [slot='text-body'], " +
  ".pw-post-body-paragraph, .graf, " +
  "[data-ad-comet-preview='message'], [data-ad-preview='message'], " +
  ".feed-shared-text, .update-components-text, " +
  ".body.markup, .post-content-final, " +
  ".story-body, .article-text, .post-body, [itemprop='articleBody']";

let textObserver: IntersectionObserver | null = null;

function autoScanTextNodes(elements: HTMLElement[]): void {
  const toScan: HTMLElement[] = [];

  for (const el of elements) {
    if (el.dataset.baloneyTextScanned) continue;
    const text = (el.innerText || "").trim();
    if (text.length < 100) continue;
    el.dataset.baloneyTextScanned = "1";
    toScan.push(el);
  }

  for (const el of toScan) {
    const text = (el.innerText || "").trim().slice(0, 2000);

    requestQueue.add(async () => {
      try {
        const result = await new Promise<DetectionResult>((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: "analyze-text", text },
            (response: unknown) => {
              if (chrome.runtime.lastError)
                reject(new Error(chrome.runtime.lastError.message));
              else resolve(response as DetectionResult);
            },
          );
        });

        if (result && result.verdict && result.verdict !== "unavailable") {
          result.sourcePageUrl = window.location.href;

          const pos = window.getComputedStyle(el).position;
          if (pos === "static") el.style.position = "relative";

          createDetectionDot(el, result);

          if (result.verdict === "ai_generated" || result.verdict === "heavy_edit") {
            const color = VERDICT_COLORS[result.verdict] || "#d4456b";
            el.style.borderLeft = `3px solid ${color}`;
            el.style.paddingLeft = el.style.paddingLeft || "8px";
          }

          addFlaggedItem(el, result.verdict, "Text: " + text.slice(0, 40) + "\u2026");
          updateTextStats(result.verdict);
          updatePageStats("text", result.verdict);
        }
      } catch (error) {
        console.error("[Baloney] Auto text scan failed:", error);
      }
    });
  }
}

export function startTextAutoScan(): void {
  if (textObserver) return;

  textObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement);
      if (visible.length > 0) {
        autoScanTextNodes(visible);
        for (const el of visible) {
          textObserver?.unobserve(el);
        }
      }
    },
    { threshold: 0.3 },
  );

  document.querySelectorAll<HTMLElement>(TEXT_SELECTORS).forEach((el) => {
    if (!el.dataset.baloneyTextScanned) textObserver?.observe(el);
  });
}

export function stopTextAutoScan(): void {
  if (textObserver) {
    textObserver.disconnect();
    textObserver = null;
  }
}

export function observeNewTextElements(parentNode: Element): void {
  if (!textObserver) return;
  parentNode.querySelectorAll<HTMLElement>(TEXT_SELECTORS).forEach((el) => {
    if (!el.dataset.baloneyTextScanned) textObserver?.observe(el);
  });
}
