// ensemble-analyzer.ts — Core analysis functions for ensemble testing
// All functions are pure — take results array, return structured data.

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface EnsembleSampleResult {
  id: string;
  text_preview: string;
  text_length: number;
  label: "ai" | "human";
  model: string;
  platform: string;
  category: string;
  scores: {
    pangram: number | null;
    roberta: number | null;
    embeddings: number | null;
    chatgpt_det: number | null;
    statistical: number;
  };
  features: Record<string, number>;
  ensemble_score: number;
  pangram_only_score: number | null;
  ensemble_verdict: string;
  pangram_verdict: string | null;
  api_calls: Array<{ method: string; success: boolean; latency_ms: number; error?: string }>;
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface BucketMetrics {
  bucket: string;
  n: number;
  accuracy: number;
  fpr: number;
  fnr: number;
  f1: number;
}

export interface PlatformProfile {
  platform: string;
  n: number;
  pangram_accuracy: number;
  pangram_fpr: number;
  pangram_f1: number;
  ensemble_accuracy: number;
  ensemble_fpr: number;
  ensemble_f1: number;
}

export interface ModelDifficulty {
  model: string;
  n: number;
  pangram_detection_rate: number;
  ensemble_detection_rate: number;
  score_distribution: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  evasion_count: number;
}

export interface EnsembleValueResult {
  pangram_cm: ConfusionMatrix;
  ensemble_cm: ConfusionMatrix;
  rescued_samples: string[];
  lost_samples: string[];
  optimal_weights: Record<string, number>;
  optimal_f1: number;
}

export interface FeatureImportanceEntry {
  feature: string;
  standalone_auc: number;
  cohens_d: number;
  per_model_auc: Record<string, number>;
}

export interface ClaudeEvasionResult {
  evaded_samples: Array<{
    id: string;
    text_preview: string;
    text_length: number;
    pangram_score: number | null;
    ensemble_score: number;
    ensemble_recovered: boolean;
    features: Record<string, number>;
  }>;
  total_claude_samples: number;
  pangram_evasion_rate: number;
  ensemble_recovery_rate: number;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function precise(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

function computeMetrics(cm: ConfusionMatrix): {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  fnr: number;
  specificity: number;
} {
  const total = cm.tp + cm.fp + cm.fn + cm.tn;
  const accuracy = total > 0 ? (cm.tp + cm.tn) / total : 0;
  const precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
  const recall = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const fpr = cm.fp + cm.tn > 0 ? cm.fp / (cm.fp + cm.tn) : 0;
  const fnr = cm.tp + cm.fn > 0 ? cm.fn / (cm.tp + cm.fn) : 0;
  const specificity = 1 - fpr;
  return { accuracy, precision, recall, f1, fpr, fnr, specificity };
}

function makeConfusionMatrix(
  results: EnsembleSampleResult[],
  getScore: (r: EnsembleSampleResult) => number | null,
  threshold: number,
): ConfusionMatrix {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const r of results) {
    const score = getScore(r);
    if (score === null) continue;
    const predicted = score >= threshold;
    if (r.label === "ai") {
      if (predicted) tp++; else fn++;
    } else {
      if (predicted) fp++; else tn++;
    }
  }
  return { tp, fp, fn, tn };
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function computeAUC(
  results: EnsembleSampleResult[],
  getScore: (r: EnsembleSampleResult) => number,
): number {
  const totalPositive = results.filter((r) => r.label === "ai").length;
  const totalNegative = results.filter((r) => r.label === "human").length;
  if (totalPositive === 0 || totalNegative === 0) return 0.5;

  const points: Array<{ fpr: number; tpr: number }> = [];
  for (let t = 0; t <= 100; t++) {
    const threshold = t / 100;
    let tp = 0, fp = 0;
    for (const r of results) {
      const score = getScore(r);
      if (score >= threshold) {
        if (r.label === "ai") tp++; else fp++;
      }
    }
    points.push({
      fpr: fp / totalNegative,
      tpr: tp / totalPositive,
    });
  }
  points.sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);

  let auc = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].fpr - points[i - 1].fpr;
    const avgY = (points[i].tpr + points[i - 1].tpr) / 2;
    auc += dx * avgY;
  }
  return precise(auc);
}

function computeCohensD(
  aiValues: number[],
  humanValues: number[],
): number {
  if (aiValues.length < 2 || humanValues.length < 2) return 0;
  const meanAi = aiValues.reduce((s, v) => s + v, 0) / aiValues.length;
  const meanHuman = humanValues.reduce((s, v) => s + v, 0) / humanValues.length;
  const varAi = aiValues.reduce((s, v) => s + (v - meanAi) ** 2, 0) / (aiValues.length - 1);
  const varHuman = humanValues.reduce((s, v) => s + (v - meanHuman) ** 2, 0) / (humanValues.length - 1);
  const pooledVar = ((aiValues.length - 1) * varAi + (humanValues.length - 1) * varHuman) / (aiValues.length + humanValues.length - 2);
  const pooledSd = Math.sqrt(pooledVar);
  if (pooledSd === 0) return 0;
  return precise((meanAi - meanHuman) / pooledSd);
}

// ──────────────────────────────────────────────
// Ensemble Computation
// ──────────────────────────────────────────────

const DEFAULT_WEIGHTS: Record<string, number> = {
  pangram: 0.38,
  roberta: 0.25,
  chatgpt_det: 0.20,
  embeddings: 0.15,
  statistical: 0.15,
};

export function computeEnsembleScore(scores: {
  pangram: number | null;
  roberta: number | null;
  embeddings: number | null;
  chatgpt_det: number | null;
  statistical: number;
}, weights: Record<string, number> = DEFAULT_WEIGHTS): {
  finalScore: number;
  methodsUsed: string[];
  normalizedWeights: Record<string, number>;
} {
  const methodsUsed: string[] = [];
  const normalizedWeights: Record<string, number> = {};
  let totalWeight = 0;
  let weightedSum = 0;

  const entries: Array<{ key: string; score: number; weight: number }> = [];
  if (scores.pangram !== null) entries.push({ key: "pangram", score: scores.pangram, weight: weights.pangram ?? 0.38 });
  if (scores.roberta !== null) entries.push({ key: "roberta", score: scores.roberta, weight: weights.roberta ?? 0.25 });
  if (scores.chatgpt_det !== null) entries.push({ key: "chatgpt_det", score: scores.chatgpt_det, weight: weights.chatgpt_det ?? 0.20 });
  if (scores.embeddings !== null) entries.push({ key: "embeddings", score: scores.embeddings, weight: weights.embeddings ?? 0.15 });
  entries.push({ key: "statistical", score: scores.statistical, weight: weights.statistical ?? 0.15 });

  for (const e of entries) {
    totalWeight += e.weight;
  }

  for (const e of entries) {
    const normWeight = totalWeight > 0 ? e.weight / totalWeight : 0;
    normalizedWeights[e.key] = precise(normWeight);
    weightedSum += e.score * normWeight;
    methodsUsed.push(e.key);
  }

  return {
    finalScore: precise(weightedSum),
    methodsUsed,
    normalizedWeights,
  };
}

export function getVerdict(score: number, threshold = 0.5): string {
  if (score > 0.75) return "ai_generated";
  if (score > 0.55) return "heavy_edit";
  if (score > threshold) return "light_edit";
  return "human";
}

// ──────────────────────────────────────────────
// Analysis 1: Text Length vs Accuracy
// ──────────────────────────────────────────────

export function analyzeLengthVsAccuracy(
  results: EnsembleSampleResult[],
  config: { buckets?: Array<[number, number]>; threshold?: number } = {},
): { pangram: BucketMetrics[]; ensemble: BucketMetrics[] } {
  const threshold = config.threshold ?? 0.5;
  const buckets = config.buckets ?? [[0, 200], [200, 400], [400, 800], [800, Infinity]];

  const pangramBuckets: BucketMetrics[] = [];
  const ensembleBuckets: BucketMetrics[] = [];

  for (const [lo, hi] of buckets) {
    const label = hi === Infinity ? `${lo}+` : `${lo}-${hi}`;
    const subset = results.filter((r) => r.text_length >= lo && r.text_length < hi);

    if (subset.length === 0) {
      pangramBuckets.push({ bucket: label, n: 0, accuracy: 0, fpr: 0, fnr: 0, f1: 0 });
      ensembleBuckets.push({ bucket: label, n: 0, accuracy: 0, fpr: 0, fnr: 0, f1: 0 });
      continue;
    }

    const pangramCM = makeConfusionMatrix(subset, (r) => r.pangram_only_score, threshold);
    const ensembleCM = makeConfusionMatrix(subset, (r) => r.ensemble_score, threshold);
    const pm = computeMetrics(pangramCM);
    const em = computeMetrics(ensembleCM);

    pangramBuckets.push({ bucket: label, n: subset.length, accuracy: precise(pm.accuracy), fpr: precise(pm.fpr), fnr: precise(pm.fnr), f1: precise(pm.f1) });
    ensembleBuckets.push({ bucket: label, n: subset.length, accuracy: precise(em.accuracy), fpr: precise(em.fpr), fnr: precise(em.fnr), f1: precise(em.f1) });
  }

  return { pangram: pangramBuckets, ensemble: ensembleBuckets };
}

// ──────────────────────────────────────────────
// Analysis 2: Platform Profiles
// ──────────────────────────────────────────────

export function analyzePlatformProfiles(
  results: EnsembleSampleResult[],
  threshold = 0.5,
): PlatformProfile[] {
  const platforms = new Map<string, EnsembleSampleResult[]>();
  for (const r of results) {
    if (!platforms.has(r.platform)) platforms.set(r.platform, []);
    platforms.get(r.platform)!.push(r);
  }

  const profiles: PlatformProfile[] = [];
  for (const [platform, subset] of platforms) {
    const pangramCM = makeConfusionMatrix(subset, (r) => r.pangram_only_score, threshold);
    const ensembleCM = makeConfusionMatrix(subset, (r) => r.ensemble_score, threshold);
    const pm = computeMetrics(pangramCM);
    const em = computeMetrics(ensembleCM);

    profiles.push({
      platform,
      n: subset.length,
      pangram_accuracy: precise(pm.accuracy),
      pangram_fpr: precise(pm.fpr),
      pangram_f1: precise(pm.f1),
      ensemble_accuracy: precise(em.accuracy),
      ensemble_fpr: precise(em.fpr),
      ensemble_f1: precise(em.f1),
    });
  }

  return profiles.sort((a, b) => b.n - a.n);
}

// ──────────────────────────────────────────────
// Analysis 3: Model Difficulty Ranking
// ──────────────────────────────────────────────

export function analyzeModelDifficulty(
  results: EnsembleSampleResult[],
  threshold = 0.5,
): ModelDifficulty[] {
  const models = new Map<string, EnsembleSampleResult[]>();
  for (const r of results) {
    if (!models.has(r.model)) models.set(r.model, []);
    models.get(r.model)!.push(r);
  }

  const rankings: ModelDifficulty[] = [];
  for (const [model, subset] of models) {
    const aiSubset = subset.filter((r) => r.label === "ai");
    const ensembleScores = aiSubset.map((r) => r.ensemble_score).sort((a, b) => a - b);
    const pangramDetected = aiSubset.filter((r) => r.pangram_only_score !== null && r.pangram_only_score >= threshold).length;
    const ensembleDetected = aiSubset.filter((r) => r.ensemble_score >= threshold).length;
    const evasionCount = aiSubset.filter(
      (r) => r.ensemble_score < threshold && (r.pangram_only_score === null || r.pangram_only_score < threshold),
    ).length;

    rankings.push({
      model,
      n: subset.length,
      pangram_detection_rate: aiSubset.length > 0 ? precise(pangramDetected / aiSubset.length) : 0,
      ensemble_detection_rate: aiSubset.length > 0 ? precise(ensembleDetected / aiSubset.length) : 0,
      score_distribution: {
        min: ensembleScores.length > 0 ? ensembleScores[0] : 0,
        q1: quantile(ensembleScores, 0.25),
        median: quantile(ensembleScores, 0.5),
        q3: quantile(ensembleScores, 0.75),
        max: ensembleScores.length > 0 ? ensembleScores[ensembleScores.length - 1] : 0,
      },
      evasion_count: evasionCount,
    });
  }

  // Sort by ensemble detection rate ascending (hardest to detect first)
  return rankings.sort((a, b) => a.ensemble_detection_rate - b.ensemble_detection_rate);
}

// ──────────────────────────────────────────────
// Analysis 4: Ensemble Value Proposition
// ──────────────────────────────────────────────

export function analyzeEnsembleValue(
  results: EnsembleSampleResult[],
  threshold = 0.5,
): EnsembleValueResult {
  const pangramCM = makeConfusionMatrix(results, (r) => r.pangram_only_score, threshold);
  const ensembleCM = makeConfusionMatrix(results, (r) => r.ensemble_score, threshold);

  // Find rescued and lost samples
  const rescued: string[] = [];
  const lost: string[] = [];
  for (const r of results) {
    const pangramCorrect = r.pangram_only_score !== null
      ? (r.label === "ai" ? r.pangram_only_score >= threshold : r.pangram_only_score < threshold)
      : false;
    const ensembleCorrect = r.label === "ai" ? r.ensemble_score >= threshold : r.ensemble_score < threshold;

    if (ensembleCorrect && !pangramCorrect) rescued.push(r.id);
    if (!ensembleCorrect && pangramCorrect) lost.push(r.id);
  }

  // Grid search for optimal weights
  let bestF1 = 0;
  let bestWeights: Record<string, number> = { ...DEFAULT_WEIGHTS };

  for (let pw = 0.20; pw <= 0.60; pw += 0.05) {
    for (let rw = 0.10; rw <= 0.30; rw += 0.05) {
      for (let cw = 0.10; cw <= 0.25; cw += 0.05) {
        const remaining = 1.0 - pw - rw - cw;
        if (remaining < 0.05) continue;
        const ew = remaining * 0.5;
        const sw = remaining * 0.5;

        const weights = { pangram: pw, roberta: rw, chatgpt_det: cw, embeddings: ew, statistical: sw };
        const cm = makeConfusionMatrix(
          results,
          (r) => computeEnsembleScore(r.scores, weights).finalScore,
          threshold,
        );
        const m = computeMetrics(cm);

        if (m.f1 > bestF1) {
          bestF1 = m.f1;
          bestWeights = weights;
        }
      }
    }
  }

  return {
    pangram_cm: pangramCM,
    ensemble_cm: ensembleCM,
    rescued_samples: rescued,
    lost_samples: lost,
    optimal_weights: Object.fromEntries(
      Object.entries(bestWeights).map(([k, v]) => [k, precise(v)])
    ),
    optimal_f1: precise(bestF1),
  };
}

// ──────────────────────────────────────────────
// Analysis 5: Feature Importance
// ──────────────────────────────────────────────

export function analyzeFeatureImportance(
  results: EnsembleSampleResult[],
): FeatureImportanceEntry[] {
  // Get all feature keys from first result
  const featureKeys = results.length > 0 ? Object.keys(results[0].features) : [];
  const entries: FeatureImportanceEntry[] = [];

  for (const feature of featureKeys) {
    const aiValues = results.filter((r) => r.label === "ai").map((r) => r.features[feature] ?? 0);
    const humanValues = results.filter((r) => r.label === "human").map((r) => r.features[feature] ?? 0);

    const standaloneAuc = computeAUC(results, (r) => r.features[feature] ?? 0);
    const cohensD = computeCohensD(aiValues, humanValues);

    // Per-model AUC
    const perModelAuc: Record<string, number> = {};
    const models = new Set(results.map((r) => r.model));
    for (const model of models) {
      const modelResults = results.filter((r) => r.model === model || r.label === "human");
      if (modelResults.filter((r) => r.label === "ai").length > 2) {
        perModelAuc[model] = computeAUC(modelResults, (r) => r.features[feature] ?? 0);
      }
    }

    entries.push({
      feature,
      standalone_auc: standaloneAuc,
      cohens_d: cohensD,
      per_model_auc: perModelAuc,
    });
  }

  // Sort by absolute Cohen's d descending
  return entries.sort((a, b) => Math.abs(b.cohens_d) - Math.abs(a.cohens_d));
}

// ──────────────────────────────────────────────
// Analysis 6: Claude Evasion Deep Dive
// ──────────────────────────────────────────────

export function analyzeClaudeEvasion(
  results: EnsembleSampleResult[],
  threshold = 0.5,
): ClaudeEvasionResult {
  const claudeResults = results.filter((r) => r.model === "claude" && r.label === "ai");
  const evadedPangram = claudeResults.filter(
    (r) => r.pangram_only_score === null || r.pangram_only_score < threshold,
  );

  const evadedSamples = evadedPangram.map((r) => ({
    id: r.id,
    text_preview: r.text_preview,
    text_length: r.text_length,
    pangram_score: r.pangram_only_score,
    ensemble_score: r.ensemble_score,
    ensemble_recovered: r.ensemble_score >= threshold,
    features: r.features,
  }));

  const recoveredCount = evadedSamples.filter((s) => s.ensemble_recovered).length;

  return {
    evaded_samples: evadedSamples,
    total_claude_samples: claudeResults.length,
    pangram_evasion_rate: claudeResults.length > 0 ? precise(evadedPangram.length / claudeResults.length) : 0,
    ensemble_recovery_rate: evadedPangram.length > 0 ? precise(recoveredCount / evadedPangram.length) : 0,
  };
}
