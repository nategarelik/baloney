// extension/src/ui/page-indicator.ts — Floating page indicator, loading dots, page scan panel

import { VERDICT_COLORS } from "../config";
import { sessionStats } from "../stats";
import type { FlaggedItem } from "../types";

export const flaggedItems: FlaggedItem[] = [];
let pageIndicator: HTMLDivElement | null = null;
let pagePanel: HTMLDivElement | null = null;
let loadingIndicator: HTMLDivElement | null = null;
let hasFirstDetection = false;

export function createLoadingIndicator(): void {
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

function transitionToCounter(): void {
  if (hasFirstDetection) return;
  hasFirstDetection = true;

  if (loadingIndicator) {
    loadingIndicator.classList.add("baloney-loading-indicator--hidden");
    loadingIndicator.addEventListener(
      "transitionend",
      () => {
        loadingIndicator?.remove();
        loadingIndicator = null;
      },
      { once: true },
    );
  }

  ensurePageIndicator();
  pageIndicator?.classList.add("baloney-page-indicator--fade-in");
}

export function ensurePageIndicator(): void {
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

export function getPageIndicator(): HTMLDivElement | null {
  return pageIndicator;
}

function updatePageIndicator(): void {
  ensurePageIndicator();
  if (!pageIndicator || !pagePanel) return;

  const count = flaggedItems.length;
  pageIndicator.textContent = String(count);

  pageIndicator.classList.remove(
    "baloney-page-indicator--clean",
    "baloney-page-indicator--warn",
    "baloney-page-indicator--alert",
  );
  if (count === 0) pageIndicator.classList.add("baloney-page-indicator--clean");
  else if (count <= 3) pageIndicator.classList.add("baloney-page-indicator--warn");
  else pageIndicator.classList.add("baloney-page-indicator--alert");

  // Clear panel and rebuild with safe DOM
  while (pagePanel.firstChild) {
    pagePanel.removeChild(pagePanel.firstChild);
  }

  // Stats header
  const totalScanned = sessionStats.scanned + sessionStats.textScanned;
  const totalFlagged = sessionStats.flaggedAI + sessionStats.textFlagged;
  const aiRate = totalScanned > 0 ? Math.round((totalFlagged / totalScanned) * 100) : 0;

  const statsHeader = document.createElement("div");
  statsHeader.className = "baloney-page-stats";

  const statEntries: Array<{ value: string; label: string }> = [
    { value: String(totalScanned), label: "Scanned" },
    { value: String(totalFlagged), label: "Flagged" },
    { value: `${aiRate}%`, label: "AI Rate" },
  ];

  for (const entry of statEntries) {
    const stat = document.createElement("div");
    stat.className = "baloney-page-stat";

    const valEl = document.createElement("div");
    valEl.className = "baloney-page-stat-value";
    valEl.textContent = entry.value;

    const labelEl = document.createElement("div");
    labelEl.className = "baloney-page-stat-label";
    labelEl.textContent = entry.label;

    stat.appendChild(valEl);
    stat.appendChild(labelEl);
    statsHeader.appendChild(stat);
  }
  pagePanel.appendChild(statsHeader);

  const title = document.createElement("div");
  title.className = "baloney-page-panel__title";
  title.textContent = `Flagged Items (${count})`;
  pagePanel.appendChild(title);

  for (const item of flaggedItems) {
    const row = document.createElement("div");
    row.className = "baloney-page-panel__item";

    const dot = document.createElement("div");
    dot.className = "baloney-page-panel__item-dot";
    dot.style.background = VERDICT_COLORS[item.verdict] || "#4a3728";

    const textEl = document.createElement("span");
    textEl.className = "baloney-page-panel__item-text";
    textEl.textContent = item.preview;

    row.appendChild(dot);
    row.appendChild(textEl);
    row.addEventListener("click", () => {
      item.element.scrollIntoView({ behavior: "smooth", block: "center" });
      pagePanel?.classList.remove("open");
    });
    pagePanel.appendChild(row);
  }
}

function togglePagePanel(): void {
  if (!pagePanel) return;
  const isOpen = pagePanel.classList.contains("open");
  if (isOpen) {
    pagePanel.classList.remove("open");
  } else {
    const totalScanned = sessionStats.scanned + sessionStats.textScanned;
    if (totalScanned > 0) {
      pagePanel.classList.add("open");
    }
  }
}

export function addFlaggedItem(element: Element, verdict: string, preview: string): void {
  transitionToCounter();
  if (verdict === "ai_generated" || verdict === "heavy_edit") {
    flaggedItems.push({ element, verdict, preview });
    updatePageIndicator();
  }
}
