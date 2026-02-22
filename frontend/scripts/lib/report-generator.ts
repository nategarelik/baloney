// ---------------------------------------------------------------------------
// Markdown report generator for the validation pipeline
// Outputs a well-organized, presentation-ready report
// Captures full Pangram v3 data: fraction_ai, fraction_ai_assisted,
// fraction_human, per-window ai_assistance_score, confidence levels
// ---------------------------------------------------------------------------

import type { ValidationReport } from "./results-formatter.ts";
import type { GeneratedSample } from "./generators.ts";

interface ReportOptions {
  samples: GeneratedSample[];
  report: ValidationReport;
  timestamp: string;
  isSynthetic?: boolean;
}

export function generateMarkdownReport(opts: ReportOptions): string {
  const { samples, report, timestamp, isSynthetic = false } = opts;

  const lines: string[] = [];

  const add = (text: string) => lines.push(text);
  const blank = () => lines.push("");
  const hr = () => lines.push("---");

  // ── Title & Overview ──────────────────────────────────────
  add("# Baloney: AI-Generated Text Validation Report");
  blank();
  add(`> Generated: ${timestamp}`);
  add("> Detector: Pangram API v3 (primary-only, no ensemble dilution)");
  add("> Methodology: Reverse-engineered short prompts, 400-800+ char targets");
  if (isSynthetic) {
    blank();
    add("> **[SYNTHETIC DATA] These results use randomly generated scores, NOT real Pangram API detection. All metrics below are MEANINGLESS and exist only to verify pipeline structure.**");
  }
  blank();
  hr();
  blank();

  // ── Executive Summary ─────────────────────────────────────
  add("## 1. Executive Summary");
  blank();
  add(
    "This report validates Baloney's AI text detection capability using **Pangram API v3 as the sole primary detector** " +
      "against freshly generated content from three SOTA LLMs " +
      "(Gemini 2.5 Flash, ChatGPT gpt-4o-mini, Claude 4.5 Haiku) across three " +
      "major social media platform styles (X/Twitter, LinkedIn, Facebook).",
  );
  blank();
  add(
    "**Why Pangram-only?** Secondary models (RoBERTa, statistical) exist solely as API fallbacks. " +
      "Blending their scores with Pangram's 99.85% accuracy introduces noise and false negatives. " +
      "This validation uses the primary detector in isolation to measure its true capability.",
  );
  blank();

  const cm = report.confusion_matrix;
  const total = cm.tp + cm.fp + cm.fn + cm.tn;
  const overallAcc =
    total > 0 ? (((cm.tp + cm.tn) / total) * 100).toFixed(1) : "N/A";
  const precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
  const recall = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;
  const fpr =
    cm.fp + cm.tn > 0 ? ((cm.fp / (cm.fp + cm.tn)) * 100).toFixed(1) : "0";

  add("### Key Results");
  blank();
  add("| Metric | Value |");
  add("|--------|-------|");
  add(`| Total Samples | ${report.total_samples} |`);
  add(`| AI Samples | ${report.ai_samples} |`);
  add(`| Human Control Samples | ${report.human_samples} |`);
  add(`| **Overall Accuracy** | **${overallAcc}%** |`);
  add(`| **AUC-ROC** | **${report.auc_roc.toFixed(4)}** |`);
  add(`| Precision | ${(precision * 100).toFixed(1)}% |`);
  add(`| Recall (Sensitivity) | ${(recall * 100).toFixed(1)}% |`);
  add(`| F1 Score | ${(f1 * 100).toFixed(1)}% |`);
  add(`| False Positive Rate | ${fpr}% |`);
  add(`| Optimal Threshold (Youden's J) | ${report.optimal_threshold.toFixed(2)} |`);
  blank();
  hr();
  blank();

  // ── Methodology ───────────────────────────────────────────
  add("## 2. Methodology");
  blank();

  add("### 2.1 Detection Architecture");
  blank();
  add("```");
  add("Primary Detector: Pangram API v3 ($0.05/scan, 99.85% accuracy)");
  add("  - fraction_ai:          Document-level AI score (0.0-1.0)");
  add("  - fraction_ai_assisted: AI-assisted content detection");
  add("  - fraction_human:       Human content score");
  add("  - Per-window analysis:  Segment-level ai_assistance_score + confidence");
  add("");
  add("Fallback (NOT used in validation):");
  add("  - RoBERTa GPT-2 detector");
  add("  - ChatGPT detector (HC3 dataset)");
  add("  - Sentence embeddings");
  add("  - Statistical (12 features)");
  add("```");
  blank();
  add(
    "The secondary ensemble exists for graceful degradation when Pangram is unavailable. " +
      "This validation tests the **primary detector in isolation** to avoid score dilution.",
  );
  blank();

  add("### 2.2 Models Tested");
  blank();
  add("| Model | Provider | Variant | Rationale |");
  add("|-------|----------|---------|-----------|");
  add(
    "| Gemini 2.5 Flash | Google | Fastest/cheapest | Representative of low-cost AI slop generation |",
  );
  add(
    "| gpt-4o-mini | OpenAI | Mini variant | Most popular API model for automation |",
  );
  add(
    "| Claude 4.5 Haiku | Anthropic | Fastest variant | Tests detection across all major providers |",
  );
  blank();

  add("### 2.3 Platforms Simulated");
  blank();
  add("| Platform | Style | Target Length |");
  add("|----------|-------|---------------|");
  add("| X/Twitter | Punchy hot takes, minimal emojis | 400-800 chars |");
  add("| LinkedIn | Corporate-inspirational, humble-brag | 500-1000 chars |");
  add("| Facebook | Personal anecdote, engagement bait | 400-800 chars |");
  blank();

  add("### 2.4 Prompt Design");
  blank();
  add(
    "**Reverse-engineered short prompts** (1-3 sentences). Short prompts produce " +
      '"default" AI behavior — representative of real-world AI slop. We test detection against ' +
      "the AI's natural style, not carefully coached output.",
  );
  blank();

  add("### 2.5 Pangram Budget");
  blank();
  add("| Item | Value |");
  add("|------|-------|");
  add("| Cost per scan | $0.05 (Developer pay-as-you-go) |");
  add("| Credits per scan | 1 (texts < 1000 words) |");
  add(`| Total scans | ${report.total_samples} |`);
  add(`| Total cost | $${(report.total_samples * 0.05).toFixed(2)} |`);
  add("| Minimum text length | 50 words (API enforced) |");
  blank();
  hr();
  blank();

  // ── Per-Model Results ─────────────────────────────────────
  add("## 3. Per-Model Detection Results");
  blank();

  if (report.per_model.length > 0) {
    add(
      "| Model | N | Detection Rate | Avg fraction_ai | Avg AI-Assisted | High-Conf Windows |",
    );
    add("|-------|---|---------------|-----------------|-----------------|-------------------|");
    for (const m of report.per_model) {
      add(
        `| ${m.model} | ${m.n} | **${m.detection_rate.toFixed(1)}%** | ${m.avg_confidence.toFixed(3)} | ${m.avg_ai_assisted.toFixed(3)} | ${m.avg_window_high_conf.toFixed(1)}% |`,
      );
    }
    blank();

    add("### Detection Rate by Model");
    blank();
    add("```");
    for (const m of report.per_model) {
      const barLen = Math.round((m.detection_rate / 100) * 40);
      const bar = "\u2588".repeat(barLen) + "\u2591".repeat(40 - barLen);
      add(`  ${m.model.padEnd(12)} ${bar} ${m.detection_rate.toFixed(1)}%`);
    }
    add("```");
    blank();
  } else {
    add("*No per-model data available.*");
    blank();
  }

  hr();
  blank();

  // ── Per-Platform Results ──────────────────────────────────
  add("## 4. Per-Platform Detection Results");
  blank();

  if (report.per_platform.length > 0) {
    add(
      "| Platform | N | Detection Rate | Avg fraction_ai | Avg AI-Assisted | High-Conf Windows |",
    );
    add("|----------|---|---------------|-----------------|-----------------|-------------------|");
    for (const p of report.per_platform) {
      add(
        `| ${p.platform} | ${p.n} | **${p.detection_rate.toFixed(1)}%** | ${p.avg_confidence.toFixed(3)} | ${p.avg_ai_assisted.toFixed(3)} | ${p.avg_window_high_conf.toFixed(1)}% |`,
      );
    }
    blank();

    add("### Detection Rate by Platform");
    blank();
    add("```");
    for (const p of report.per_platform) {
      const barLen = Math.round((p.detection_rate / 100) * 40);
      const bar = "\u2588".repeat(barLen) + "\u2591".repeat(40 - barLen);
      add(`  ${p.platform.padEnd(12)} ${bar} ${p.detection_rate.toFixed(1)}%`);
    }
    add("```");
    blank();
  } else {
    add("*No per-platform data available.*");
    blank();
  }

  hr();
  blank();

  // ── Confusion Matrix ──────────────────────────────────────
  add("## 5. Confusion Matrix");
  blank();
  add(
    `At optimal threshold = **${report.optimal_threshold.toFixed(2)}** (Youden's J statistic):`,
  );
  blank();

  add("```");
  add("                    Predicted");
  add("                AI          Human");
  add(
    `  Actual AI    ${String(cm.tp).padStart(5)} (TP)    ${String(cm.fn).padStart(5)} (FN)`,
  );
  add(
    `  Actual Hu    ${String(cm.fp).padStart(5)} (FP)    ${String(cm.tn).padStart(5)} (TN)`,
  );
  add("```");
  blank();
  hr();
  blank();

  // ── Confidence Distribution ───────────────────────────────
  add("## 6. Confidence Distribution");
  blank();
  add("Distribution of `fraction_ai` scores by ground truth label:");
  blank();

  if (report.confidence_distribution) {
    add("```");
    add("  Bucket      AI samples    Human samples");
    add("  " + "\u2500".repeat(46));
    for (const bucket of report.confidence_distribution) {
      const aiBar = "\u2588".repeat(Math.min(bucket.ai_count, 30));
      const humanBar = "\u2593".repeat(Math.min(bucket.human_count, 30));
      add(
        `  ${bucket.bucket}   ${String(bucket.ai_count).padStart(3)} ${aiBar}`,
      );
      add(
        `           ${String(bucket.human_count).padStart(3)} ${humanBar}`,
      );
    }
    add("```");
    blank();
    add(
      "*Ideal separation: AI samples cluster near 1.0, human samples cluster near 0.0. " +
        "Clear separation = low false positive/negative rates.*",
    );
    blank();
  }

  hr();
  blank();

  // ── Precision-Recall Curve ────────────────────────────────
  add("## 7. Precision-Recall Curve");
  blank();
  add(
    "The PR curve is especially informative for imbalanced datasets. Unlike ROC which can be " +
      "optimistic when negatives dominate, PR focuses on the positive class (AI-generated text).",
  );
  blank();

  if (report.pr_data && report.pr_data.length > 0) {
    add(`**PR-AUC: ${report.pr_auc.toFixed(4)}**`);
    blank();

    // ASCII PR curve
    const prGridSize = 20;
    const prGrid: string[][] = [];
    for (let r = 0; r <= prGridSize; r++) {
      prGrid.push(new Array(prGridSize + 1).fill(" "));
    }
    for (const pt of report.pr_data) {
      const x = Math.round(pt.recall * prGridSize);
      const y = Math.round(pt.precision * prGridSize);
      if (x >= 0 && x <= prGridSize && y >= 0 && y <= prGridSize) {
        prGrid[prGridSize - y][x] = "*";
      }
    }

    add("```");
    add("  Precision");
    add(" 1.0 |" + prGrid[0].join(""));
    for (let r = 1; r < prGridSize; r++) {
      const label =
        r % 5 === 0 ? ` ${(1 - r / prGridSize).toFixed(1)} |` : "     |";
      add(label + prGrid[r].join(""));
    }
    add(" 0.0 |" + prGrid[prGridSize].join(""));
    add("     +" + "-".repeat(prGridSize + 1) + " Recall");
    add("      0.0" + " ".repeat(prGridSize - 7) + "1.0");
    add("```");
    blank();
    add(
      "*A perfect PR curve hugs the top-right corner (PR-AUC = 1.0). " +
        "High PR-AUC indicates the detector maintains high precision even at high recall.*",
    );
    blank();
  }

  hr();
  blank();

  // ── Threshold Sensitivity Analysis ──────────────────────
  add("## 8. Threshold Sensitivity Analysis");
  blank();
  add(
    "Performance metrics across different classification thresholds. " +
      "This helps operators choose the right threshold for their use case " +
      "(e.g., high precision for content moderation vs. high recall for screening).",
  );
  blank();

  if (report.threshold_sensitivity && report.threshold_sensitivity.length > 0) {
    add("| Threshold | Accuracy | Precision | Recall | F1 | FPR | Specificity |");
    add("|-----------|----------|-----------|--------|-----|-----|-------------|");
    for (const t of report.threshold_sensitivity) {
      const isOptimal = Math.abs(t.threshold - report.optimal_threshold) < 0.05;
      const marker = isOptimal ? " **" : "";
      const endMarker = isOptimal ? "**" : "";
      add(
        `| ${marker}${t.threshold.toFixed(2)}${endMarker} | ${t.accuracy.toFixed(1)}% | ${t.precision.toFixed(1)}% | ${t.recall.toFixed(1)}% | ${t.f1.toFixed(1)}% | ${t.fpr.toFixed(1)}% | ${t.specificity.toFixed(1)}% |`,
      );
    }
    blank();
    add(`*Bold row indicates nearest to optimal threshold (${report.optimal_threshold.toFixed(2)}).*`);
    blank();
  }

  hr();
  blank();

  // ── Calibration Analysis ────────────────────────────────
  add("## 9. Calibration Analysis");
  blank();
  add(
    "Calibration measures whether predicted probabilities match observed frequencies. " +
      "A well-calibrated detector with P(AI)=0.8 should see ~80% of those texts actually be AI.",
  );
  blank();

  if (report.calibration && report.calibration.length > 0) {
    add("| Bin Midpoint | Avg Predicted | Actual Positive Rate | Count |");
    add("|-------------|---------------|---------------------|-------|");
    for (const b of report.calibration) {
      if (b.count === 0) continue;
      add(
        `| ${b.bin_midpoint.toFixed(2)} | ${b.avg_predicted.toFixed(3)} | ${b.actual_positive_rate.toFixed(3)} | ${b.count} |`,
      );
    }
    blank();

    // Compute calibration error
    let totalCalibError = 0;
    let totalCalibWeight = 0;
    for (const b of report.calibration) {
      if (b.count === 0) continue;
      totalCalibError += Math.abs(b.avg_predicted - b.actual_positive_rate) * b.count;
      totalCalibWeight += b.count;
    }
    const ece = totalCalibWeight > 0 ? totalCalibError / totalCalibWeight : 0;
    add(`**Expected Calibration Error (ECE): ${ece.toFixed(4)}**`);
    blank();
    add(
      "*ECE < 0.05 indicates excellent calibration. Perfect calibration means predicted " +
        "probability exactly matches observed frequency at every bin.*",
    );
    blank();
  }

  hr();
  blank();

  // ── Bootstrap AUC-ROC Confidence Interval ───────────────
  add("## 10. Statistical Confidence");
  blank();

  if (report.auc_ci) {
    add("### AUC-ROC Confidence Interval (Bootstrap, 95%)");
    blank();
    add("| Metric | Value |");
    add("|--------|-------|");
    add(`| AUC-ROC (point estimate) | ${report.auc_roc.toFixed(4)} |`);
    add(`| Bootstrap mean | ${report.auc_ci.mean.toFixed(4)} |`);
    add(`| 95% CI lower | ${report.auc_ci.lower.toFixed(4)} |`);
    add(`| 95% CI upper | ${report.auc_ci.upper.toFixed(4)} |`);
    add(`| CI width | ${(report.auc_ci.upper - report.auc_ci.lower).toFixed(4)} |`);
    blank();
    add(
      "*Narrow CI indicates stable AUC estimate. Bootstrap resampling (n=1000) " +
        "provides non-parametric confidence bounds without distributional assumptions.*",
    );
    blank();
  }

  // Detection rate CIs
  if (report.per_model.length > 0 && report.per_model[0].detection_rate_ci) {
    add("### Per-Model Detection Rate Confidence Intervals (Wilson Score, 95%)");
    blank();
    add("| Model | Detection Rate | 95% CI | N |");
    add("|-------|---------------|--------|---|");
    for (const m of report.per_model) {
      add(
        `| ${m.model} | ${m.detection_rate.toFixed(1)}% | [${m.detection_rate_ci.lower.toFixed(1)}%, ${m.detection_rate_ci.upper.toFixed(1)}%] | ${m.n} |`,
      );
    }
    blank();
  }

  if (report.per_platform.length > 0 && report.per_platform[0].detection_rate_ci) {
    add("### Per-Platform Detection Rate Confidence Intervals (Wilson Score, 95%)");
    blank();
    add("| Platform | Detection Rate | 95% CI | N |");
    add("|----------|---------------|--------|---|");
    for (const p of report.per_platform) {
      add(
        `| ${p.platform} | ${p.detection_rate.toFixed(1)}% | [${p.detection_rate_ci.lower.toFixed(1)}%, ${p.detection_rate_ci.upper.toFixed(1)}%] | ${p.n} |`,
      );
    }
    blank();
    add(
      "*Wilson score intervals are preferred over Wald intervals for proportions " +
        "because they perform better near 0% and 100%.*",
    );
    blank();
  }

  hr();
  blank();

  // ── Pangram v3 Three-Class Analysis ───────────────────────
  add("## 11. Pangram v3 Three-Class Analysis");
  blank();
  add(
    "Pangram v3 classifies text into three categories: **AI-Generated**, **AI-Assisted**, and **Human**. " +
      "The three fractions (`fraction_ai + fraction_ai_assisted + fraction_human`) sum to 1.0.",
  );
  blank();

  if (report.ai_assisted_analysis) {
    add("| Metric | Value |");
    add("|--------|-------|");
    add(
      `| Avg fraction_ai_assisted on AI text | ${report.ai_assisted_analysis.avg_fraction_ai_assisted_on_ai.toFixed(4)} |`,
    );
    add(
      `| Avg fraction_ai_assisted on human text | ${report.ai_assisted_analysis.avg_fraction_ai_assisted_on_human.toFixed(4)} |`,
    );
    add(
      `| Texts classified as "Mixed" | ${report.ai_assisted_analysis.texts_with_mixed_classification} |`,
    );
    blank();
    add(
      "*Low AI-assisted fraction on fully AI-generated text suggests Pangram correctly identifies " +
        "the content as fully AI rather than merely AI-assisted. This is expected since our generated " +
        "texts are 100% LLM output with no human editing.*",
    );
    blank();
  }

  hr();
  blank();

  // ── Window-Level Analysis ─────────────────────────────────
  add("## 12. Window-Level Analysis");
  blank();
  add(
    "Pangram v3 segments text into non-overlapping windows, each with an " +
      "`ai_assistance_score` (0.0-1.0) and `confidence` level (High/Medium/Low).",
  );
  blank();

  if (report.window_analysis) {
    add("| Metric | Value |");
    add("|--------|-------|");
    add(`| Avg windows per text | ${report.window_analysis.avg_windows_per_text} |`);
    add(
      `| Avg % windows with "High" confidence | ${report.window_analysis.avg_high_confidence_pct}% |`,
    );
    add(
      `| Avg ai_assistance_score on AI windows | ${report.window_analysis.avg_ai_score_on_ai_windows.toFixed(4)} |`,
    );
    blank();
    add(
      "*Higher confidence percentages and AI scores indicate more reliable segment-level detection. " +
        "Window analysis enables pinpointing exactly which parts of a document are AI-generated.*",
    );
    blank();
  }

  hr();
  blank();

  // ── Limitations ────────────────────────────────────────────
  add("## 13. Limitations & Threats to Validity");
  blank();
  add(
    "Transparent reporting of limitations is essential for scientific credibility. " +
      "The following caveats should be considered when interpreting these results.",
  );
  blank();

  add("### 13.1 Within-Sample Threshold Optimization");
  blank();
  add(
    "The optimal threshold (Youden's J) is selected on the same data used for evaluation. " +
      "Metrics at the optimal threshold represent **apparent performance**, not held-out estimates. " +
      "The threshold sensitivity table (Section 8) shows metrics at the pre-specified 0.50 threshold " +
      "for comparison. AUC-ROC and PR-AUC are threshold-independent and unaffected.",
  );
  blank();

  add("### 13.2 Human Control Sample Composition");
  blank();
  add(
    "The 50 human control samples are predominantly casual American English (Reddit-style anecdotes). " +
      "The false positive rate may not generalize to formal writing, ESL authors, technical documentation, " +
      "or non-American English. Broader human control samples would strengthen external validity.",
  );
  blank();

  add("### 13.3 Prompt-Induced Style Bias");
  blank();
  add(
    "All AI samples use short reverse-engineered prompts (1-3 sentences) with temperature 0.9. " +
      "This produces 'default' AI style — representative of casual AI slop but not of carefully " +
      "coached or post-edited AI text. Detection rates on adversarial AI text may be lower.",
  );
  blank();

  add("### 13.4 Single-Detector Dependency");
  blank();
  add(
    "This validation tests Pangram in isolation. Cross-detector validation (e.g., comparing " +
      "Pangram with GPTZero, Originality.ai) would provide stronger evidence. The secondary " +
      "ensemble models are not evaluated here.",
  );
  blank();

  add("### 13.5 Sample Size");
  blank();
  add(
    "With ~185 total samples (135 AI + 50 human), confidence intervals are provided throughout. " +
      "A larger sample size would narrow these intervals and increase statistical power for " +
      "per-model and per-platform comparisons.",
  );
  blank();
  hr();
  blank();

  // ── ROC Curve (ASCII) ─────────────────────────────────────
  add("## 14. ROC Curve");
  blank();
  add(`**AUC-ROC: ${report.auc_roc.toFixed(4)}**`);
  blank();

  if (report.roc_data.length > 0) {
    const gridSize = 20;
    const grid: string[][] = [];
    for (let r = 0; r <= gridSize; r++) {
      grid.push(new Array(gridSize + 1).fill(" "));
    }

    for (const pt of report.roc_data) {
      const x = Math.round(pt.fpr * gridSize);
      const y = Math.round(pt.tpr * gridSize);
      if (x >= 0 && x <= gridSize && y >= 0 && y <= gridSize) {
        grid[gridSize - y][x] = "*";
      }
    }

    for (let i = 0; i <= gridSize; i++) {
      if (grid[gridSize - i][i] === " ") {
        grid[gridSize - i][i] = ".";
      }
    }

    add("```");
    add("  TPR");
    add(" 1.0 |" + grid[0].join(""));
    for (let r = 1; r < gridSize; r++) {
      const label =
        r % 5 === 0 ? ` ${(1 - r / gridSize).toFixed(1)} |` : "     |";
      add(label + grid[r].join(""));
    }
    add(" 0.0 |" + grid[gridSize].join(""));
    add("     +" + "-".repeat(gridSize + 1) + " FPR");
    add("      0.0" + " ".repeat(gridSize - 7) + "1.0");
    add("```");
    blank();
  }

  add(
    "*A perfect classifier hugs the top-left corner (AUC = 1.0). " +
      "The diagonal represents random guessing (AUC = 0.5).*",
  );
  blank();
  hr();
  blank();

  // ── Sample Distribution ───────────────────────────────────
  add("## 15. Sample Distribution");
  blank();

  const byModel = new Map<string, number>();
  for (const s of samples) {
    byModel.set(s.model, (byModel.get(s.model) ?? 0) + 1);
  }
  add("### By Model");
  blank();
  add("| Model | Generated Samples |");
  add("|-------|-------------------|");
  for (const [model, count] of byModel) {
    add(`| ${model} | ${count} |`);
  }
  blank();

  const byPlatform = new Map<string, number>();
  for (const s of samples) {
    byPlatform.set(s.platform, (byPlatform.get(s.platform) ?? 0) + 1);
  }
  add("### By Platform");
  blank();
  add("| Platform | Generated Samples |");
  add("|----------|-------------------|");
  for (const [platform, count] of byPlatform) {
    add(`| ${platform} | ${count} |`);
  }
  blank();

  if (samples.length > 0) {
    const lengths = samples.map((s) => s.charCount);
    lengths.sort((a, b) => a - b);
    const avgLen = Math.round(
      lengths.reduce((a, b) => a + b, 0) / lengths.length,
    );
    const medianLen = lengths[Math.floor(lengths.length / 2)];
    const minLen = lengths[0];
    const maxLen = lengths[lengths.length - 1];

    add("### Text Length Statistics");
    blank();
    add("| Metric | Characters |");
    add("|--------|------------|");
    add(`| Mean | ${avgLen} |`);
    add(`| Median | ${medianLen} |`);
    add(`| Min | ${minLen} |`);
    add(`| Max | ${maxLen} |`);
    blank();
  }

  hr();
  blank();

  // ── Prompts Used (Sample) ─────────────────────────────────
  add("## 16. Prompts Used (Sample)");
  blank();
  add("First 5 prompts per model:");
  blank();

  const modelGroups = new Map<string, GeneratedSample[]>();
  for (const s of samples) {
    if (!modelGroups.has(s.model)) modelGroups.set(s.model, []);
    modelGroups.get(s.model)!.push(s);
  }

  for (const [model, modelSamples] of modelGroups) {
    add(`### ${model}`);
    blank();
    add("| # | Platform | Topic | Prompt | Text Preview |");
    add("|---|----------|-------|--------|-------------|");
    const shown = modelSamples.slice(0, 5);
    for (let i = 0; i < shown.length; i++) {
      const s = shown[i];
      const preview =
        s.text
          .slice(0, 80)
          .replace(/\|/g, "\\|")
          .replace(/\n/g, " ") + "...";
      const prompt = s.prompt.replace(/\|/g, "\\|");
      add(
        `| ${i + 1} | ${s.platform} | ${s.topic} | ${prompt} | ${preview} |`,
      );
    }
    blank();
  }

  hr();
  blank();

  // ── Conclusion ────────────────────────────────────────────
  add("## 17. Conclusion");
  blank();

  const avgDetRate =
    report.per_model.length > 0
      ? report.per_model.reduce((a, m) => a + m.detection_rate, 0) /
        report.per_model.length
      : 0;

  const aucCiStr = report.auc_ci
    ? ` (95% CI: [${report.auc_ci.lower.toFixed(4)}, ${report.auc_ci.upper.toFixed(4)}])`
    : "";
  const prAucStr = report.pr_auc ? `, **PR-AUC of ${report.pr_auc.toFixed(4)}**` : "";

  add(
    `Pangram v3 achieves an **AUC-ROC of ${report.auc_roc.toFixed(4)}**${aucCiStr}${prAucStr} ` +
      `across ${report.total_samples} samples, with an average detection rate of ` +
      `**${avgDetRate.toFixed(1)}%** on AI-generated social media content.`,
  );
  blank();
  add("### Key findings:");
  blank();

  if (report.per_model.length > 0) {
    const best = report.per_model.reduce((a, b) =>
      a.detection_rate > b.detection_rate ? a : b,
    );
    const worst = report.per_model.reduce((a, b) =>
      a.detection_rate < b.detection_rate ? a : b,
    );
    add(
      `- **Cross-model generalizability**: Detection rates range from ${worst.detection_rate.toFixed(1)}% (${worst.model}) to ${best.detection_rate.toFixed(1)}% (${best.model})`,
    );
  }

  if (report.per_platform.length > 0) {
    const best = report.per_platform.reduce((a, b) =>
      a.detection_rate > b.detection_rate ? a : b,
    );
    const worst = report.per_platform.reduce((a, b) =>
      a.detection_rate < b.detection_rate ? a : b,
    );
    add(
      `- **Cross-platform consistency**: Detection rates range from ${worst.detection_rate.toFixed(1)}% (${worst.platform}) to ${best.detection_rate.toFixed(1)}% (${best.platform})`,
    );
  }

  add(`- **False positive rate**: ${fpr}% (human text incorrectly flagged as AI)`);
  add(
    `- **Precision**: ${(precision * 100).toFixed(1)}% — when Pangram says "AI", it's right this often`,
  );

  if (report.ai_assisted_analysis) {
    add(
      `- **Three-class clarity**: ${report.ai_assisted_analysis.texts_with_mixed_classification} texts classified as "Mixed" (expected: near zero for pure LLM output)`,
    );
  }

  blank();
  add(
    "### Implication for Baloney:");
  blank();
  add(
    "Using Pangram as the **sole primary detector** (not diluted by secondary models) provides " +
      "the most accurate detection. Secondary models should only activate when Pangram is unavailable. " +
      "The trust_score should directly reflect Pangram's classification when available, not a " +
      "weighted blend of less accurate signals.",
  );
  blank();
  hr();
  blank();
  add(
    "*Report generated by the Baloney Validation Pipeline. " +
      "Pangram API v3 ($0.05/scan). Primary-only detection — no ensemble dilution. " +
      "Full response capture: fraction_ai, fraction_ai_assisted, fraction_human, " +
      "per-window ai_assistance_score + confidence levels.*",
  );

  return lines.join("\n");
}
