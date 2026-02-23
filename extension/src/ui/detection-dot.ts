// extension/src/ui/detection-dot.ts — Detection dot overlay for scanned elements

import { VERDICT_COLORS } from "../config";
import type { DetectionResult } from "../types";

function getDotColor(confidence: number): string {
  if (confidence >= 0.8) return "#d4456b";
  if (confidence >= 0.7) return "#f97316";
  return "#f59e0b";
}

function getDotOpacity(confidence: number): number {
  return Math.min(0.55 + confidence * 0.3, 0.85);
}

export function openSidepanel(result: DetectionResult, type: string): void {
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

export function createDetectionDot(el: Element, result: DetectionResult): HTMLDivElement | null {
  if (result.confidence < 0.5 && result.verdict !== "ai_generated") return null;

  const confidence = result.confidence || 0;
  const pct = Math.round(confidence * 100);
  const color = VERDICT_COLORS[result.verdict] || getDotColor(confidence);
  const opacity = getDotOpacity(confidence);

  const isMedia = el.tagName === "IMG" || el.tagName === "VIDEO";
  const dotContainer = isMedia ? el.parentElement : el;

  if (dotContainer) {
    const pos = window.getComputedStyle(dotContainer).position;
    if (pos === "static") (dotContainer as HTMLElement).style.position = "relative";
  }

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
  dot.className = "baloney-dot" + (methodNames ? " baloney-dot--has-methods" : "");
  dot.style.background = color;
  dot.style.opacity = String(opacity);

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
