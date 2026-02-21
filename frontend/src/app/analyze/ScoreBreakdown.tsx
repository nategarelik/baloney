"use client";

import type { FeatureVector } from "@/lib/types";

interface ScoreBreakdownProps {
  featureVector: FeatureVector;
}

interface FeatureRow {
  label: string;
  value: number; // normalized 0–1
  raw: number;
  rawLabel: string;
}

export function ScoreBreakdown({ featureVector }: ScoreBreakdownProps) {
  const rows: FeatureRow[] = [
    {
      label: "Burstiness",
      value: featureVector.burstiness,
      raw: featureVector.burstiness,
      rawLabel: featureVector.burstiness.toFixed(3),
    },
    {
      label: "Type-Token Ratio",
      value: featureVector.type_token_ratio,
      raw: featureVector.type_token_ratio,
      rawLabel: featureVector.type_token_ratio.toFixed(3),
    },
    {
      label: "Perplexity",
      value: Math.min(featureVector.perplexity / 300, 1),
      raw: featureVector.perplexity,
      rawLabel: featureVector.perplexity.toFixed(1),
    },
    {
      label: "Repetition Score",
      value: featureVector.repetition_score,
      raw: featureVector.repetition_score,
      rawLabel: featureVector.repetition_score.toFixed(3),
    },
  ];

  return (
    <div className="bg-navy-light rounded-xl border border-navy-lighter p-6">
      <h2 className="text-white font-semibold mb-4">Feature Analysis</h2>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">{row.label}</span>
              <span className="text-slate-400">{row.rawLabel}</span>
            </div>
            <div className="h-2 bg-navy rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.round(row.value * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
