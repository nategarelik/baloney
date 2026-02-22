"use client";

import { useState, useEffect } from "react";
import type { SlopIndexEntry } from "@/lib/types";

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-400",
  A: "text-emerald-400",
  B: "text-green-400",
  C: "text-yellow-400",
  "C-": "text-amber-400",
  D: "text-orange-400",
  "D-": "text-orange-500",
  F: "text-red-500",
};

const TREND_ICONS: Record<string, string> = {
  rising: "↑",
  falling: "↓",
  stable: "→",
};

const TREND_COLORS: Record<string, string> = {
  rising: "text-red-400",
  falling: "text-green-400",
  stable: "text-secondary/50",
};

export function SlopIndexCard() {
  const [entries, setEntries] = useState<SlopIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/slop-index")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-base-dark rounded-xl p-6 border border-secondary/10 animate-pulse">
        <div className="h-6 bg-secondary/8 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-secondary/8 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-base-dark rounded-xl p-6 border border-secondary/10">
        <h3 className="text-lg font-semibold text-secondary mb-2">AI Slop Index</h3>
        <p className="text-secondary/50 text-sm">
          No platform data available yet. Run the seed to populate.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-base-dark rounded-xl p-6 border border-secondary/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary">AI Slop Index</h3>
        <span className="text-xs text-secondary/50">Platform Report Card</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {entries.map((entry) => (
          <div
            key={entry.platform}
            className="bg-secondary/5 rounded-lg p-4 border border-secondary/10 hover:border-accent/30 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary/70 capitalize">
                {entry.platform === "x"
                  ? "𝕏 (Twitter)"
                  : entry.platform.replace("_", " ")}
              </span>
              <span
                className={`text-xs font-medium ${TREND_COLORS[entry.trend_direction]}`}
              >
                {TREND_ICONS[entry.trend_direction]} {entry.trend_direction}
              </span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <span
                className={`text-3xl font-black ${GRADE_COLORS[entry.grade] ?? "text-secondary/50"}`}
              >
                {entry.grade}
              </span>
              <span className="text-secondary/50 text-xs mb-1">
                {entry.grade_label}
              </span>
            </div>
            <div className="w-full bg-secondary/8 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(entry.slop_score, 100)}%`,
                  background:
                    entry.slop_score > 50
                      ? "#ef4444"
                      : entry.slop_score > 25
                        ? "#f59e0b"
                        : "#22c55e",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary/50">
              <span>Score: {entry.slop_score}/100</span>
              <span>{entry.total_scans_7d} scans/7d</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
