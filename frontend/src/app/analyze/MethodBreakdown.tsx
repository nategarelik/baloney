"use client";

import type { MethodScore } from "@/lib/types";

interface MethodBreakdownProps {
  methodScores: Record<string, MethodScore>;
  type: "text" | "image" | "video";
  modelUsed?: string;
  primaryAvailable?: boolean;
  confidenceCapped?: boolean;
}

function scoreColor(score: number): string {
  if (score > 0.65) return "#d4456b"; // AI red
  if (score > 0.35) return "#f59e0b"; // uncertain amber
  return "#16a34a"; // human green
}

function statusLabel(status?: string): string {
  switch (status) {
    case "unavailable":
      return "Unavailable";
    case "rate_limited":
      return "Rate Limited";
    case "error":
      return "Error";
    case "not_run":
      return "Not Run";
    default:
      return "Unavailable";
  }
}

function parsePipelineDescription(model: string): string | null {
  if (!model) return null;
  const parts: string[] = [];
  const lower = model.toLowerCase();

  if (lower.includes("pangram")) parts.push("Pangram API primary");
  if (lower.includes("sightengine")) parts.push("SightEngine primary");
  if (lower.includes("synthid") && lower.includes("watermark"))
    parts.push("SynthID watermark detected");
  else if (lower.includes("synthid")) parts.push("SynthID checked");
  if (lower.includes("reality") || lower.includes("defender"))
    parts.push("Reality Defender escalation");
  if (lower.includes("multi-frame")) {
    const match = model.match(/multi-frame\((\d+)\)/);
    if (match) parts.push(`${match[1]}-frame analysis`);
    else parts.push("Multi-frame analysis");
  }

  return parts.length > 0 ? parts.join(", ") : null;
}

export function MethodBreakdown({
  methodScores,
  type,
  modelUsed,
  primaryAvailable,
  confidenceCapped,
}: MethodBreakdownProps) {
  // Filter out fallback-tier methods when primary is available (they have 0% weight anyway),
  // then sort: available methods first (by weight desc), then unavailable methods (by weight desc)
  const entries = Object.entries(methodScores)
    .filter(([, v]) => {
      if (primaryAvailable && v.tier === "fallback") return false;
      return true;
    })
    .sort((a, b) => {
      if (a[1].available !== b[1].available) return a[1].available ? -1 : 1;
      return b[1].weight - a[1].weight;
    });

  if (entries.length === 0) return null;

  const availableCount = entries.filter(([, v]) => v.available).length;
  const pipelineDesc = modelUsed ? parsePipelineDescription(modelUsed) : null;

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
      <h2 className="font-display text-xl text-secondary mb-1">
        Method Breakdown
      </h2>
      <p className="text-secondary/50 text-xs mb-1">
        {type === "text" ? "Text" : type === "image" ? "Image" : "Video"}{" "}
        detection — {availableCount} of {entries.length} signal
        {entries.length > 1 ? "s" : ""} active
      </p>
      {pipelineDesc && (
        <p className="text-secondary/30 text-[10px] mb-4">
          Pipeline: {pipelineDesc}
        </p>
      )}
      {!pipelineDesc && <div className="mb-3" />}

      {primaryAvailable === false && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-amber-700 text-xs font-semibold">
            Primary model unavailable — reduced confidence
          </p>
          <p className="text-amber-600/70 text-[10px] mt-0.5">
            Results from fallback ensemble.
            {confidenceCapped && " Confidence capped at 60%."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(([key, method]) => {
          const isAvailable = method.available;
          const pct = isAvailable ? Math.round(method.score * 100) : 0;
          const weightPct = Math.round(method.weight * 100);
          const color = isAvailable ? scoreColor(method.score) : "#6b7280";

          return (
            <div key={key} style={{ opacity: isAvailable ? 1 : 0.4 }}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-secondary/70 flex items-center gap-1.5">
                  {method.label}
                  {method.tier === "primary" && isAvailable && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-700 font-semibold">
                      PRIMARY
                    </span>
                  )}
                  {method.tier === "watermark" && isAvailable && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                      WATERMARK
                    </span>
                  )}
                </span>
                <span className="text-secondary/50 text-xs tabular-nums">
                  {isAvailable
                    ? `${pct}% AI · ${weightPct}% weight`
                    : statusLabel(method.status)}
                </span>
              </div>
              <div className="h-3 bg-secondary/8 rounded-full overflow-hidden">
                {isAvailable ? (
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      opacity: 0.85,
                    }}
                  />
                ) : (
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "100%",
                      backgroundColor: "#6b7280",
                      opacity: 0.1,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight total sanity check */}
      <div className="mt-4 pt-3 border-t border-secondary/8 flex justify-between text-xs text-secondary/40">
        <span>
          Ensemble: {availableCount} method{availableCount !== 1 ? "s" : ""}{" "}
          active
        </span>
        <span>
          Total weight:{" "}
          {Math.round(
            entries
              .filter(([, m]) => m.available)
              .reduce((s, [, m]) => s + m.weight, 0) * 100,
          )}
          %
        </span>
      </div>
    </div>
  );
}
