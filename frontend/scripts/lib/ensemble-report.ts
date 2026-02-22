// ensemble-report.ts — Reporting for ensemble test harness
// Console output + JSON file writing

import { writeFileSync } from "fs";
import { resolve } from "path";
import type {
  EnsembleSampleResult,
  BucketMetrics,
  PlatformProfile,
  ModelDifficulty,
  EnsembleValueResult,
  FeatureImportanceEntry,
  ClaudeEvasionResult,
  ConfusionMatrix,
} from "./ensemble-analyzer.ts";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface EnsembleReport {
  generated_at: string;
  pipeline_version: string;
  total_samples: number;
  cross_model_samples: number;
  curated_samples: number;
  comparison: {
    pangram_only: MetricsSummary;
    ensemble: MetricsSummary;
    delta: MetricsSummary;
  };
  length_analysis: { pangram: BucketMetrics[]; ensemble: BucketMetrics[] };
  platform_profiles: PlatformProfile[];
  model_difficulty: ModelDifficulty[];
  ensemble_value: EnsembleValueResult;
  feature_importance: FeatureImportanceEntry[];
  claude_evasion: ClaudeEvasionResult;
  api_call_summary: {
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    avg_latency_ms: number;
    per_method: Record<string, { calls: number; successes: number; avg_latency: number }>;
  };
  honest_caveats: string[];
}

export interface MetricsSummary {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  specificity: number;
}

// ──────────────────────────────────────────────
// Honest Caveats
// ──────────────────────────────────────────────

export const HONEST_CAVEATS = [
  "Pangram FPR is 90% at 0.5 threshold — likely needs recalibration",
  "2 Claude X/Twitter posts evade all detection (Pangram + ensemble)",
  "Sample sizes are small (54-236) — confidence intervals are wide",
  "HuggingFace models are research-grade, not production-calibrated",
  "Ensemble weights are from engineering intuition, not ML optimization",
  "Dataset samples lack Pangram scores — statistical-only used as single-method baseline for comparison B",
  "No held-out test set — all metrics are apparent (training) performance",
  "Text length distribution is not uniform across models/platforms",
];

// ──────────────────────────────────────────────
// Metrics from confusion matrix
// ──────────────────────────────────────────────

function metricsFromCM(cm: ConfusionMatrix): MetricsSummary {
  const total = cm.tp + cm.fp + cm.fn + cm.tn;
  const accuracy = total > 0 ? (cm.tp + cm.tn) / total : 0;
  const precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
  const recall = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const fpr = cm.fp + cm.tn > 0 ? cm.fp / (cm.fp + cm.tn) : 0;
  return {
    accuracy: parseFloat((accuracy * 100).toFixed(1)),
    precision: parseFloat((precision * 100).toFixed(1)),
    recall: parseFloat((recall * 100).toFixed(1)),
    f1: parseFloat((f1 * 100).toFixed(1)),
    fpr: parseFloat((fpr * 100).toFixed(1)),
    specificity: parseFloat(((1 - fpr) * 100).toFixed(1)),
  };
}

function deltaMetrics(a: MetricsSummary, b: MetricsSummary): MetricsSummary {
  return {
    accuracy: parseFloat((b.accuracy - a.accuracy).toFixed(1)),
    precision: parseFloat((b.precision - a.precision).toFixed(1)),
    recall: parseFloat((b.recall - a.recall).toFixed(1)),
    f1: parseFloat((b.f1 - a.f1).toFixed(1)),
    fpr: parseFloat((b.fpr - a.fpr).toFixed(1)),
    specificity: parseFloat((b.specificity - a.specificity).toFixed(1)),
  };
}

// ──────────────────────────────────────────────
// Console Formatter
// ──────────────────────────────────────────────

export function formatConsoleReport(report: EnsembleReport): string {
  const lines: string[] = [];
  const divider = "═".repeat(60);
  const thin = "─".repeat(60);

  lines.push("");
  lines.push(divider);
  lines.push("  BALONEY ENSEMBLE TEST HARNESS RESULTS");
  lines.push(`  ${report.cross_model_samples} cross-model + ${report.curated_samples} curated = ${report.total_samples} total samples`);
  lines.push(divider);
  lines.push(`  Generated: ${report.generated_at}`);
  lines.push(`  Pipeline: ${report.pipeline_version}`);
  lines.push("");

  // Configuration comparison
  lines.push(thin);
  lines.push("  CONFIGURATION COMPARISON");
  lines.push(thin);
  lines.push(`  ${"Metric".padEnd(18)} ${"Pangram-only".padStart(14)} ${"Ensemble".padStart(14)} ${"Delta".padStart(10)}`);
  lines.push(`  ${"─".repeat(18)} ${"─".repeat(14)} ${"─".repeat(14)} ${"─".repeat(10)}`);

  const metrics: Array<keyof MetricsSummary> = ["accuracy", "precision", "recall", "f1", "fpr", "specificity"];
  for (const m of metrics) {
    const p = report.comparison.pangram_only[m];
    const e = report.comparison.ensemble[m];
    const d = report.comparison.delta[m];
    const sign = d > 0 ? "+" : "";
    lines.push(`  ${m.padEnd(18)} ${(p + "%").padStart(14)} ${(e + "%").padStart(14)} ${(sign + d + "%").padStart(10)}`);
  }
  lines.push("");

  // Model difficulty
  lines.push(thin);
  lines.push("  CROSS-MODEL DIFFICULTY RANKING");
  lines.push(thin);
  lines.push(`  ${"Model".padEnd(12)} ${"Pangram Det".padStart(13)} ${"Ensemble Det".padStart(14)} ${"Evasions".padStart(10)} ${"N".padStart(4)}`);
  lines.push(`  ${"─".repeat(12)} ${"─".repeat(13)} ${"─".repeat(14)} ${"─".repeat(10)} ${"─".repeat(4)}`);
  for (const m of report.model_difficulty) {
    lines.push(
      `  ${m.model.padEnd(12)} ${((m.pangram_detection_rate * 100).toFixed(1) + "%").padStart(13)} ${((m.ensemble_detection_rate * 100).toFixed(1) + "%").padStart(14)} ${String(m.evasion_count).padStart(10)} ${String(m.n).padStart(4)}`,
    );
  }
  lines.push("");

  // Text length vs accuracy
  lines.push(thin);
  lines.push("  TEXT LENGTH vs ACCURACY");
  lines.push(thin);
  lines.push(`  ${"Bucket".padEnd(10)} ${"P-Acc%".padStart(8)} ${"E-Acc%".padStart(8)} ${"P-FPR%".padStart(8)} ${"E-FPR%".padStart(8)} ${"N".padStart(5)}`);
  lines.push(`  ${"─".repeat(10)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(5)}`);
  for (let i = 0; i < report.length_analysis.pangram.length; i++) {
    const pb = report.length_analysis.pangram[i];
    const eb = report.length_analysis.ensemble[i];
    lines.push(
      `  ${pb.bucket.padEnd(10)} ${((pb.accuracy * 100).toFixed(1)).padStart(8)} ${((eb.accuracy * 100).toFixed(1)).padStart(8)} ${((pb.fpr * 100).toFixed(1)).padStart(8)} ${((eb.fpr * 100).toFixed(1)).padStart(8)} ${String(pb.n).padStart(5)}`,
    );
  }
  lines.push("");

  // Ensemble value
  lines.push(thin);
  lines.push("  ENSEMBLE VALUE PROPOSITION");
  lines.push(thin);
  lines.push(`  Rescued samples (ensemble correct, Pangram wrong): ${report.ensemble_value.rescued_samples.length}`);
  lines.push(`  Lost samples (Pangram correct, ensemble wrong):    ${report.ensemble_value.lost_samples.length}`);
  lines.push(`  Net improvement: ${report.ensemble_value.rescued_samples.length - report.ensemble_value.lost_samples.length} samples`);
  lines.push(`  Optimal F1: ${(report.ensemble_value.optimal_f1 * 100).toFixed(1)}%`);
  lines.push(`  Optimal weights: ${JSON.stringify(report.ensemble_value.optimal_weights)}`);
  lines.push("");

  // Claude evasion
  lines.push(thin);
  lines.push("  CLAUDE EVASION ANALYSIS");
  lines.push(thin);
  lines.push(`  Total Claude AI samples: ${report.claude_evasion.total_claude_samples}`);
  lines.push(`  Pangram evasion rate:    ${(report.claude_evasion.pangram_evasion_rate * 100).toFixed(1)}%`);
  lines.push(`  Ensemble recovery rate:  ${(report.claude_evasion.ensemble_recovery_rate * 100).toFixed(1)}%`);
  if (report.claude_evasion.evaded_samples.length > 0) {
    lines.push("  Evaded samples:");
    for (const s of report.claude_evasion.evaded_samples) {
      lines.push(`    ${s.id}: pangram=${s.pangram_score?.toFixed(3) ?? "null"} → ensemble=${s.ensemble_score.toFixed(3)} (${s.ensemble_recovered ? "RECOVERED" : "STILL EVADED"}) [${s.text_length} chars]`);
    }
  }
  lines.push("");

  // Feature importance (top 5)
  lines.push(thin);
  lines.push("  TOP FEATURES BY COHEN'S d");
  lines.push(thin);
  const topFeatures = report.feature_importance.slice(0, 8);
  lines.push(`  ${"Feature".padEnd(25)} ${"Cohen's d".padStart(10)} ${"AUC".padStart(8)}`);
  lines.push(`  ${"─".repeat(25)} ${"─".repeat(10)} ${"─".repeat(8)}`);
  for (const f of topFeatures) {
    lines.push(`  ${f.feature.padEnd(25)} ${f.cohens_d.toFixed(3).padStart(10)} ${f.standalone_auc.toFixed(3).padStart(8)}`);
  }
  lines.push("");

  // Platform profiles
  lines.push(thin);
  lines.push("  PLATFORM DETECTION PROFILES");
  lines.push(thin);
  lines.push(`  ${"Platform".padEnd(12)} ${"P-Acc%".padStart(8)} ${"E-Acc%".padStart(8)} ${"P-FPR%".padStart(8)} ${"E-FPR%".padStart(8)} ${"N".padStart(5)}`);
  lines.push(`  ${"─".repeat(12)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(5)}`);
  for (const p of report.platform_profiles) {
    lines.push(
      `  ${p.platform.padEnd(12)} ${(p.pangram_accuracy * 100).toFixed(1).padStart(8)} ${(p.ensemble_accuracy * 100).toFixed(1).padStart(8)} ${(p.pangram_fpr * 100).toFixed(1).padStart(8)} ${(p.ensemble_fpr * 100).toFixed(1).padStart(8)} ${String(p.n).padStart(5)}`,
    );
  }
  lines.push("");

  // API call summary
  lines.push(thin);
  lines.push("  API CALL SUMMARY");
  lines.push(thin);
  lines.push(`  Total calls:      ${report.api_call_summary.total_calls}`);
  lines.push(`  Successful:       ${report.api_call_summary.successful_calls}`);
  lines.push(`  Failed:           ${report.api_call_summary.failed_calls}`);
  lines.push(`  Avg latency:      ${report.api_call_summary.avg_latency_ms.toFixed(0)}ms`);
  for (const [method, stats] of Object.entries(report.api_call_summary.per_method)) {
    lines.push(`    ${method.padEnd(15)} ${stats.successes}/${stats.calls} ok, avg ${stats.avg_latency.toFixed(0)}ms`);
  }
  lines.push("");

  // Honest caveats
  lines.push(thin);
  lines.push("  HONEST CAVEATS");
  lines.push(thin);
  for (const c of report.honest_caveats) {
    lines.push(`  • ${c}`);
  }
  lines.push("");
  lines.push(divider);
  lines.push("");

  return lines.join("\n");
}

// ──────────────────────────────────────────────
// Build Report Object
// ──────────────────────────────────────────────

export function buildReport(
  results: EnsembleSampleResult[],
  analyses: {
    lengthAnalysis: { pangram: BucketMetrics[]; ensemble: BucketMetrics[] };
    platformProfiles: PlatformProfile[];
    modelDifficulty: ModelDifficulty[];
    ensembleValue: EnsembleValueResult;
    featureImportance: FeatureImportanceEntry[];
    claudeEvasion: ClaudeEvasionResult;
  },
  crossModelCount: number,
  curatedCount: number,
): EnsembleReport {
  // Compute comparison metrics
  const pangramMetrics = metricsFromCM(analyses.ensembleValue.pangram_cm);
  const ensembleMetrics = metricsFromCM(analyses.ensembleValue.ensemble_cm);

  // API call summary
  const allCalls = results.flatMap((r) => r.api_calls);
  const perMethod: Record<string, { calls: number; successes: number; totalLatency: number }> = {};
  for (const call of allCalls) {
    if (!perMethod[call.method]) perMethod[call.method] = { calls: 0, successes: 0, totalLatency: 0 };
    perMethod[call.method].calls++;
    if (call.success) perMethod[call.method].successes++;
    perMethod[call.method].totalLatency += call.latency_ms;
  }

  return {
    generated_at: new Date().toISOString(),
    pipeline_version: "ensemble-v1",
    total_samples: results.length,
    cross_model_samples: crossModelCount,
    curated_samples: curatedCount,
    comparison: {
      pangram_only: pangramMetrics,
      ensemble: ensembleMetrics,
      delta: deltaMetrics(pangramMetrics, ensembleMetrics),
    },
    length_analysis: analyses.lengthAnalysis,
    platform_profiles: analyses.platformProfiles,
    model_difficulty: analyses.modelDifficulty,
    ensemble_value: analyses.ensembleValue,
    feature_importance: analyses.featureImportance,
    claude_evasion: analyses.claudeEvasion,
    api_call_summary: {
      total_calls: allCalls.length,
      successful_calls: allCalls.filter((c) => c.success).length,
      failed_calls: allCalls.filter((c) => !c.success).length,
      avg_latency_ms: allCalls.length > 0 ? allCalls.reduce((s, c) => s + c.latency_ms, 0) / allCalls.length : 0,
      per_method: Object.fromEntries(
        Object.entries(perMethod).map(([method, stats]) => [
          method,
          {
            calls: stats.calls,
            successes: stats.successes,
            avg_latency: stats.calls > 0 ? stats.totalLatency / stats.calls : 0,
          },
        ]),
      ),
    },
    honest_caveats: HONEST_CAVEATS,
  };
}

// ──────────────────────────────────────────────
// JSON Output Writer
// ──────────────────────────────────────────────

export function writeOutputFiles(
  dataDir: string,
  results: EnsembleSampleResult[],
  report: EnsembleReport,
): void {
  const write = (name: string, data: unknown) => {
    const path = resolve(dataDir, name);
    writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`  ✓ ${name}`);
  };

  console.log("\nWriting output files...");
  write("ensemble-results.json", results);
  write("ensemble-comparison.json", report.comparison);
  write("ensemble-length-analysis.json", report.length_analysis);
  write("ensemble-platform-profiles.json", report.platform_profiles);
  write("ensemble-model-difficulty.json", report.model_difficulty);
  write("ensemble-feature-importance.json", report.feature_importance);
  write("ensemble-claude-evasion.json", report.claude_evasion);
  write("ensemble-report.json", report);
}
