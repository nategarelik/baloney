// ---------------------------------------------------------------------------
// Pangram batch detection logic (v3 API — full response capture)
// Based on Pangram API docs: $0.05/scan, 1 credit per 1000 words,
// 50-word minimum, no batch endpoint.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync } from "fs";

// ---------------------------------------------------------------------------
// Types — captures ALL v3 response fields per Pangram docs
// ---------------------------------------------------------------------------

export interface PangramWindow {
  text: string;
  label: string; // "Human" | "Moderately AI-Assisted" | "AI-Generated"
  ai_assistance_score: number; // 0.0-1.0 continuous scale
  confidence: string; // "High" | "Medium" | "Low"
  start_index: number;
  end_index: number;
  word_count: number;
  token_length: number;
}

export interface PangramResult {
  // Document-level scores (sum to 1.0)
  fraction_ai: number;
  fraction_ai_assisted: number;
  fraction_human: number;
  // Classification labels
  headline: string; // "Fully Human Written" | "AI Assisted" | "AI Detected"
  prediction: string; // Detailed reasoning text
  prediction_short: string; // "Human" | "Mixed" | "AI"
  // Segment counts
  num_ai_segments: number;
  num_ai_assisted_segments: number;
  num_human_segments: number;
  // Per-segment analysis
  windows: PangramWindow[];
  // API metadata
  version: string;
}

export interface DetectionResult {
  id: string;
  text_preview: string; // first 100 chars
  label: "ai" | "human"; // ground truth
  model?: string; // which LLM generated it (for AI samples)
  platform?: string; // which platform style
  // Pangram v3 scores
  pangram_score: number; // fraction_ai (0-1)
  pangram_fraction_ai_assisted: number; // fraction_ai_assisted (0-1)
  pangram_fraction_human: number; // fraction_human (0-1)
  pangram_classification: string; // prediction_short: "Human" | "Mixed" | "AI"
  pangram_headline: string; // detailed headline
  pangram_prediction: string; // reasoning text
  pangram_num_ai_segments: number;
  pangram_num_ai_assisted_segments: number;
  pangram_num_human_segments: number;
  pangram_windows: PangramWindow[];
  // Derived metrics
  pangram_avg_window_confidence: number; // % of windows with "High" confidence
  pangram_max_window_ai_score: number; // highest ai_assistance_score across windows
  detected_at: string; // ISO timestamp
}

// ---------------------------------------------------------------------------
// Single-text detection (v3 endpoint — full response capture)
// ---------------------------------------------------------------------------

export async function detectWithPangram(
  text: string,
): Promise<PangramResult | null> {
  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://text.api.pangram.com/v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ text: text.slice(0, 5000) }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("[Pangram] Rate limit reached");
        return null;
      }
      if (response.status === 401) {
        console.error("[Pangram] Authentication failed or insufficient credits");
        return null;
      }
      throw new Error(`Pangram API ${response.status}`);
    }

    const data = await response.json();

    // Map v3 window fields to our interface
    const windows: PangramWindow[] = (data.windows ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (w: any) => ({
        text: w.text ?? "",
        label: w.label ?? "Unknown",
        ai_assistance_score: w.ai_assistance_score ?? 0,
        confidence: w.confidence ?? "Low",
        start_index: w.start_index ?? 0,
        end_index: w.end_index ?? 0,
        word_count: w.word_count ?? 0,
        token_length: w.token_length ?? 0,
      }),
    );

    return {
      fraction_ai: data.fraction_ai ?? 0,
      fraction_ai_assisted: data.fraction_ai_assisted ?? 0,
      fraction_human: data.fraction_human ?? 0,
      headline: data.headline ?? "",
      prediction: data.prediction ?? "",
      prediction_short: data.prediction_short ?? "",
      num_ai_segments: data.num_ai_segments ?? 0,
      num_ai_assisted_segments: data.num_ai_assisted_segments ?? 0,
      num_human_segments: data.num_human_segments ?? 0,
      windows,
      version: data.version ?? "3.0",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Batch detection with checkpointing, rate-limit handling & backoff
// No batch endpoint available — sequential processing per Pangram docs.
// Recommended delay: 200-500ms between requests.
// ---------------------------------------------------------------------------

const CHECKPOINT_INTERVAL = 25;
const RATE_LIMIT_WAIT_MS = 30_000;
const MAX_BACKOFF_RETRIES = 4; // 1s, 2s, 4s, 8s then skip

export async function batchDetect(
  samples: Array<{
    id: string;
    text: string;
    label: "ai" | "human";
    model?: string;
    platform?: string;
  }>,
  checkpointPath: string,
  delayMs: number = 300,
): Promise<DetectionResult[]> {
  // ---- Resume from checkpoint if it exists ----
  let results: DetectionResult[] = [];
  const completedIds = new Set<string>();

  if (existsSync(checkpointPath)) {
    try {
      const raw = readFileSync(checkpointPath, "utf-8");
      results = JSON.parse(raw) as DetectionResult[];
      for (const r of results) {
        completedIds.add(r.id);
      }
      console.log(
        `[Pangram] Resumed from checkpoint — ${results.length} already done`,
      );
    } catch {
      console.warn("[Pangram] Corrupt checkpoint, starting fresh");
      results = [];
    }
  }

  const total = samples.length;

  for (let i = 0; i < total; i++) {
    const sample = samples[i];

    // Skip already-completed samples
    if (completedIds.has(sample.id)) continue;

    // ---- Attempt detection with backoff ----
    let pangramResult: PangramResult | null = null;
    let succeeded = false;

    for (let attempt = 0; attempt <= MAX_BACKOFF_RETRIES; attempt++) {
      pangramResult = await detectWithPangramRaw(sample.text);

      if (pangramResult !== null) {
        succeeded = true;
        break;
      }

      if (attempt < MAX_BACKOFF_RETRIES) {
        const backoffMs = 1000 * Math.pow(2, attempt);
        console.warn(
          `[Pangram] Error on "${sample.id}", retry ${attempt + 1}/${MAX_BACKOFF_RETRIES} in ${backoffMs}ms`,
        );
        await sleep(backoffMs);
      }
    }

    if (!succeeded) {
      console.warn(`[Pangram] Skipping "${sample.id}" after all retries`);
      results.push({
        id: sample.id,
        text_preview: sample.text.slice(0, 100),
        label: sample.label,
        model: sample.model,
        platform: sample.platform,
        pangram_score: -1,
        pangram_fraction_ai_assisted: 0,
        pangram_fraction_human: 0,
        pangram_classification: "error",
        pangram_headline: "",
        pangram_prediction: "",
        pangram_num_ai_segments: 0,
        pangram_num_ai_assisted_segments: 0,
        pangram_num_human_segments: 0,
        pangram_windows: [],
        pangram_avg_window_confidence: 0,
        pangram_max_window_ai_score: 0,
        detected_at: new Date().toISOString(),
      });
    } else {
      const pr = pangramResult!;

      // Derive window-level metrics
      const highConfCount = pr.windows.filter(
        (w) => w.confidence === "High",
      ).length;
      const avgWindowConfidence =
        pr.windows.length > 0 ? highConfCount / pr.windows.length : 0;
      const maxWindowAiScore =
        pr.windows.length > 0
          ? Math.max(...pr.windows.map((w) => w.ai_assistance_score))
          : 0;

      const result: DetectionResult = {
        id: sample.id,
        text_preview: sample.text.slice(0, 100),
        label: sample.label,
        model: sample.model,
        platform: sample.platform,
        pangram_score: pr.fraction_ai,
        pangram_fraction_ai_assisted: pr.fraction_ai_assisted,
        pangram_fraction_human: pr.fraction_human,
        pangram_classification: pr.prediction_short,
        pangram_headline: pr.headline,
        pangram_prediction: pr.prediction,
        pangram_num_ai_segments: pr.num_ai_segments,
        pangram_num_ai_assisted_segments: pr.num_ai_assisted_segments,
        pangram_num_human_segments: pr.num_human_segments,
        pangram_windows: pr.windows,
        pangram_avg_window_confidence: avgWindowConfidence,
        pangram_max_window_ai_score: maxWindowAiScore,
        detected_at: new Date().toISOString(),
      };
      results.push(result);

      console.log(
        `[Pangram] ${results.length}/${total} — ` +
          `score: ${pr.fraction_ai.toFixed(3)} ` +
          `(${pr.prediction_short}) ` +
          `ai_assisted: ${pr.fraction_ai_assisted.toFixed(3)} ` +
          `segments: ${pr.num_ai_segments}ai/${pr.num_ai_assisted_segments}mixed/${pr.num_human_segments}human`,
      );
    }

    // ---- Checkpoint every N results ----
    if (results.length % CHECKPOINT_INTERVAL === 0) {
      writeFileSync(checkpointPath, JSON.stringify(results, null, 2));
      console.log(`[Pangram] Checkpoint saved (${results.length} results)`);
    }

    // ---- Delay between requests ----
    if (i < total - 1) {
      await sleep(delayMs);
    }
  }

  // Final save
  writeFileSync(checkpointPath, JSON.stringify(results, null, 2));
  console.log(`[Pangram] Done — ${results.length} total results saved`);

  return results;
}

// ---------------------------------------------------------------------------
// Internal: raw Pangram v3 call with 429 handling
// ---------------------------------------------------------------------------

async function detectWithPangramRaw(
  text: string,
): Promise<PangramResult | null> {
  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://text.api.pangram.com/v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ text: text.slice(0, 5000) }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(
          `[Pangram] Rate limit hit — waiting ${RATE_LIMIT_WAIT_MS / 1000}s`,
        );
        await sleep(RATE_LIMIT_WAIT_MS);
        return null;
      }
      if (response.status === 401) {
        console.error(
          "[Pangram] Auth failed / insufficient credits — stopping",
        );
        return null;
      }
      throw new Error(`Pangram API ${response.status}`);
    }

    const data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windows: PangramWindow[] = (data.windows ?? []).map((w: any) => ({
      text: w.text ?? "",
      label: w.label ?? "Unknown",
      ai_assistance_score: w.ai_assistance_score ?? 0,
      confidence: w.confidence ?? "Low",
      start_index: w.start_index ?? 0,
      end_index: w.end_index ?? 0,
      word_count: w.word_count ?? 0,
      token_length: w.token_length ?? 0,
    }));

    return {
      fraction_ai: data.fraction_ai ?? 0,
      fraction_ai_assisted: data.fraction_ai_assisted ?? 0,
      fraction_human: data.fraction_human ?? 0,
      headline: data.headline ?? "",
      prediction: data.prediction ?? "",
      prediction_short: data.prediction_short ?? "",
      num_ai_segments: data.num_ai_segments ?? 0,
      num_ai_assisted_segments: data.num_ai_assisted_segments ?? 0,
      num_human_segments: data.num_human_segments ?? 0,
      windows,
      version: data.version ?? "3.0",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Budget estimator — confirmed $0.05/scan (Developer pay-as-you-go)
// 1 credit per scan up to 1000 words
// ---------------------------------------------------------------------------

export function estimateBudget(sampleCount: number): {
  credits: number;
  estimatedCost: string;
  costPerScan: string;
} {
  const credits = sampleCount;
  const cost = credits * 0.05;
  return {
    credits,
    estimatedCost: `$${cost.toFixed(2)}`,
    costPerScan: "$0.05",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
