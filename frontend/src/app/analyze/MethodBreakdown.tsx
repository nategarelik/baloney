"use client";

import type { MethodScore } from "@/lib/types";

interface MethodBreakdownProps {
  methodScores: Record<string, MethodScore>;
  type: "text" | "image" | "video";
}

function scoreColor(score: number): string {
  if (score > 0.65) return "#d4456b"; // AI red
  if (score > 0.35) return "#f59e0b"; // uncertain amber
  return "#16a34a"; // human green
}

export function MethodBreakdown({ methodScores, type }: MethodBreakdownProps) {
  const entries = Object.entries(methodScores)
    .filter(([, v]) => v.available)
    .sort((a, b) => b[1].weight - a[1].weight);

  if (entries.length === 0) return null;

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
      <h2 className="font-display text-xl text-secondary mb-1">
        Method Breakdown
      </h2>
      <p className="text-secondary/50 text-xs mb-4">
        {type === "text" ? "Text" : type === "image" ? "Image" : "Video"} detection
        — {entries.length} signal{entries.length > 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {entries.map(([key, method]) => {
          const pct = Math.round(method.score * 100);
          const weightPct = Math.round(method.weight * 100);
          const color = scoreColor(method.score);
          const isSynthID = key.startsWith("synthid");

          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-secondary/70 flex items-center gap-1.5">
                  {method.label}
                  {isSynthID && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                      WATERMARK
                    </span>
                  )}
                </span>
                <span className="text-secondary/50 text-xs tabular-nums">
                  {pct}% AI · {weightPct}% weight
                </span>
              </div>
              <div className="h-2.5 bg-secondary/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight total sanity check */}
      <div className="mt-4 pt-3 border-t border-secondary/8 flex justify-between text-xs text-secondary/40">
        <span>
          Ensemble: {entries.length} method{entries.length > 1 ? "s" : ""}
        </span>
        <span>
          Total weight: {Math.round(entries.reduce((s, [, m]) => s + m.weight, 0) * 100)}%
        </span>
      </div>
    </div>
  );
}
