// frontend/src/lib/bayesian.ts — Bayesian posterior adjustment + confidence floor
// Used for display-level statistical rigor — raw detection outputs stay unchanged.

import type { Verdict } from "./types";

/** Minimum confidence to display as AI/human verdict. Below this → "inconclusive" */
export const CONFIDENCE_FLOOR = 0.60;

/** Model accuracy priors (from testing/literature) */
const MODEL_PRIORS: Record<string, { accuracy: number; falsePositiveRate: number }> = {
  text: { accuracy: 0.78, falsePositiveRate: 0.15 },
  image: { accuracy: 0.85, falsePositiveRate: 0.10 },
  video: { accuracy: 0.80, falsePositiveRate: 0.12 },
};

/**
 * Apply confidence floor to a detection result for display purposes.
 * If confidence < CONFIDENCE_FLOOR, downgrade verdict display to "inconclusive".
 */
export function applyConfidenceFloor(
  verdict: Verdict,
  confidence: number,
): { displayVerdict: string; isFloored: boolean } {
  if (confidence < CONFIDENCE_FLOOR && verdict !== "human") {
    return { displayVerdict: "inconclusive", isFloored: true };
  }
  return { displayVerdict: verdict, isFloored: false };
}

/**
 * Bayesian posterior: P(AI | score)
 *
 * P(AI|score) = P(score|AI) × P(AI) / [P(score|AI) × P(AI) + P(score|Human) × P(Human)]
 *
 * - Prior P(AI) = model accuracy from testing
 * - Likelihood P(score|AI) = raw confidence score
 * - P(score|Human) = false positive rate (complement approach)
 */
export function bayesianPosterior(
  confidence: number,
  contentType: "text" | "image" | "video" = "text",
): number {
  const prior = MODEL_PRIORS[contentType] ?? MODEL_PRIORS.text;

  const pScoreGivenAI = confidence;
  const pAI = prior.accuracy;
  const pHuman = 1 - pAI;
  const pScoreGivenHuman = prior.falsePositiveRate * (1 - confidence) + confidence * 0.1;

  const numerator = pScoreGivenAI * pAI;
  const denominator = numerator + pScoreGivenHuman * pHuman;

  if (denominator === 0) return 0;
  return Math.min(numerator / denominator, 1);
}

/**
 * Check if a scan counts as "AI" for dashboard statistics,
 * respecting the confidence floor.
 */
export function isAiWithFloor(verdict: Verdict, confidence: number): boolean {
  if (confidence < CONFIDENCE_FLOOR) return false;
  return verdict === "ai_generated" || verdict === "heavy_edit";
}

/**
 * Compute Bayesian-adjusted AI rate for a set of scans.
 */
export function bayesianAiRate(
  scans: Array<{ verdict: Verdict; confidence: number; content_type?: string }>,
): number {
  if (scans.length === 0) return 0;

  let weightedAiCount = 0;
  for (const scan of scans) {
    if (isAiWithFloor(scan.verdict, scan.confidence)) {
      const contentType = (scan.content_type === "image" ? "image" : scan.content_type === "video" ? "video" : "text") as "text" | "image" | "video";
      weightedAiCount += bayesianPosterior(scan.confidence, contentType);
    }
  }

  return weightedAiCount / scans.length;
}
