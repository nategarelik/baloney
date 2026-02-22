// results-formatter.ts — Metrics computation for the validation pipeline
// Uses full Pangram v3 response fields: fraction_ai, fraction_ai_assisted,
// fraction_human, per-window ai_assistance_score + confidence levels.

import type { DetectionResult } from "./pangram-detector.ts";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface RocPoint {
  fpr: number;
  tpr: number;
}

export interface PrPoint {
  recall: number;
  precision: number;
}

export interface CalibrationBin {
  bin_midpoint: number;
  avg_predicted: number;
  actual_positive_rate: number;
  count: number;
}

export interface ThresholdEntry {
  threshold: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  specificity: number;
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface ModelAccuracy {
  model: string;
  accuracy: number;
  detection_rate: number; // % of AI samples correctly detected as AI
  detection_rate_ci: { lower: number; upper: number }; // Wilson score CI
  avg_confidence: number; // mean fraction_ai for AI samples
  avg_ai_assisted: number; // mean fraction_ai_assisted (new v3 field)
  avg_window_high_conf: number; // mean % of windows with "High" confidence
  n: number;
}

export interface PlatformAccuracy {
  platform: string;
  accuracy: number;
  detection_rate: number;
  detection_rate_ci: { lower: number; upper: number }; // Wilson score CI
  avg_confidence: number;
  avg_ai_assisted: number;
  avg_window_high_conf: number;
  n: number;
}

export interface ConfidenceDistribution {
  bucket: string; // "0.0-0.1", "0.1-0.2", etc.
  ai_count: number;
  human_count: number;
}

export interface ValidationReport {
  generated_at: string;
  total_samples: number;
  ai_samples: number;
  human_samples: number;
  roc_data: RocPoint[];
  auc_roc: number;
  optimal_threshold: number;
  confusion_matrix: ConfusionMatrix;
  per_model: ModelAccuracy[];
  per_platform: PlatformAccuracy[];
  confidence_distribution: ConfidenceDistribution[];
  summary_stats: Array<{ metric: string; value: string }>;
  // Advanced statistical metrics
  pr_data: PrPoint[];
  pr_auc: number;
  calibration: CalibrationBin[];
  threshold_sensitivity: ThresholdEntry[];
  auc_ci: { lower: number; upper: number; mean: number };
  // Pangram v3-specific metrics
  ai_assisted_analysis: {
    avg_fraction_ai_assisted_on_ai: number;
    avg_fraction_ai_assisted_on_human: number;
    texts_with_mixed_classification: number;
  };
  window_analysis: {
    avg_windows_per_text: number;
    avg_high_confidence_pct: number;
    avg_ai_score_on_ai_windows: number;
  };
}

// ──────────────────────────────────────────────────────────
// Helper — round to fixed decimal places
// ──────────────────────────────────────────────────────────

export function precise(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

// ──────────────────────────────────────────────────────────
// 1. ROC Curve — sweep thresholds 0.00 to 1.00, step 0.01
// ──────────────────────────────────────────────────────────

export function computeRocCurve(results: DetectionResult[]): RocPoint[] {
  const points: RocPoint[] = [];
  const totalPositive = results.filter((r) => r.label === "ai").length;
  const totalNegative = results.filter((r) => r.label === "human").length;

  for (let t = 0; t <= 100; t++) {
    const threshold = t / 100;
    let tp = 0;
    let fp = 0;

    for (const r of results) {
      const predicted = r.pangram_score >= threshold;
      if (predicted && r.label === "ai") tp++;
      if (predicted && r.label === "human") fp++;
    }

    const tpr = totalPositive > 0 ? tp / totalPositive : 0;
    const fpr = totalNegative > 0 ? fp / totalNegative : 0;
    points.push({ fpr: precise(fpr), tpr: precise(tpr) });
  }

  // Sort by FPR ascending for proper curve rendering
  points.sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);

  // Deduplicate consecutive identical points
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

export function computeAuc(curve: RocPoint[]): number {
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

export function findOptimalThreshold(results: DetectionResult[]): number {
  const totalPositive = results.filter((r) => r.label === "ai").length;
  const totalNegative = results.filter((r) => r.label === "human").length;

  let bestJ = -1;
  let bestThreshold = 0.5;

  for (let t = 0; t <= 100; t++) {
    const threshold = t / 100;
    let tp = 0;
    let fp = 0;

    for (const r of results) {
      const predicted = r.pangram_score >= threshold;
      if (predicted && r.label === "ai") tp++;
      if (predicted && r.label === "human") fp++;
    }

    const tpr = totalPositive > 0 ? tp / totalPositive : 0;
    const fpr = totalNegative > 0 ? fp / totalNegative : 0;
    const j = tpr - fpr;

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

export function computeConfusionMatrix(
  results: DetectionResult[],
  threshold: number,
): ConfusionMatrix {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;

  for (const r of results) {
    const predicted = r.pangram_score >= threshold;
    if (r.label === "ai") {
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
// 5. Per-model accuracy (with v3 extended metrics)
// ──────────────────────────────────────────────────────────

export function computePerModel(
  results: DetectionResult[],
  threshold: number,
): ModelAccuracy[] {
  const groups = new Map<string, DetectionResult[]>();
  for (const r of results) {
    if (!r.model) continue; // skip human controls (no model)
    const key = r.model;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const output: ModelAccuracy[] = [];
  for (const [model, group] of groups) {
    let correct = 0;
    let aiCorrect = 0;
    let totalAi = 0;
    let aiScoreSum = 0;
    let aiAssistedSum = 0;
    let windowHighConfSum = 0;

    for (const r of group) {
      const predicted = r.pangram_score >= threshold;
      const actual = r.label === "ai";
      if (predicted === actual) correct++;

      if (actual) {
        totalAi++;
        aiScoreSum += r.pangram_score;
        aiAssistedSum += r.pangram_fraction_ai_assisted;
        windowHighConfSum += r.pangram_avg_window_confidence;
        if (predicted) aiCorrect++;
      }
    }

    const ci = wilsonCI(aiCorrect, totalAi);
    output.push({
      model,
      accuracy: precise((correct / group.length) * 100, 1),
      detection_rate:
        totalAi > 0 ? precise((aiCorrect / totalAi) * 100, 1) : 0,
      detection_rate_ci: {
        lower: precise(ci.lower * 100, 1),
        upper: precise(ci.upper * 100, 1),
      },
      avg_confidence: totalAi > 0 ? precise(aiScoreSum / totalAi) : 0,
      avg_ai_assisted:
        totalAi > 0 ? precise(aiAssistedSum / totalAi) : 0,
      avg_window_high_conf:
        totalAi > 0
          ? precise((windowHighConfSum / totalAi) * 100, 1)
          : 0,
      n: group.length,
    });
  }

  output.sort((a, b) => b.accuracy - a.accuracy);
  return output;
}

// ──────────────────────────────────────────────────────────
// 6. Per-platform accuracy (with v3 extended metrics)
// ──────────────────────────────────────────────────────────

export function computePerPlatform(
  results: DetectionResult[],
  threshold: number,
): PlatformAccuracy[] {
  const groups = new Map<string, DetectionResult[]>();
  for (const r of results) {
    if (!r.platform) continue; // skip samples without platform
    const key = r.platform;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const output: PlatformAccuracy[] = [];
  for (const [platform, group] of groups) {
    let correct = 0;
    let aiCorrect = 0;
    let totalAi = 0;
    let aiScoreSum = 0;
    let aiAssistedSum = 0;
    let windowHighConfSum = 0;

    for (const r of group) {
      const predicted = r.pangram_score >= threshold;
      const actual = r.label === "ai";
      if (predicted === actual) correct++;

      if (actual) {
        totalAi++;
        aiScoreSum += r.pangram_score;
        aiAssistedSum += r.pangram_fraction_ai_assisted;
        windowHighConfSum += r.pangram_avg_window_confidence;
        if (predicted) aiCorrect++;
      }
    }

    const ci = wilsonCI(aiCorrect, totalAi);
    output.push({
      platform,
      accuracy: precise((correct / group.length) * 100, 1),
      detection_rate:
        totalAi > 0 ? precise((aiCorrect / totalAi) * 100, 1) : 0,
      detection_rate_ci: {
        lower: precise(ci.lower * 100, 1),
        upper: precise(ci.upper * 100, 1),
      },
      avg_confidence: totalAi > 0 ? precise(aiScoreSum / totalAi) : 0,
      avg_ai_assisted:
        totalAi > 0 ? precise(aiAssistedSum / totalAi) : 0,
      avg_window_high_conf:
        totalAi > 0
          ? precise((windowHighConfSum / totalAi) * 100, 1)
          : 0,
      n: group.length,
    });
  }

  output.sort((a, b) => b.accuracy - a.accuracy);
  return output;
}

// ──────────────────────────────────────────────────────────
// 7. Confidence distribution (histogram buckets)
// ──────────────────────────────────────────────────────────

function computeConfidenceDistribution(
  results: DetectionResult[],
): ConfidenceDistribution[] {
  const buckets: ConfidenceDistribution[] = [];
  for (let i = 0; i < 10; i++) {
    const lo = i / 10;
    const hi = (i + 1) / 10;
    buckets.push({
      bucket: `${lo.toFixed(1)}-${hi.toFixed(1)}`,
      ai_count: 0,
      human_count: 0,
    });
  }

  for (const r of results) {
    const idx = Math.min(Math.floor(r.pangram_score * 10), 9);
    if (r.label === "ai") {
      buckets[idx].ai_count++;
    } else {
      buckets[idx].human_count++;
    }
  }

  return buckets;
}

// ──────────────────────────────────────────────────────────
// 8. Wilson Score Confidence Interval
// ──────────────────────────────────────────────────────────

export function wilsonCI(
  successes: number,
  n: number,
  z: number = 1.96,
): { lower: number; upper: number } {
  if (n === 0) return { lower: 0, upper: 0 };

  const p = successes / n;
  const z2 = z * z;
  const denominator = 1 + z2 / n;
  const centre = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);

  const lower = Math.max(0, (centre - margin) / denominator);
  const upper = Math.min(1, (centre + margin) / denominator);

  return { lower: precise(lower), upper: precise(upper) };
}

// ──────────────────────────────────────────────────────────
// 9. Precision-Recall Curve + PR-AUC
// ──────────────────────────────────────────────────────────

export function computePrCurve(results: DetectionResult[]): PrPoint[] {
  const points: PrPoint[] = [];
  const totalPositive = results.filter((r) => r.label === "ai").length;

  if (totalPositive === 0) return [{ recall: 0, precision: 1 }];

  for (let t = 0; t <= 100; t++) {
    const threshold = t / 100;
    let tp = 0;
    let fp = 0;

    for (const r of results) {
      const predicted = r.pangram_score >= threshold;
      if (predicted && r.label === "ai") tp++;
      if (predicted && r.label === "human") fp++;
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = totalPositive > 0 ? tp / totalPositive : 0;
    points.push({ recall: precise(recall), precision: precise(precision) });
  }

  // Sort by recall ascending for proper curve rendering
  points.sort((a, b) => a.recall - b.recall || b.precision - a.precision);

  // Deduplicate consecutive identical points
  const deduped: PrPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = deduped[deduped.length - 1];
    if (points[i].recall !== prev.recall || points[i].precision !== prev.precision) {
      deduped.push(points[i]);
    }
  }

  return deduped;
}

export function computePrAuc(curve: PrPoint[]): number {
  if (curve.length < 2) return 0;

  // Interpolated Average Precision (step-function interpolation)
  // Standard method per Davis & Goadrich (2006) — trapezoidal integration
  // overestimates PR-AUC because the PR curve is non-monotonic.
  const sorted = [...curve].sort((a, b) => b.recall - a.recall);

  // Sweep from high recall to low, tracking max precision seen so far
  let maxPrecision = 0;
  const interpolated: PrPoint[] = [];
  for (const pt of sorted) {
    maxPrecision = Math.max(maxPrecision, pt.precision);
    interpolated.push({ recall: pt.recall, precision: maxPrecision });
  }

  // Sort by recall ascending for integration
  interpolated.sort((a, b) => a.recall - b.recall);

  // Trapezoidal integration on the interpolated (monotonic) curve
  let auc = 0;
  for (let i = 1; i < interpolated.length; i++) {
    const dx = interpolated[i].recall - interpolated[i - 1].recall;
    const avgY = (interpolated[i].precision + interpolated[i - 1].precision) / 2;
    auc += dx * avgY;
  }

  return precise(auc);
}

// ──────────────────────────────────────────────────────────
// 10. Calibration Analysis
// ──────────────────────────────────────────────────────────

export function computeCalibration(
  results: DetectionResult[],
  numBins: number = 10,
): CalibrationBin[] {
  const bins: Array<{ predictions: number[]; actuals: number[] }> = [];
  for (let i = 0; i < numBins; i++) {
    bins.push({ predictions: [], actuals: [] });
  }

  for (const r of results) {
    const idx = Math.min(Math.floor(r.pangram_score * numBins), numBins - 1);
    bins[idx].predictions.push(r.pangram_score);
    bins[idx].actuals.push(r.label === "ai" ? 1 : 0);
  }

  const output: CalibrationBin[] = [];
  for (let i = 0; i < numBins; i++) {
    const bin = bins[i];
    const count = bin.predictions.length;
    if (count === 0) {
      output.push({
        bin_midpoint: precise((i + 0.5) / numBins),
        avg_predicted: 0,
        actual_positive_rate: 0,
        count: 0,
      });
      continue;
    }

    const avgPredicted =
      bin.predictions.reduce((s, v) => s + v, 0) / count;
    const actualPositiveRate =
      bin.actuals.reduce((s, v) => s + v, 0) / count;

    output.push({
      bin_midpoint: precise((i + 0.5) / numBins),
      avg_predicted: precise(avgPredicted),
      actual_positive_rate: precise(actualPositiveRate),
      count,
    });
  }

  return output;
}

// ──────────────────────────────────────────────────────────
// 11. Threshold Sensitivity Table
// ──────────────────────────────────────────────────────────

export function computeThresholdSensitivity(
  results: DetectionResult[],
): ThresholdEntry[] {
  // Note: 0.50 serves as the pre-specified reference threshold.
  // The optimal threshold (Youden's J) is selected on the same data —
  // metrics at that threshold represent apparent (not held-out) performance.
  const thresholds = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const totalPositive = results.filter((r) => r.label === "ai").length;
  const totalNegative = results.filter((r) => r.label === "human").length;
  const total = results.length;

  const entries: ThresholdEntry[] = [];

  for (const threshold of thresholds) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;

    for (const r of results) {
      const predicted = r.pangram_score >= threshold;
      if (r.label === "ai") {
        if (predicted) tp++;
        else fn++;
      } else {
        if (predicted) fp++;
        else tn++;
      }
    }

    const accuracy = total > 0 ? (tp + tn) / total : 0;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = totalPositive > 0 ? tp / totalPositive : 0;
    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;
    const fpr = totalNegative > 0 ? fp / totalNegative : 0;
    const specificity = totalNegative > 0 ? tn / totalNegative : 0;

    entries.push({
      threshold,
      accuracy: precise(accuracy),
      precision: precise(precision),
      recall: precise(recall),
      f1: precise(f1),
      fpr: precise(fpr),
      specificity: precise(specificity),
    });
  }

  return entries;
}

// ──────────────────────────────────────────────────────────
// 12. Bootstrap CI for AUC-ROC
// ──────────────────────────────────────────────────────────

export function bootstrapAucCI(
  results: DetectionResult[],
  nBootstrap: number = 1000,
  alpha: number = 0.05,
): { lower: number; upper: number; mean: number } {
  if (results.length === 0) return { lower: 0, upper: 0, mean: 0 };

  const aucs: number[] = [];
  const n = results.length;

  // Seeded pseudo-random for reproducibility (simple LCG)
  let seed = 42;
  const nextRand = (): number => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let b = 0; b < nBootstrap; b++) {
    // Resample with replacement
    const sample: DetectionResult[] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(nextRand() * n);
      sample.push(results[idx]);
    }

    // Skip degenerate bootstrap samples (all same label)
    const hasAi = sample.some((r) => r.label === "ai");
    const hasHuman = sample.some((r) => r.label === "human");
    if (!hasAi || !hasHuman) continue;

    const roc = computeRocCurve(sample);
    const auc = computeAuc(roc);
    aucs.push(auc);
  }

  if (aucs.length === 0) return { lower: 0, upper: 0, mean: 0 };

  aucs.sort((a, b) => a - b);

  const lowerIdx = Math.floor((alpha / 2) * aucs.length);
  const upperIdx = Math.min(
    Math.floor((1 - alpha / 2) * aucs.length),
    aucs.length - 1,
  );
  const mean = aucs.reduce((s, v) => s + v, 0) / aucs.length;

  return {
    lower: precise(aucs[lowerIdx]),
    upper: precise(aucs[upperIdx]),
    mean: precise(mean),
  };
}

// ──────────────────────────────────────────────────────────
// 13. Effect Size — Cohen's d
// ──────────────────────────────────────────────────────────

export function computeCohensD(
  results: DetectionResult[],
): number {
  const aiScores = results
    .filter((r) => r.label === "ai")
    .map((r) => r.pangram_score);
  const humanScores = results
    .filter((r) => r.label === "human")
    .map((r) => r.pangram_score);

  if (aiScores.length < 2 || humanScores.length < 2) return 0;

  const meanAi = aiScores.reduce((s, v) => s + v, 0) / aiScores.length;
  const meanHuman = humanScores.reduce((s, v) => s + v, 0) / humanScores.length;

  const varAi =
    aiScores.reduce((s, v) => s + (v - meanAi) ** 2, 0) /
    (aiScores.length - 1);
  const varHuman =
    humanScores.reduce((s, v) => s + (v - meanHuman) ** 2, 0) /
    (humanScores.length - 1);

  // Pooled standard deviation
  const pooledVar =
    ((aiScores.length - 1) * varAi + (humanScores.length - 1) * varHuman) /
    (aiScores.length + humanScores.length - 2);
  const pooledSd = Math.sqrt(pooledVar);

  if (pooledSd === 0) return 0;

  return precise((meanAi - meanHuman) / pooledSd);
}

// ──────────────────────────────────────────────────────────
// 14. AI-assisted analysis (v3 three-class breakdown)
// ──────────────────────────────────────────────────────────

function computeAiAssistedAnalysis(results: DetectionResult[]) {
  const aiResults = results.filter((r) => r.label === "ai");
  const humanResults = results.filter((r) => r.label === "human");

  const avgOnAi =
    aiResults.length > 0
      ? aiResults.reduce((s, r) => s + r.pangram_fraction_ai_assisted, 0) /
        aiResults.length
      : 0;

  const avgOnHuman =
    humanResults.length > 0
      ? humanResults.reduce(
          (s, r) => s + r.pangram_fraction_ai_assisted,
          0,
        ) / humanResults.length
      : 0;

  const mixedCount = results.filter(
    (r) => r.pangram_classification === "Mixed",
  ).length;

  return {
    avg_fraction_ai_assisted_on_ai: precise(avgOnAi),
    avg_fraction_ai_assisted_on_human: precise(avgOnHuman),
    texts_with_mixed_classification: mixedCount,
  };
}

// ──────────────────────────────────────────────────────────
// 9. Window-level analysis
// ──────────────────────────────────────────────────────────

function computeWindowAnalysis(results: DetectionResult[]) {
  const resultsWithWindows = results.filter(
    (r) => r.pangram_windows.length > 0,
  );

  if (resultsWithWindows.length === 0) {
    return {
      avg_windows_per_text: 0,
      avg_high_confidence_pct: 0,
      avg_ai_score_on_ai_windows: 0,
    };
  }

  let totalWindows = 0;
  let totalHighConf = 0;
  let aiWindowScoreSum = 0;
  let aiWindowCount = 0;

  for (const r of resultsWithWindows) {
    totalWindows += r.pangram_windows.length;
    for (const w of r.pangram_windows) {
      if (w.confidence === "High") totalHighConf++;
      if (w.label === "AI-Generated") {
        aiWindowScoreSum += w.ai_assistance_score;
        aiWindowCount++;
      }
    }
  }

  return {
    avg_windows_per_text: precise(
      totalWindows / resultsWithWindows.length,
      1,
    ),
    avg_high_confidence_pct: precise(
      (totalHighConf / totalWindows) * 100,
      1,
    ),
    avg_ai_score_on_ai_windows:
      aiWindowCount > 0 ? precise(aiWindowScoreSum / aiWindowCount) : 0,
  };
}

// ──────────────────────────────────────────────────────────
// 10. Summary statistics
// ──────────────────────────────────────────────────────────

function computeSummaryStats(
  cm: ConfusionMatrix,
  auc: number,
  totalSamples: number,
  optThreshold: number,
  extras: {
    prAuc: number;
    aucCi: { lower: number; upper: number; mean: number };
    cohensD: number;
  },
): Array<{ metric: string; value: string }> {
  const total = cm.tp + cm.fp + cm.fn + cm.tn;
  const accuracy = total > 0 ? (cm.tp + cm.tn) / total : 0;
  const precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
  const recall = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;
  const specificity = cm.tn + cm.fp > 0 ? cm.tn / (cm.tn + cm.fp) : 0;
  const fpr = cm.fp + cm.tn > 0 ? cm.fp / (cm.fp + cm.tn) : 0;

  // Cohen's d interpretation
  let dInterpretation = "negligible";
  const absD = Math.abs(extras.cohensD);
  if (absD >= 1.2) dInterpretation = "very large";
  else if (absD >= 0.8) dInterpretation = "large";
  else if (absD >= 0.5) dInterpretation = "medium";
  else if (absD >= 0.2) dInterpretation = "small";

  return [
    { metric: "Accuracy", value: `${(accuracy * 100).toFixed(1)}%` },
    { metric: "Precision", value: `${(precision * 100).toFixed(1)}%` },
    { metric: "Recall (Sensitivity)", value: `${(recall * 100).toFixed(1)}%` },
    { metric: "Specificity", value: `${(specificity * 100).toFixed(1)}%` },
    { metric: "F1 Score", value: `${(f1 * 100).toFixed(1)}%` },
    { metric: "False Positive Rate", value: `${(fpr * 100).toFixed(1)}%` },
    { metric: "AUC-ROC", value: auc.toFixed(4) },
    { metric: "AUC-ROC 95% CI", value: `[${extras.aucCi.lower.toFixed(4)}, ${extras.aucCi.upper.toFixed(4)}]` },
    { metric: "PR-AUC", value: extras.prAuc.toFixed(4) },
    { metric: "Cohen's d (effect size)", value: `${extras.cohensD.toFixed(4)} (${dInterpretation})` },
    { metric: "Optimal Threshold (Youden's J)", value: optThreshold.toFixed(2) },
    { metric: "Total Samples", value: String(totalSamples) },
  ];
}

// ══════════════════════════════════════════════════════════
// Main export: compute full validation report
// ══════════════════════════════════════════════════════════

export function computeValidationReport(
  results: DetectionResult[],
): ValidationReport {
  const aiSamples = results.filter((r) => r.label === "ai").length;
  const humanSamples = results.filter((r) => r.label === "human").length;

  const rocData = computeRocCurve(results);
  const aucRoc = computeAuc(rocData);
  const optimalThreshold = findOptimalThreshold(results);
  const confusionMatrix = computeConfusionMatrix(results, optimalThreshold);
  const perModel = computePerModel(results, optimalThreshold);
  const perPlatform = computePerPlatform(results, optimalThreshold);
  const confidenceDistribution = computeConfidenceDistribution(results);

  // New advanced metrics
  const prData = computePrCurve(results);
  const prAuc = computePrAuc(prData);
  const calibration = computeCalibration(results);
  const thresholdSensitivity = computeThresholdSensitivity(results);
  const aucCi = bootstrapAucCI(results);
  const cohensD = computeCohensD(results);

  const summaryStats = computeSummaryStats(
    confusionMatrix,
    aucRoc,
    results.length,
    optimalThreshold,
    { prAuc, aucCi, cohensD },
  );
  const aiAssistedAnalysis = computeAiAssistedAnalysis(results);
  const windowAnalysis = computeWindowAnalysis(results);

  return {
    generated_at: new Date().toISOString(),
    total_samples: results.length,
    ai_samples: aiSamples,
    human_samples: humanSamples,
    roc_data: rocData,
    auc_roc: aucRoc,
    optimal_threshold: optimalThreshold,
    confusion_matrix: confusionMatrix,
    per_model: perModel,
    per_platform: perPlatform,
    confidence_distribution: confidenceDistribution,
    summary_stats: summaryStats,
    pr_data: prData,
    pr_auc: prAuc,
    calibration,
    threshold_sensitivity: thresholdSensitivity,
    auc_ci: aucCi,
    ai_assisted_analysis: aiAssistedAnalysis,
    window_analysis: windowAnalysis,
  };
}

// ══════════════════════════════════════════════════════════
// Console formatter: pretty-print a validation report
// ══════════════════════════════════════════════════════════

export function formatReportForConsole(report: ValidationReport): string {
  const lines: string[] = [];
  const divider = "\u2550".repeat(60);
  const thinDivider = "\u2500".repeat(60);

  lines.push("");
  lines.push(divider);
  lines.push("  BALONEY VALIDATION PIPELINE REPORT (Pangram v3)");
  lines.push(divider);
  lines.push(`  Generated: ${report.generated_at}`);
  lines.push("");

  lines.push(`  Total samples:  ${report.total_samples}`);
  lines.push(`  AI samples:     ${report.ai_samples}`);
  lines.push(`  Human samples:  ${report.human_samples}`);
  lines.push("");

  // Summary stats
  lines.push(thinDivider);
  lines.push("  SUMMARY METRICS");
  lines.push(thinDivider);
  for (const stat of report.summary_stats) {
    lines.push(`  ${stat.metric.padEnd(30)} ${stat.value}`);
  }
  lines.push("");

  // Confusion matrix
  lines.push(thinDivider);
  lines.push("  CONFUSION MATRIX");
  lines.push(thinDivider);
  const cm = report.confusion_matrix;
  lines.push("                    Predicted AI   Predicted Human");
  lines.push(
    `  Actual AI       ${String(cm.tp).padStart(8)}       ${String(cm.fn).padStart(8)}`,
  );
  lines.push(
    `  Actual Human    ${String(cm.fp).padStart(8)}       ${String(cm.tn).padStart(8)}`,
  );
  lines.push("");

  // Per-model accuracy (with Wilson CI)
  if (report.per_model.length > 0) {
    lines.push(thinDivider);
    lines.push("  PER-MODEL ACCURACY");
    lines.push(thinDivider);
    lines.push(
      `  ${"Model".padEnd(14)} ${"Det %".padStart(7)} ${"95% CI".padStart(15)} ${"Avg AI".padStart(8)} ${"AI-Asst".padStart(8)} ${"Hi-Conf%".padStart(9)} ${"N".padStart(4)}`,
    );
    lines.push(
      `  ${"─".repeat(14)} ${"─".repeat(7)} ${"─".repeat(15)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(9)} ${"─".repeat(4)}`,
    );
    for (const m of report.per_model) {
      const ci = `[${m.detection_rate_ci.lower.toFixed(1)},${m.detection_rate_ci.upper.toFixed(1)}]`;
      lines.push(
        `  ${m.model.padEnd(14)} ${m.detection_rate.toFixed(1).padStart(7)} ${ci.padStart(15)} ${m.avg_confidence.toFixed(3).padStart(8)} ${m.avg_ai_assisted.toFixed(3).padStart(8)} ${m.avg_window_high_conf.toFixed(1).padStart(9)} ${String(m.n).padStart(4)}`,
      );
    }
    lines.push("");
  }

  // Per-platform accuracy (with Wilson CI)
  if (report.per_platform.length > 0) {
    lines.push(thinDivider);
    lines.push("  PER-PLATFORM ACCURACY");
    lines.push(thinDivider);
    lines.push(
      `  ${"Platform".padEnd(14)} ${"Det %".padStart(7)} ${"95% CI".padStart(15)} ${"Avg AI".padStart(8)} ${"AI-Asst".padStart(8)} ${"Hi-Conf%".padStart(9)} ${"N".padStart(4)}`,
    );
    lines.push(
      `  ${"─".repeat(14)} ${"─".repeat(7)} ${"─".repeat(15)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(9)} ${"─".repeat(4)}`,
    );
    for (const p of report.per_platform) {
      const ci = `[${p.detection_rate_ci.lower.toFixed(1)},${p.detection_rate_ci.upper.toFixed(1)}]`;
      lines.push(
        `  ${p.platform.padEnd(14)} ${p.detection_rate.toFixed(1).padStart(7)} ${ci.padStart(15)} ${p.avg_confidence.toFixed(3).padStart(8)} ${p.avg_ai_assisted.toFixed(3).padStart(8)} ${p.avg_window_high_conf.toFixed(1).padStart(9)} ${String(p.n).padStart(4)}`,
      );
    }
    lines.push("");
  }

  // AI-assisted analysis
  lines.push(thinDivider);
  lines.push("  AI-ASSISTED ANALYSIS (Pangram v3 Three-Class)");
  lines.push(thinDivider);
  lines.push(
    `  Avg fraction_ai_assisted on AI text:    ${report.ai_assisted_analysis.avg_fraction_ai_assisted_on_ai.toFixed(4)}`,
  );
  lines.push(
    `  Avg fraction_ai_assisted on human text:  ${report.ai_assisted_analysis.avg_fraction_ai_assisted_on_human.toFixed(4)}`,
  );
  lines.push(
    `  Texts with "Mixed" classification:       ${report.ai_assisted_analysis.texts_with_mixed_classification}`,
  );
  lines.push("");

  // Window analysis
  lines.push(thinDivider);
  lines.push("  WINDOW-LEVEL ANALYSIS");
  lines.push(thinDivider);
  lines.push(
    `  Avg windows per text:          ${report.window_analysis.avg_windows_per_text}`,
  );
  lines.push(
    `  Avg % "High" confidence:       ${report.window_analysis.avg_high_confidence_pct}%`,
  );
  lines.push(
    `  Avg AI score on AI windows:    ${report.window_analysis.avg_ai_score_on_ai_windows.toFixed(4)}`,
  );
  lines.push("");

  // Threshold sensitivity table
  if (report.threshold_sensitivity.length > 0) {
    lines.push(thinDivider);
    lines.push("  THRESHOLD SENSITIVITY");
    lines.push(thinDivider);
    lines.push(
      `  ${"Thresh".padEnd(8)} ${"Acc".padStart(7)} ${"Prec".padStart(7)} ${"Recall".padStart(7)} ${"F1".padStart(7)} ${"FPR".padStart(7)} ${"Spec".padStart(7)}`,
    );
    lines.push(
      `  ${"─".repeat(8)} ${"─".repeat(7)} ${"─".repeat(7)} ${"─".repeat(7)} ${"─".repeat(7)} ${"─".repeat(7)} ${"─".repeat(7)}`,
    );
    for (const t of report.threshold_sensitivity) {
      lines.push(
        `  ${t.threshold.toFixed(1).padEnd(8)} ${(t.accuracy * 100).toFixed(1).padStart(6)}% ${(t.precision * 100).toFixed(1).padStart(6)}% ${(t.recall * 100).toFixed(1).padStart(6)}% ${(t.f1 * 100).toFixed(1).padStart(6)}% ${(t.fpr * 100).toFixed(1).padStart(6)}% ${(t.specificity * 100).toFixed(1).padStart(6)}%`,
      );
    }
    lines.push("");
  }

  // Calibration analysis
  if (report.calibration.length > 0) {
    lines.push(thinDivider);
    lines.push("  CALIBRATION ANALYSIS");
    lines.push(thinDivider);
    lines.push(
      `  ${"Bin".padEnd(7)} ${"AvgPred".padStart(8)} ${"ActPos%".padStart(8)} ${"Count".padStart(6)} ${"Gap".padStart(8)}`,
    );
    lines.push(
      `  ${"─".repeat(7)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(6)} ${"─".repeat(8)}`,
    );
    for (const bin of report.calibration) {
      if (bin.count === 0) continue;
      const gap = Math.abs(bin.avg_predicted - bin.actual_positive_rate);
      lines.push(
        `  ${bin.bin_midpoint.toFixed(2).padEnd(7)} ${bin.avg_predicted.toFixed(4).padStart(8)} ${bin.actual_positive_rate.toFixed(4).padStart(8)} ${String(bin.count).padStart(6)} ${gap.toFixed(4).padStart(8)}`,
      );
    }
    lines.push("");
  }

  // PR-AUC
  lines.push(thinDivider);
  lines.push("  PRECISION-RECALL");
  lines.push(thinDivider);
  lines.push(`  PR-AUC:          ${report.pr_auc.toFixed(4)}`);
  lines.push(`  PR curve points: ${report.pr_data.length}`);
  lines.push("");

  // Bootstrap AUC CI
  lines.push(thinDivider);
  lines.push("  BOOTSTRAP AUC-ROC CONFIDENCE INTERVAL");
  lines.push(thinDivider);
  lines.push(
    `  AUC-ROC 95% CI:  [${report.auc_ci.lower.toFixed(4)}, ${report.auc_ci.upper.toFixed(4)}]`,
  );
  lines.push(`  Bootstrap mean:  ${report.auc_ci.mean.toFixed(4)}`);
  lines.push(`  Point estimate:  ${report.auc_roc.toFixed(4)}`);
  lines.push("");

  // Confidence distribution
  lines.push(thinDivider);
  lines.push("  CONFIDENCE DISTRIBUTION");
  lines.push(thinDivider);
  for (const bucket of report.confidence_distribution) {
    const aiBar = "\u2588".repeat(bucket.ai_count);
    const humanBar = "\u2593".repeat(bucket.human_count);
    lines.push(
      `  ${bucket.bucket}  AI:${String(bucket.ai_count).padStart(3)} ${aiBar}  Human:${String(bucket.human_count).padStart(3)} ${humanBar}`,
    );
  }
  lines.push("");

  lines.push(divider);
  lines.push("");

  return lines.join("\n");
}
