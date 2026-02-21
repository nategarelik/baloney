// frontend/src/lib/constants.ts — TrustLens constants

import type { Verdict } from "./types";

export const DEMO_USER_ID = "demo-user-001";

// Badge colors matching extension/styles.css exactly
export const VERDICT_COLORS: Record<
  Verdict,
  { bg: string; border: string; label: string }
> = {
  ai_generated: {
    bg: "rgba(220, 38, 38, 0.85)",
    border: "rgba(255, 100, 100, 0.4)",
    label: "AI",
  },
  likely_human: {
    bg: "rgba(22, 163, 74, 0.80)",
    border: "rgba(100, 255, 150, 0.3)",
    label: "Human",
  },
  inconclusive: {
    bg: "rgba(202, 138, 4, 0.80)",
    border: "rgba(255, 200, 50, 0.3)",
    label: "Unclear",
  },
};

// Tailwind class variants for badges
export const VERDICT_CLASSES: Record<Verdict, string> = {
  ai_generated: "bg-red-600/85 border-red-400/40",
  likely_human: "bg-green-600/80 border-green-400/30",
  inconclusive: "bg-amber-600/80 border-amber-400/30",
};

// Recharts colors
export const CHART_COLORS = {
  ai: "#ef4444",
  human: "#22c55e",
  unclear: "#f59e0b",
  accent: "#3b82f6",
  slate: "#64748b",
  navy: "#1a2744",
  navyLighter: "#1e3a5f",
  axisLabel: "#94a3b8",
  gridLine: "#1e3a5f",
} as const;

// Recharts tooltip — shared across all chart components
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#1a2744",
  border: "1px solid #1e3a5f",
  borderRadius: "8px",
  color: "#fff",
} as const;

// API input validation bounds
export const API_LIMITS = {
  DAYS_MIN: 1,
  DAYS_MAX: 365,
  LIMIT_MIN: 1,
  LIMIT_MAX: 200,
  TEXT_MAX_LENGTH: 50_000,
  OFFSET_MAX: 10_000,
} as const;

// Baloney brand colors (for use in JS/charts)
export const BALONEY_COLORS = {
  base: "#f0e6ca",
  baseDark: "#e6d9b8",
  primary: "#d4456b",
  secondary: "#4a3728",
  accent: "#e8c97a",
} as const;

// Tracker chart colors
export const TRACKER_CHART_COLORS = {
  line: "#d4456b",
  fill: "#d4456b",
  grid: "rgba(74,55,40,0.1)",
  axis: "#4a3728",
  tooltipBg: "#f0e6ca",
  tooltipBorder: "rgba(74,55,40,0.15)",
} as const;

// Platform list for AI Tracker (easily extensible)
export const TRACKER_PLATFORMS = [
  { id: "x", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "substack", label: "Substack" },
] as const;

// Content types for AI Tracker
export const TRACKER_CONTENT_TYPES = ["text", "image", "video"] as const;

export const FEED_TIMEOUT_MS = 5000;
export const MAX_CONCURRENT_REQUESTS = 3;

// Request queue — ported from extension/content.js:32-53
export class RequestQueue {
  private max: number;
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number) {
    this.max = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.max) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      if (this.queue.length > 0) {
        this.queue.shift()!();
      }
    }
  }
}
