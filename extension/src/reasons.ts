// extension/src/reasons.ts — Plain-English WHY explanations for verdicts

import type { DetectionResult } from "./types";

export function getTextReasons(result: DetectionResult): string[] {
  const reasons: string[] = [];
  const fv = result.feature_vector;
  if (!fv) return reasons;

  if (fv.burstiness !== undefined) {
    if (fv.burstiness < 0.2)
      reasons.push("Sentence lengths are very uniform, typical of AI writing");
    else if (fv.burstiness > 0.5)
      reasons.push("Varied sentence rhythm suggests human writing style");
  }
  if (fv.type_token_ratio !== undefined) {
    if (fv.type_token_ratio < 0.4)
      reasons.push("Vocabulary is repetitive, a common AI pattern");
    else if (fv.type_token_ratio > 0.7)
      reasons.push("Rich vocabulary diversity indicates human authorship");
  }
  if (fv.perplexity !== undefined) {
    if (fv.perplexity < 80)
      reasons.push("Text is highly predictable, consistent with AI generation");
    else if (fv.perplexity > 150)
      reasons.push("Unpredictable word choices suggest human creativity");
  }
  if (fv.repetition_score !== undefined) {
    if (fv.repetition_score > 0.6)
      reasons.push("High phrase repetition detected");
  }
  return reasons;
}

export function getImageReasons(result: DetectionResult): string[] {
  const reasons: string[] = [];
  if (result.primary_score !== undefined) {
    if (result.primary_score > 0.7)
      reasons.push("Visual patterns strongly match AI generation signatures");
    else if (result.primary_score < 0.3)
      reasons.push("Visual patterns consistent with authentic photography");
  }
  if (result.secondary_score !== undefined) {
    if (result.secondary_score > 0.6)
      reasons.push("Frequency analysis shows unusually smooth gradients");
    else if (result.secondary_score < 0.3)
      reasons.push("Natural noise patterns detected in image data");
  }
  if (result.edit_magnitude !== undefined) {
    if (result.edit_magnitude > 0.7)
      reasons.push("Significant digital manipulation detected");
  }
  if (result.trust_score !== undefined) {
    if (result.trust_score > 0.75) reasons.push("High authenticity confidence");
  }
  return reasons;
}
