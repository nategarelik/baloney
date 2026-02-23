// frontend/src/lib/detection/verdict.ts — Verdict mapping for text and image

import type { Verdict, FeatureVector } from "@/lib/types";
import { DETECTION_CONFIG } from "@/lib/detection-config";
import { precise } from "./helpers";
import type { StatisticalSignal } from "./statistical";

export interface VerdictMapping {
  verdict: Verdict;
  confidence: number;
  trust_score: number;
  edit_magnitude: number;
  caveat: string;
}

export function mapVerdict(aiProbability: number, textLength: number): VerdictMapping {
  const T = DETECTION_CONFIG.text.verdictThresholds;
  const F = DETECTION_CONFIG.text.verdictFormulas;

  if (aiProbability > T.aiGenerated) {
    return {
      verdict: "ai_generated",
      confidence: precise(aiProbability),
      trust_score: precise(
        1 - aiProbability * F.aiGenerated.trustScoreMultiplier,
      ),
      edit_magnitude: precise(
        F.aiGenerated.editMagnitudeBase +
          aiProbability * F.aiGenerated.editMagnitudeScale,
      ),
      caveat:
        textLength < DETECTION_CONFIG.text.shortTextThreshold
          ? "Short text — AI detection confidence is reduced. Patterns consistent with AI-generated text detected."
          : "Patterns consistent with AI-generated text detected. Text detection is experimental and should not be considered definitive.",
    };
  }

  if (aiProbability > T.heavyEdit) {
    return {
      verdict: "heavy_edit",
      confidence: precise(
        F.heavyEdit.confidenceBase +
          (aiProbability - T.heavyEdit) * F.heavyEdit.confidenceScale,
      ),
      trust_score: precise(
        F.heavyEdit.trustScoreBase +
          (T.aiGenerated - aiProbability) * F.heavyEdit.trustScoreScale,
      ),
      edit_magnitude: precise(
        F.heavyEdit.editMagnitudeBase +
          (aiProbability - T.heavyEdit) * F.heavyEdit.editMagnitudeScale,
      ),
      caveat:
        "Significant AI-assisted editing detected. Content appears substantially modified by AI tools.",
    };
  }

  if (aiProbability > T.lightEdit) {
    return {
      verdict: "light_edit",
      confidence: precise(
        F.lightEdit.confidenceBase +
          (aiProbability - T.lightEdit) * F.lightEdit.confidenceScale,
      ),
      trust_score: precise(
        F.lightEdit.trustScoreBase +
          (T.heavyEdit - aiProbability) * F.lightEdit.trustScoreScale,
      ),
      edit_magnitude: precise(
        F.lightEdit.editMagnitudeBase +
          (aiProbability - T.lightEdit) * F.lightEdit.editMagnitudeScale,
      ),
      caveat:
        "Minor AI assistance likely. Content appears primarily human-written with some AI refinement.",
    };
  }

  return {
    verdict: "human",
    confidence: precise(1 - aiProbability),
    trust_score: precise(
      F.human.trustScoreBase +
        (T.lightEdit - aiProbability) * F.human.trustScoreScale,
    ),
    edit_magnitude: precise(aiProbability * F.human.editMagnitudeScale),
    caveat:
      "Text appears human-written, but AI text detection has known limitations. Heavily edited AI text may appear human.",
  };
}

export function mapImageVerdict(compositeScore: number): {
  verdict: Verdict;
  confidence: number;
  trust_score: number;
  edit_magnitude: number;
} {
  const T = DETECTION_CONFIG.image.verdictThresholds;
  const F = DETECTION_CONFIG.image.verdictFormulas;

  if (compositeScore > T.aiGenerated) {
    return {
      verdict: "ai_generated",
      confidence: precise(compositeScore),
      trust_score: precise(
        1 - compositeScore * F.aiGenerated.trustScoreMultiplier,
      ),
      edit_magnitude: precise(
        F.aiGenerated.editMagnitudeBase +
          compositeScore * F.aiGenerated.editMagnitudeScale,
      ),
    };
  }

  if (compositeScore > T.heavyEdit) {
    return {
      verdict: "heavy_edit",
      confidence: precise(
        F.heavyEdit.confidenceBase +
          (compositeScore - T.heavyEdit) * F.heavyEdit.confidenceScale,
      ),
      trust_score: precise(
        F.heavyEdit.trustScoreBase +
          (T.aiGenerated - compositeScore) * F.heavyEdit.trustScoreScale,
      ),
      edit_magnitude: precise(
        F.heavyEdit.editMagnitudeBase +
          (compositeScore - T.heavyEdit) * F.heavyEdit.editMagnitudeScale,
      ),
    };
  }

  if (compositeScore > T.lightEdit) {
    return {
      verdict: "light_edit",
      confidence: precise(
        F.lightEdit.confidenceBase +
          (compositeScore - T.lightEdit) * F.lightEdit.confidenceScale,
      ),
      trust_score: precise(
        F.lightEdit.trustScoreBase +
          (T.heavyEdit - compositeScore) * F.lightEdit.trustScoreScale,
      ),
      edit_magnitude: precise(
        F.lightEdit.editMagnitudeBase +
          (compositeScore - T.lightEdit) * F.lightEdit.editMagnitudeScale,
      ),
    };
  }

  return {
    verdict: "human",
    confidence: precise(1 - compositeScore),
    trust_score: precise(
      F.human.trustScoreBase +
        (T.lightEdit - compositeScore) * F.human.trustScoreScale,
    ),
    edit_magnitude: precise(compositeScore * F.human.editMagnitudeScale),
  };
}

export function buildFeatureVector(stats: StatisticalSignal): FeatureVector {
  return {
    burstiness: stats.burstiness,
    type_token_ratio: stats.ttr,
    perplexity: precise(stats.perplexityNorm * 200 + 50, 2),
    repetition_score: stats.repetition,
  };
}
