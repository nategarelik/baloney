// evaluation-data.ts — Real evaluation pipeline
// Runs methodD_statistical on ALL labeled text samples from datasets.ts
// and computes genuine metrics at build time (module-level execution).
//
// NOTE: Uses v1 statistical weights (7-feature) — same divergence as
// analysis-system.test.ts. Verdict thresholds shared via DETECTION_CONFIG.

import { computeTextStats } from "./mock-detectors";
import { DETECTION_CONFIG } from "./detection-config";
import type { TextStats } from "./types";
import {
  AI_TEXT_SAMPLES,
  HUMAN_TEXT_SAMPLES,
  EDGE_CASE_TEXT_SAMPLES,
  type TextSample,
} from "../__tests__/datasets";

// ──────────────────────────────────────────────────────────
// Statistical detection internals (mirrored from analysis-system.test.ts)
// ──────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function precise(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

function sentenceWordCounts(text: string): number[] {
  const sentences = text
    .replace(/[!?]/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length,
  );
}

interface StatisticalSignal {
  burstiness: number;
  ttr: number;
  perplexityNorm: number;
  repetition: number;
  readability: number;
  signal: number;
}

function methodD_statistical(
  text: string,
  textStats: TextStats,
): StatisticalSignal {
  const wordCounts = sentenceWordCounts(text);
  const mean =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;
  const variance =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        wordCounts.length
      : 0;

  const burstiness = precise(Math.min(variance / 100, 1));
  const ttr = textStats.lexical_diversity;
  const perplexityNorm = precise(clamp(burstiness + (1 - ttr), 0, 1));
  const repetition = precise(clamp(1 - ttr, 0, 1));

  const sentLenSignal = precise(
    clamp((textStats.avg_sentence_length - 10) / 15, 0, 1),
  );
  const wordLenSignal = precise(
    clamp((textStats.avg_word_length - 4.0) / 3.0, 0, 1),
  );

  const avgSyllables = textStats.avg_word_length * 0.4;
  const fk = 0.39 * textStats.avg_sentence_length + 11.8 * avgSyllables - 15.59;
  const fkNorm = clamp(fk / 20, 0, 1);
  const readability =
    fkNorm > 0.45 ? precise(0.5 + fkNorm * 0.5) : precise(fkNorm * 0.6);

  const signal = precise(
    (1 - burstiness) * 0.25 +
      sentLenSignal * 0.2 +
      wordLenSignal * 0.15 +
      readability * 0.15 +
      (1 - ttr) * 0.1 +
      (1 - perplexityNorm) * 0.1 +
      repetition * 0.05,
  );

  return { burstiness, ttr, perplexityNorm, repetition, readability, signal };
}

// ──────────────────────────────────────────────────────────
// Run detection on every sample
// ──────────────────────────────────────────────────────────

const ALL_SAMPLES: TextSample[] = [
  ...AI_TEXT_SAMPLES,
  ...HUMAN_TEXT_SAMPLES,
  ...EDGE_CASE_TEXT_SAMPLES,
];

// Filter to samples with enough text for meaningful analysis
const EVAL_SAMPLES = ALL_SAMPLES.filter((s) => s.text.length >= 50);

interface ScoredSample {
  id: string;
  label: "ai" | "human";
  category: string;
  signal: number;
  stats: StatisticalSignal;
}

const scoredSamples: ScoredSample[] = EVAL_SAMPLES.map((s) => {
  const textStats = computeTextStats(s.text);
  const stats = methodD_statistical(s.text, textStats);
  return {
    id: s.id,
    label: s.label,
    category: s.category,
    signal: stats.signal,
    stats,
  };
});

// ──────────────────────────────────────────────────────────
// 1. ROC Curve — sweep thresholds 0.00 to 1.00, step 0.01
// ──────────────────────────────────────────────────────────

export interface RocPoint {
  fpr: number;
  tpr: number;
}

function computeRocCurve(samples: ScoredSample[]): RocPoint[] {
  const points: RocPoint[] = [];
  const totalPositive = samples.filter((s) => s.label === "ai").length;
  const totalNegative = samples.filter((s) => s.label === "human").length;

  for (let t = 0; t <= 100; t++) {
    const threshold = t / 100;
    let tp = 0;
    let fp = 0;

    for (const s of samples) {
      const predicted = s.signal >= threshold;
      if (predicted && s.label === "ai") tp++;
      if (predicted && s.label === "human") fp++;
    }

    const tpr = totalPositive > 0 ? tp / totalPositive : 0;
    const fpr = totalNegative > 0 ? fp / totalNegative : 0;
    points.push({ fpr: precise(fpr), tpr: precise(tpr) });
  }

  // Sort by FPR ascending for proper curve rendering
  points.sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);

  // Deduplicate consecutive identical points but keep endpoints
  const deduped: RocPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = deduped[deduped.length - 1];
    if (points[i].fpr !== prev.fpr || points[i].tpr !== prev.tpr) {
      deduped.push(points[i]);
    }
  }

  // Ensure curve starts at (0,0) and ends at (1,1)
  if (deduped[0].fpr !== 0 || deduped[0].tpr !== 0) {
    deduped.unshift({ fpr: 0, tpr: 0 });
  }
  const last = deduped[deduped.length - 1];
  if (last.fpr !== 1 || last.tpr !== 1) {
    deduped.push({ fpr: 1, tpr: 1 });
  }

  return deduped;
}

// ──────────────────────────────────────────────────────────
// 2. AUC-ROC via trapezoidal rule
// ──────────────────────────────────────────────────────────

function computeAuc(curve: RocPoint[]): number {
  let auc = 0;
  for (let i = 1; i < curve.length; i++) {
    const dx = curve[i].fpr - curve[i - 1].fpr;
    const avgY = (curve[i].tpr + curve[i - 1].tpr) / 2;
    auc += dx * avgY;
  }
  return precise(auc);
}

// ──────────────────────────────────────────────────────────
// 3. Optimal threshold via Youden's J statistic
// ──────────────────────────────────────────────────────────

function findOptimalThreshold(samples: ScoredSample[]): number {
  const totalPositive = samples.filter((s) => s.label === "ai").length;
  const totalNegative = samples.filter((s) => s.label === "human").length;

  let bestJ = -1;
  let bestThreshold = 0.5;

  for (let t = 0; t <= 100; t++) {
    const threshold = t / 100;
    let tp = 0;
    let fp = 0;

    for (const s of samples) {
      const predicted = s.signal >= threshold;
      if (predicted && s.label === "ai") tp++;
      if (predicted && s.label === "human") fp++;
    }

    const tpr = totalPositive > 0 ? tp / totalPositive : 0;
    const fpr = totalNegative > 0 ? fp / totalNegative : 0;
    const j = tpr - fpr; // Youden's J

    if (j > bestJ) {
      bestJ = j;
      bestThreshold = threshold;
    }
  }

  return bestThreshold;
}

// ──────────────────────────────────────────────────────────
// 4. Confusion matrix at a given threshold
// ──────────────────────────────────────────────────────────

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

function computeConfusionMatrix(
  samples: ScoredSample[],
  threshold: number,
): ConfusionMatrix {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;

  for (const s of samples) {
    const predicted = s.signal >= threshold;
    if (s.label === "ai") {
      if (predicted) tp++;
      else fn++;
    } else {
      if (predicted) fp++;
      else tn++;
    }
  }

  return { tp, fp, fn, tn };
}

// ──────────────────────────────────────────────────────────
// 5. Per-domain (category) accuracy
// ──────────────────────────────────────────────────────────

export interface DomainAccuracy {
  domain: string;
  accuracy: number;
  count: number;
}

function computeDomainAccuracy(
  samples: ScoredSample[],
  threshold: number,
): DomainAccuracy[] {
  // Group by category
  const groups = new Map<string, ScoredSample[]>();
  for (const s of samples) {
    const key = s.category;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  const result: DomainAccuracy[] = [];
  for (const [domain, group] of groups) {
    let correct = 0;
    for (const s of group) {
      const predicted = s.signal >= threshold;
      const actual = s.label === "ai";
      if (predicted === actual) correct++;
    }
    const accuracy = precise((correct / group.length) * 100, 1);
    result.push({ domain, accuracy, count: group.length });
  }

  // Sort by accuracy descending
  result.sort((a, b) => b.accuracy - a.accuracy);
  return result;
}

// Merge into broader domain buckets for chart readability
function mergeDomains(detailed: DomainAccuracy[]): DomainAccuracy[] {
  const buckets: Record<string, { correct: number; total: number }> = {};

  const classify = (cat: string): string => {
    if (
      cat.includes("reddit") ||
      cat.includes("social") ||
      cat.includes("llama-social")
    )
      return "social";
    if (cat.includes("twitter")) return "twitter";
    if (cat.includes("academic") || cat.includes("paper")) return "academic";
    if (cat.includes("creative") || cat.includes("writing")) return "creative";
    if (cat.includes("email")) return "email";
    if (cat.includes("blog") || cat.includes("listicle")) return "blog";
    if (cat.includes("technical") || cat.includes("mistral"))
      return "technical";
    if (cat.includes("news")) return "news";
    if (
      cat.includes("essay") ||
      cat.includes("report") ||
      cat.includes("persuasive")
    )
      return "essay";
    if (cat.includes("review")) return "review";
    if (cat.includes("medical") || cat.includes("legal")) return "professional";
    if (cat.includes("short") || cat.includes("edge-short"))
      return "short-text";
    if (
      cat.includes("esl") ||
      cat.includes("non-native") ||
      cat.includes("foreign")
    )
      return "esl";
    if (
      cat.includes("paraphrased") ||
      cat.includes("mixed") ||
      cat.includes("edited") ||
      cat.includes("formal-human") ||
      cat.includes("repetitive") ||
      cat.includes("edge")
    )
      return "edge-cases";
    return "other";
  };

  for (const d of detailed) {
    const bucket = classify(d.domain);
    if (!buckets[bucket]) buckets[bucket] = { correct: 0, total: 0 };
    // Reconstruct correct count from accuracy and count
    buckets[bucket].correct += Math.round((d.accuracy / 100) * d.count);
    buckets[bucket].total += d.count;
  }

  return Object.entries(buckets)
    .map(([domain, { correct, total }]) => ({
      domain,
      accuracy: precise((correct / total) * 100, 1),
      count: total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

// ──────────────────────────────────────────────────────────
// 6. Ablation study — full signal vs sub-signals alone
// ──────────────────────────────────────────────────────────

export interface AblationEntry {
  method: string;
  f1: number;
}

function computeF1WithSignal(
  samples: ScoredSample[],
  getSignal: (s: ScoredSample) => number,
): number {
  // Find best threshold for this signal using Youden's J
  const totalPositive = samples.filter((s) => s.label === "ai").length;
  const totalNegative = samples.filter((s) => s.label === "human").length;

  let bestThreshold = 0.5;
  let bestJ = -1;

  for (let t = 0; t <= 100; t++) {
    const threshold = t / 100;
    let tp = 0,
      fp = 0;
    for (const s of samples) {
      const val = getSignal(s);
      if (val >= threshold) {
        if (s.label === "ai") tp++;
        else fp++;
      }
    }
    const tpr = totalPositive > 0 ? tp / totalPositive : 0;
    const fpr = totalNegative > 0 ? fp / totalNegative : 0;
    const j = tpr - fpr;
    if (j > bestJ) {
      bestJ = j;
      bestThreshold = threshold;
    }
  }

  // Compute F1 at that threshold
  let tp = 0,
    fp = 0,
    fn = 0;
  for (const s of samples) {
    const val = getSignal(s);
    const predicted = val >= bestThreshold;
    if (s.label === "ai") {
      if (predicted) tp++;
      else fn++;
    } else {
      if (predicted) fp++;
    }
  }
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  return precision + recall > 0
    ? precise(((2 * precision * recall) / (precision + recall)) * 100, 1)
    : 0;
}

function computeAblation(samples: ScoredSample[]): AblationEntry[] {
  const fullF1 = computeF1WithSignal(samples, (s) => s.signal);

  // Individual sub-signals
  const burstiF1 = computeF1WithSignal(samples, (s) => 1 - s.stats.burstiness);
  const ttrF1 = computeF1WithSignal(samples, (s) => 1 - s.stats.ttr);
  const readF1 = computeF1WithSignal(samples, (s) => s.stats.readability);
  const repF1 = computeF1WithSignal(samples, (s) => s.stats.repetition);
  const perpF1 = computeF1WithSignal(
    samples,
    (s) => 1 - s.stats.perplexityNorm,
  );

  return [
    { method: "Full Signal", f1: fullF1 },
    { method: "Burstiness", f1: burstiF1 },
    { method: "TTR", f1: ttrF1 },
    { method: "Readability", f1: readF1 },
    { method: "Perplexity", f1: perpF1 },
    { method: "Repetition", f1: repF1 },
  ].sort((a, b) => b.f1 - a.f1);
}

// ──────────────────────────────────────────────────────────
// 7. Summary statistics
// ──────────────────────────────────────────────────────────

export interface SummaryStatEntry {
  metric: string;
  value: string;
}

function computeSummaryStats(
  cm: ConfusionMatrix,
  auc: number,
  samples: ScoredSample[],
): SummaryStatEntry[] {
  const total = cm.tp + cm.fp + cm.fn + cm.tn;
  const accuracy = total > 0 ? (cm.tp + cm.tn) / total : 0;
  const precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
  const recall = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

  // Cohen's Kappa
  const pe =
    total > 0
      ? ((cm.tp + cm.fn) * (cm.tp + cm.fp) +
          (cm.fp + cm.tn) * (cm.fn + cm.tn)) /
        (total * total)
      : 0;
  const kappa = 1 - pe > 0 ? (accuracy - pe) / (1 - pe) : 0;

  // Cohen's d — effect size between AI and human signal distributions
  const aiSignals = samples
    .filter((s) => s.label === "ai")
    .map((s) => s.signal);
  const humanSignals = samples
    .filter((s) => s.label === "human")
    .map((s) => s.signal);

  const aiMean =
    aiSignals.length > 0
      ? aiSignals.reduce((a, b) => a + b, 0) / aiSignals.length
      : 0;
  const humanMean =
    humanSignals.length > 0
      ? humanSignals.reduce((a, b) => a + b, 0) / humanSignals.length
      : 0;
  const aiVar =
    aiSignals.length > 1
      ? aiSignals.reduce((s, v) => s + Math.pow(v - aiMean, 2), 0) /
        (aiSignals.length - 1)
      : 0;
  const humanVar =
    humanSignals.length > 1
      ? humanSignals.reduce((s, v) => s + Math.pow(v - humanMean, 2), 0) /
        (humanSignals.length - 1)
      : 0;
  // Weighted pooled SD (correct for unequal group sizes)
  const pooledVar =
    ((aiSignals.length - 1) * aiVar + (humanSignals.length - 1) * humanVar) /
    (aiSignals.length + humanSignals.length - 2);
  const pooledStd = Math.sqrt(pooledVar);
  const cohensD = pooledStd > 0 ? (aiMean - humanMean) / pooledStd : 0;

  return [
    { metric: "Accuracy", value: `${(accuracy * 100).toFixed(1)}%` },
    { metric: "Precision", value: `${(precision * 100).toFixed(1)}%` },
    { metric: "Recall", value: `${(recall * 100).toFixed(1)}%` },
    { metric: "F1 Score", value: `${(f1 * 100).toFixed(1)}%` },
    { metric: "AUC-ROC", value: auc.toFixed(3) },
    { metric: "Cohen's Kappa", value: kappa.toFixed(3) },
    { metric: "Cohen's d", value: cohensD.toFixed(3) },
    { metric: "Samples", value: String(samples.length) },
  ];
}

// ══════════════════════════════════════════════════════════
// COMPUTE EVERYTHING (runs at module load / build time)
// ══════════════════════════════════════════════════════════

export const rocData: RocPoint[] = computeRocCurve(scoredSamples);
export const aucRoc: number = computeAuc(rocData);

export const optimalThreshold: number = findOptimalThreshold(scoredSamples);

export const confusionMatrix: ConfusionMatrix = computeConfusionMatrix(
  scoredSamples,
  optimalThreshold,
);

const rawDomainData = computeDomainAccuracy(scoredSamples, optimalThreshold);
export const domainData: DomainAccuracy[] = mergeDomains(rawDomainData);

export const ablationData: AblationEntry[] = computeAblation(scoredSamples);

export const summaryStats: SummaryStatEntry[] = computeSummaryStats(
  confusionMatrix,
  aucRoc,
  scoredSamples,
);

export const totalSamples: number = scoredSamples.length;

// Overall accuracy for reference line on per-domain chart
export const overallAccuracy: number = precise(
  ((confusionMatrix.tp + confusionMatrix.tn) /
    (confusionMatrix.tp +
      confusionMatrix.fp +
      confusionMatrix.fn +
      confusionMatrix.tn)) *
    100,
  1,
);

// Diagonal reference line for ROC chart
export const diagonalData = [
  { fpr: 0, random: 0 },
  { fpr: 1, random: 1 },
];

// ══════════════════════════════════════════════════════════
// PANGRAM VALIDATION DATA — imported from pipeline results
// (static data for build-time rendering)
// ══════════════════════════════════════════════════════════

// These will be populated when the validation pipeline runs.
// For now, use placeholder data that the page can render.
// After running `npx tsx scripts/validation-pipeline.ts`,
// replace with: import results from "../../scripts/data/validation-report.json"

export interface PangramModelAccuracy {
  model: string;
  accuracy: number;
  detection_rate: number;
  avg_confidence: number;
  avg_ai_assisted: number;
  avg_window_high_conf: number;
  n: number;
}

export interface PangramPlatformAccuracy {
  platform: string;
  accuracy: number;
  detection_rate: number;
  avg_confidence: number;
  avg_ai_assisted: number;
  avg_window_high_conf: number;
  n: number;
}

export interface PangramConfidenceBucket {
  bucket: string;
  ai_count: number;
  human_count: number;
}

export interface PangramValidationData {
  rocData: RocPoint[];
  aucRoc: number;
  confusionMatrix: ConfusionMatrix;
  optimalThreshold: number;
  perModelAccuracy: PangramModelAccuracy[];
  perPlatformAccuracy: PangramPlatformAccuracy[];
  confidenceDistribution: PangramConfidenceBucket[];
  totalSamples: number;
  aiSamples: number;
  humanSamples: number;
  summaryStats: { metric: string; value: string }[];
  isPlaceholder?: boolean;
  isSynthetic?: boolean;
}

// Real pipeline results from validation-report.json
export const pangramValidationData: PangramValidationData = {
  isPlaceholder: false,
  isSynthetic: false,
  rocData: [
    { fpr: 0, tpr: 0 },
    { fpr: 0.92, tpr: 1 },
    { fpr: 1, tpr: 1 },
  ],
  aucRoc: 0.54,
  confusionMatrix: { tp: 36, fp: 46, fn: 0, tn: 4 },
  optimalThreshold: 0.01,
  perModelAccuracy: [
    {
      model: "gemini",
      accuracy: 100,
      detection_rate: 100,
      avg_confidence: 1.0,
      avg_ai_assisted: 0,
      avg_window_high_conf: 100,
      n: 36,
    },
  ],
  perPlatformAccuracy: [
    {
      platform: "x",
      accuracy: 100,
      detection_rate: 100,
      avg_confidence: 1.0,
      avg_ai_assisted: 0,
      avg_window_high_conf: 100,
      n: 15,
    },
    {
      platform: "facebook",
      accuracy: 100,
      detection_rate: 100,
      avg_confidence: 1.0,
      avg_ai_assisted: 0,
      avg_window_high_conf: 100,
      n: 14,
    },
    {
      platform: "linkedin",
      accuracy: 100,
      detection_rate: 100,
      avg_confidence: 1.0,
      avg_ai_assisted: 0,
      avg_window_high_conf: 100,
      n: 7,
    },
  ],
  confidenceDistribution: [
    { bucket: "0.0-0.1", ai_count: 0, human_count: 4 },
    { bucket: "0.1-0.2", ai_count: 0, human_count: 0 },
    { bucket: "0.2-0.3", ai_count: 0, human_count: 0 },
    { bucket: "0.3-0.4", ai_count: 0, human_count: 0 },
    { bucket: "0.4-0.5", ai_count: 0, human_count: 0 },
    { bucket: "0.5-0.6", ai_count: 0, human_count: 0 },
    { bucket: "0.6-0.7", ai_count: 0, human_count: 0 },
    { bucket: "0.7-0.8", ai_count: 0, human_count: 0 },
    { bucket: "0.8-0.9", ai_count: 0, human_count: 0 },
    { bucket: "0.9-1.0", ai_count: 36, human_count: 46 },
  ],
  totalSamples: 86,
  aiSamples: 36,
  humanSamples: 50,
  summaryStats: [
    { metric: "Accuracy", value: "46.5%" },
    { metric: "Precision", value: "43.9%" },
    { metric: "Recall (Sensitivity)", value: "100.0%" },
    { metric: "Specificity", value: "8.0%" },
    { metric: "F1 Score", value: "61.0%" },
    { metric: "False Positive Rate", value: "92.0%" },
    { metric: "AUC-ROC", value: "0.5400" },
    { metric: "AUC-ROC 95% CI", value: "[0.5088, 0.5834]" },
    { metric: "PR-AUC", value: "0.0000" },
    { metric: "Cohen's d (effect size)", value: "0.3822 (small)" },
    { metric: "Optimal Threshold (Youden's J)", value: "0.01" },
    { metric: "Total Samples", value: "86" },
  ],
};
