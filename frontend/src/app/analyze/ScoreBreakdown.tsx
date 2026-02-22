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
  interpretation: string;
}

export function ScoreBreakdown({ featureVector }: ScoreBreakdownProps) {
  const rows: FeatureRow[] = [
    {
      label: "Burstiness",
      value: featureVector.burstiness,
      raw: featureVector.burstiness,
      rawLabel: featureVector.burstiness.toFixed(3),
      interpretation:
        featureVector.burstiness < 0.2
          ? "Sentence lengths are very uniform — typical of AI writing"
          : featureVector.burstiness > 0.5
            ? "Varied sentence rhythm suggests human writing style"
            : "Moderate sentence length variation",
    },
    {
      label: "Type-Token Ratio",
      value: featureVector.type_token_ratio,
      raw: featureVector.type_token_ratio,
      rawLabel: featureVector.type_token_ratio.toFixed(3),
      interpretation:
        featureVector.type_token_ratio < 0.4
          ? "Vocabulary is repetitive — a common AI pattern"
          : featureVector.type_token_ratio > 0.7
            ? "Rich vocabulary diversity indicates human authorship"
            : "Average vocabulary diversity",
    },
    {
      label: "Perplexity",
      value: Math.min(featureVector.perplexity / 300, 1),
      raw: featureVector.perplexity,
      rawLabel: featureVector.perplexity.toFixed(1),
      interpretation:
        featureVector.perplexity < 80
          ? "Text is highly predictable — consistent with AI generation"
          : featureVector.perplexity > 150
            ? "Unpredictable word choices suggest human creativity"
            : "Moderate text predictability",
    },
    {
      label: "Repetition Score",
      value: featureVector.repetition_score,
      raw: featureVector.repetition_score,
      rawLabel: featureVector.repetition_score.toFixed(3),
      interpretation:
        featureVector.repetition_score > 0.6
          ? "High phrase repetition detected — typical of AI output"
          : featureVector.repetition_score < 0.2
            ? "Low repetition — natural writing variation"
            : "Moderate phrase repetition",
    },
  ];

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
      <h2 className="font-display text-xl text-secondary mb-4">
        Feature Analysis
      </h2>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-secondary/70">{row.label}</span>
              <span className="text-secondary/50">{row.rawLabel}</span>
            </div>
            <div className="h-2 bg-secondary/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.round(row.value * 100)}%` }}
              />
            </div>
            <p className="text-secondary/50 text-xs mt-1">
              {row.interpretation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
