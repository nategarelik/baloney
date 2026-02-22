// ensemble-evaluation-data.ts — Cross-model ensemble testing results
// Hardcoded data from the ensemble harness run (scripts/data/).
// Follows the same pattern as evaluation-data.ts: static exports for Recharts.

// ──────────────────────────────────────────────────────────
// 1. Comparison: Pangram-only vs Ensemble
// ──────────────────────────────────────────────────────────

export interface EnsembleComparisonRow {
  metric: string;
  pangram_only: number;
  ensemble: number;
  delta: number;
}

export const ensembleComparison: EnsembleComparisonRow[] = [
  { metric: "Accuracy", pangram_only: 63, ensemble: 49, delta: -14 },
  { metric: "Precision", pangram_only: 64, ensemble: 76.9, delta: 12.9 },
  { metric: "Recall", pangram_only: 94.1, ensemble: 7.2, delta: -86.9 },
  { metric: "F1", pangram_only: 76.2, ensemble: 13.2, delta: -63 },
  { metric: "FPR", pangram_only: 90, ensemble: 2.5, delta: -87.5 },
  { metric: "Specificity", pangram_only: 10, ensemble: 97.5, delta: 87.5 },
];

// ──────────────────────────────────────────────────────────
// 2. Per-model difficulty (grouped bar chart)
// ──────────────────────────────────────────────────────────

export interface EnsembleModelDifficultyRow {
  model: string;
  n: number;
  pangram_det: number;
  ensemble_det: number;
  evasions: number;
}

export const ensembleModelDifficulty: EnsembleModelDifficultyRow[] = [
  { model: "claude", n: 28, pangram_det: 35.7, ensemble_det: 0.0, evasions: 18 },
  { model: "chatgpt", n: 17, pangram_det: 70.6, ensemble_det: 5.9, evasions: 4 },
  { model: "gemini", n: 20, pangram_det: 50.0, ensemble_det: 10.0, evasions: 10 },
  { model: "llama", n: 5, pangram_det: 0.0, ensemble_det: 0.0, evasions: 5 },
  { model: "mistral", n: 5, pangram_det: 0.0, ensemble_det: 0.0, evasions: 5 },
  { model: "mixed", n: 64, pangram_det: 0.0, ensemble_det: 10.9, evasions: 57 },
];

// ──────────────────────────────────────────────────────────
// 3. Length vs accuracy (line chart)
// ──────────────────────────────────────────────────────────

export interface EnsembleLengthBucket {
  bucket: string;
  pangram_accuracy: number;
  pangram_fpr: number;
  ensemble_accuracy: number;
  ensemble_fpr: number;
  n: number;
}

export const ensembleLengthData: EnsembleLengthBucket[] = [
  { bucket: "0-200", pangram_accuracy: 0, pangram_fpr: 0, ensemble_accuracy: 100, ensemble_fpr: 0, n: 9 },
  { bucket: "200-400", pangram_accuracy: 50, pangram_fpr: 0, ensemble_accuracy: 20, ensemble_fpr: 0, n: 5 },
  { bucket: "400-800", pangram_accuracy: 56.1, pangram_fpr: 90, ensemble_accuracy: 46.2, ensemble_fpr: 8.1, n: 78 },
  { bucket: "800+", pangram_accuracy: 100, pangram_fpr: 0, ensemble_accuracy: 48.5, ensemble_fpr: 0, n: 167 },
];

// ──────────────────────────────────────────────────────────
// 4. Feature importance (horizontal bar chart)
// ──────────────────────────────────────────────────────────

export interface EnsembleFeatureRow {
  feature: string;
  cohens_d: number;
  abs_d: number;
  auc: number;
}

export const ensembleFeatureImportance: EnsembleFeatureRow[] = [
  { feature: "word_len_signal", cohens_d: 0.959, abs_d: 0.959, auc: 0.784 },
  { feature: "readability", cohens_d: 0.772, abs_d: 0.772, auc: 0.728 },
  { feature: "perplexity_norm", cohens_d: -0.665, abs_d: 0.665, auc: 0.226 },
  { feature: "burstiness", cohens_d: -0.601, abs_d: 0.601, auc: 0.302 },
  { feature: "sent_len_signal", cohens_d: 0.510, abs_d: 0.510, auc: 0.636 },
  { feature: "ttr", cohens_d: 0.374, abs_d: 0.374, auc: 0.612 },
  { feature: "repetition", cohens_d: -0.374, abs_d: 0.374, auc: 0.389 },
  { feature: "entropy_signal", cohens_d: -0.310, abs_d: 0.310, auc: 0.403 },
  { feature: "comma_density_signal", cohens_d: 0.301, abs_d: 0.301, auc: 0.584 },
  { feature: "transition_signal", cohens_d: 0.244, abs_d: 0.244, auc: 0.556 },
  { feature: "hedging_signal", cohens_d: 0.217, abs_d: 0.217, auc: 0.517 },
  { feature: "expressive_signal", cohens_d: 0.044, abs_d: 0.044, auc: 0.469 },
];

// ──────────────────────────────────────────────────────────
// 5. Platform profiles (bar chart)
// ──────────────────────────────────────────────────────────

export interface EnsemblePlatformRow {
  platform: string;
  n: number;
  pangram_acc: number;
  ensemble_acc: number;
}

export const ensemblePlatformProfiles: EnsemblePlatformRow[] = [
  { platform: "mixed", n: 225, pangram_acc: 10, ensemble_acc: 55.6 },
  { platform: "facebook", n: 12, pangram_acc: 100, ensemble_acc: 8.3 },
  { platform: "linkedin", n: 12, pangram_acc: 100, ensemble_acc: 8.3 },
  { platform: "x", n: 10, pangram_acc: 80, ensemble_acc: 0 },
];

// ──────────────────────────────────────────────────────────
// 6. Claude evasion callout
// ──────────────────────────────────────────────────────────

export interface ClaudeEvasionSample {
  id: string;
  preview: string;
  length: number;
  pangram: number;
  ensemble: number;
}

export interface ClaudeEvasionData {
  total_claude_ai_samples: number;
  pangram_evasion_rate: number;
  ensemble_recovery_rate: number;
  key_evasion_samples: ClaudeEvasionSample[];
}

export const ensembleClaudeEvasion: ClaudeEvasionData = {
  total_claude_ai_samples: 28,
  pangram_evasion_rate: 64.3,
  ensemble_recovery_rate: 0.0,
  key_evasion_samples: [
    {
      id: "0f84a277",
      preview: "we're literally teaching kids...",
      length: 313,
      pangram: 0.0,
      ensemble: 0.151,
    },
    {
      id: "b6a41527",
      preview: "The office is just expensive...",
      length: 385,
      pangram: 0.0,
      ensemble: 0.100,
    },
  ],
};

// ──────────────────────────────────────────────────────────
// 7. Confusion matrices (cross-model, 54 samples)
// ──────────────────────────────────────────────────────────

export interface EnsembleConfusionEntry {
  label: string;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export const ensembleConfusionMatrices: EnsembleConfusionEntry[] = [
  { label: "Pangram-only (threshold 0.5)", tp: 32, fp: 18, fn: 2, tn: 2 },
  { label: "Ensemble (threshold 0.5)", tp: 3, fp: 1, fn: 31, tn: 19 },
];

// ──────────────────────────────────────────────────────────
// 8. Optimal weights from grid search
// ──────────────────────────────────────────────────────────

export interface EnsembleOptimalWeights {
  weights: Record<string, number>;
  optimal_f1: number;
}

export const ensembleOptimalWeights: EnsembleOptimalWeights = {
  weights: {
    pangram: 0.55,
    roberta: 0.1,
    chatgpt_det: 0.25,
    embeddings: 0.05,
    statistical: 0.05,
  },
  optimal_f1: 49.5,
};

// ──────────────────────────────────────────────────────────
// 9. Honest caveats
// ──────────────────────────────────────────────────────────

export const ensembleHonestCaveats: string[] = [
  "Pangram FPR is 90% at 0.5 threshold \u2014 likely needs recalibration",
  "2 Claude X/Twitter posts evade all detection (Pangram + ensemble)",
  "Sample sizes are small (54-236) \u2014 confidence intervals are wide",
  "HuggingFace models are research-grade, not production-calibrated",
  "Ensemble weights are from engineering intuition, not ML optimization",
  "Dataset samples lack Pangram scores \u2014 statistical-only used as single-method baseline for comparison B",
  "No held-out test set \u2014 all metrics are apparent (training) performance",
  "Text length distribution is not uniform across models/platforms",
];
