// extension/src/stats.ts — Session and page statistics tracking

import type { SessionStats, PageStat } from "./types";

export const sessionStats: SessionStats = {
  scanned: 0,
  flaggedAI: 0,
  textScanned: 0,
  textFlagged: 0,
};

export function initSessionStats(): void {
  chrome.storage.local.get("sessionStats", (data: Record<string, unknown>) => {
    const stored = data.sessionStats as Partial<SessionStats> | undefined;
    if (stored) {
      Object.assign(sessionStats, stored);
    }
  });
}

export function updateStats(verdict: string): void {
  sessionStats.scanned++;
  if (verdict === "ai_generated" || verdict === "heavy_edit")
    sessionStats.flaggedAI++;
  chrome.storage.local.set({ sessionStats });
}

export function updateTextStats(verdict: string): void {
  sessionStats.textScanned++;
  if (verdict === "ai_generated" || verdict === "heavy_edit")
    sessionStats.textFlagged++;
  chrome.storage.local.set({ sessionStats });
}

const pageHostname = window.location.hostname;

export function updatePageStats(type: "images" | "text", verdict: string): void {
  chrome.storage.local.get("pageStats", (data: Record<string, unknown>) => {
    const pageStats = (data.pageStats || {}) as Record<string, PageStat>;
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
