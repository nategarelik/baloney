"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  optimalThreshold,
  aucRoc,
  overallAccuracy,
} from "@/lib/evaluation-data";
import { ensembleFeatureImportance } from "@/lib/ensemble-evaluation-data";
import type { MethodScore } from "@/lib/types";

interface DetectionInsightsProps {
  type: "text" | "image" | "video";
  confidence: number;
  verdict: string;
  modelUsed?: string;
  primaryAvailable?: boolean;
  confidenceCapped?: boolean;
  methodScores?: Record<string, MethodScore>;
}

export function DetectionInsights({
  type,
  confidence,
  verdict,
  modelUsed,
  primaryAvailable,
  confidenceCapped,
  methodScores,
}: DetectionInsightsProps) {
  const [expanded, setExpanded] = useState(true);

  const confidencePct = (confidence * 100).toFixed(1);
  const thresholdPct = (optimalThreshold * 100).toFixed(1);
  const aboveThreshold = confidence >= optimalThreshold;

  // Count available vs unavailable methods
  const availableCount = methodScores
    ? Object.values(methodScores).filter((m) => m.available).length
    : 0;
  const totalCount = methodScores ? Object.keys(methodScores).length : 0;
  const unavailableCount = totalCount - availableCount;

  // Determine if primary API was used
  const usedPrimary = primaryAvailable !== false;

  // Top 2 features for text insight
  const topFeatures = ensembleFeatureImportance.slice(0, 2);

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-display text-sm text-secondary/70">
          Detection Insights
        </h3>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-secondary/40" />
        ) : (
          <ChevronDown className="h-4 w-4 text-secondary/40" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {/* 1. Confidence Context */}
          <div className="flex gap-3">
            <div
              className="w-0.5 rounded-full shrink-0"
              style={{
                background: aboveThreshold ? "#16a34a" : "#f59e0b",
              }}
            />
            <p className="text-secondary/60 text-xs leading-relaxed">
              Confidence {confidencePct}% {aboveThreshold ? "above" : "below"}{" "}
              system threshold ({thresholdPct}%). AUC-ROC: {aucRoc.toFixed(3)}.
              Overall accuracy: {(overallAccuracy * 100).toFixed(1)}%.
            </p>
          </div>

          {/* 2. Method Quality */}
          <div className="flex gap-3">
            <div
              className="w-0.5 rounded-full shrink-0"
              style={{
                background: usedPrimary ? "#16a34a" : "#f59e0b",
              }}
            />
            <p className="text-secondary/60 text-xs leading-relaxed">
              {usedPrimary ? (
                <>
                  Verified by{" "}
                  {type === "text" ? "Pangram (99.85%)" : "SightEngine (98.3%)"}
                  . {availableCount} of {totalCount} methods active.
                </>
              ) : (
                <>
                  Local analysis only — primary API unavailable
                  {confidenceCapped ? ", confidence capped" : ""}.{" "}
                  {availableCount} of {totalCount} methods active
                  {unavailableCount > 0 && `, ${unavailableCount} unavailable`}.
                </>
              )}
            </p>
          </div>

          {/* 3. Research Insight (type-dependent) */}
          <div className="flex gap-3">
            <div
              className="w-0.5 rounded-full shrink-0"
              style={{ background: "#3b82f6" }}
            />
            <p className="text-secondary/60 text-xs leading-relaxed">
              {type === "text" && topFeatures.length >= 2 ? (
                <>
                  Top discriminators:{" "}
                  {topFeatures[0].feature.replace(/_/g, " ")} (d=
                  {topFeatures[0].cohens_d.toFixed(2)}),{" "}
                  {topFeatures[1].feature.replace(/_/g, " ")} (d=
                  {topFeatures[1].cohens_d.toFixed(2)}).
                </>
              ) : type === "text" ? (
                <>
                  Text detection uses an ensemble of statistical and neural
                  signals.
                </>
              ) : type === "image" ? (
                <>
                  {usedPrimary
                    ? "SightEngine covers 120+ AI generators. Frequency/DCT analysis detects artifacts in image data."
                    : "Results from local analysis only. Upload directly for full API analysis."}
                </>
              ) : (
                <>
                  Video analysis uses SightEngine native endpoint for
                  server-side frame analysis.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
