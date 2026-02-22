// hf-methods.ts — HuggingFace detection methods extracted from real-detectors.ts
// Methods A, B, C for the ensemble test harness (not production code)

import { InferenceClient } from "@huggingface/inference";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface MethodResult {
  method: string;
  score: number | null;
  latencyMs: number;
  error?: string;
  rawResponse?: unknown;
}

// ──────────────────────────────────────────────
// Helpers (from real-detectors.ts lines 24-70)
// ──────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function precise(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([!?])/g, "$1|")
    .split(/[.|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ──────────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────────

let lastCallTime = 0;
const MIN_DELAY_MS = 500;

export async function withRateLimit<T>(
  fn: () => Promise<T>,
  label: string,
  retries = 3,
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Enforce minimum delay between calls
    const now = Date.now();
    const elapsed = now - lastCallTime;
    if (elapsed < MIN_DELAY_MS) {
      await new Promise((r) => setTimeout(r, MIN_DELAY_MS - elapsed));
    }
    lastCallTime = Date.now();

    try {
      return await fn();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const is429 = errMsg.includes("429") || errMsg.includes("rate");

      if (is429 && attempt < retries) {
        const backoff = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`  [${label}] Rate limited (attempt ${attempt + 1}/${retries}), waiting ${backoff}ms...`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      if (attempt === retries) {
        console.error(`  [${label}] Failed after ${retries + 1} attempts: ${errMsg}`);
        return null;
      }

      // Non-429 error, retry with shorter backoff
      const backoff = 1000 * (attempt + 1);
      console.warn(`  [${label}] Error (attempt ${attempt + 1}): ${errMsg}, retrying in ${backoff}ms...`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  return null;
}

// ──────────────────────────────────────────────
// METHOD A: RoBERTa (openai-community/roberta-base-openai-detector)
// From real-detectors.ts lines 146-166
// ──────────────────────────────────────────────

export async function methodA_roberta(
  client: InferenceClient,
  text: string,
): Promise<MethodResult> {
  const start = Date.now();
  try {
    const result = await client.textClassification({
      model: "openai-community/roberta-base-openai-detector",
      inputs: text.slice(0, 2000),
      provider: "hf-inference",
    });
    const classifications = Array.isArray(result) ? result : [result];
    const aiLabel = classifications.find(
      (c) => c.label === "Fake" || c.label === "LABEL_1",
    );
    if (!aiLabel) {
      return {
        method: "roberta",
        score: null,
        latencyMs: Date.now() - start,
        error: "AI label not found: " + JSON.stringify(classifications),
        rawResponse: classifications,
      };
    }
    return {
      method: "roberta",
      score: aiLabel.score,
      latencyMs: Date.now() - start,
      rawResponse: classifications,
    };
  } catch (err) {
    return {
      method: "roberta",
      score: null,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ──────────────────────────────────────────────
// METHOD C: ChatGPT Detector (Hello-SimpleAI/chatgpt-detector-roberta)
// From real-detectors.ts lines 172-196
// ──────────────────────────────────────────────

export async function methodC_chatgptDetector(
  client: InferenceClient,
  text: string,
): Promise<MethodResult> {
  const start = Date.now();
  try {
    const result = await client.textClassification({
      model: "Hello-SimpleAI/chatgpt-detector-roberta",
      inputs: text.slice(0, 2000),
      provider: "hf-inference",
    });
    const classifications = Array.isArray(result) ? result : [result];
    const aiLabel = classifications.find(
      (c) => c.label === "ChatGPT" || c.label === "LABEL_1" || c.label === "Fake",
    );
    if (!aiLabel) {
      const humanLabel = classifications.find(
        (c) => c.label === "Human" || c.label === "LABEL_0" || c.label === "Real",
      );
      if (humanLabel) {
        return {
          method: "chatgpt_det",
          score: precise(1 - humanLabel.score),
          latencyMs: Date.now() - start,
          rawResponse: classifications,
        };
      }
      return {
        method: "chatgpt_det",
        score: null,
        latencyMs: Date.now() - start,
        error: "Labels not found: " + JSON.stringify(classifications),
        rawResponse: classifications,
      };
    }
    return {
      method: "chatgpt_det",
      score: aiLabel.score,
      latencyMs: Date.now() - start,
      rawResponse: classifications,
    };
  } catch (err) {
    return {
      method: "chatgpt_det",
      score: null,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ──────────────────────────────────────────────
// METHOD B: Sentence Embeddings (sentence-transformers/all-MiniLM-L6-v2)
// From real-detectors.ts lines 202-263
// ──────────────────────────────────────────────

export async function methodB_embeddings(
  client: InferenceClient,
  text: string,
): Promise<MethodResult> {
  const start = Date.now();
  try {
    const sentences = splitSentences(text);
    if (sentences.length < 2) {
      return {
        method: "embeddings",
        score: 0.5,
        latencyMs: Date.now() - start,
      };
    }

    const maxSentences = 15;
    let sampled: string[];
    if (sentences.length <= maxSentences) {
      sampled = sentences;
    } else {
      const step = sentences.length / maxSentences;
      sampled = Array.from(
        { length: maxSentences },
        (_, i) => sentences[Math.min(Math.floor(i * step), sentences.length - 1)],
      );
    }

    const embeddings: number[][] = [];
    for (const sentence of sampled) {
      const embedding = await client.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: sentence,
        provider: "hf-inference",
      });
      if (Array.isArray(embedding) && typeof embedding[0] === "number") {
        embeddings.push(embedding as number[]);
      }
      // Small delay between embedding calls
      await new Promise((r) => setTimeout(r, 200));
    }

    if (embeddings.length < 2) {
      return {
        method: "embeddings",
        score: 0.5,
        latencyMs: Date.now() - start,
      };
    }

    const consecutiveDistances: number[] = [];
    for (let i = 0; i < embeddings.length - 1; i++) {
      const sim = cosineSimilarity(embeddings[i], embeddings[i + 1]);
      consecutiveDistances.push(1 - sim);
    }

    const avgDistance =
      consecutiveDistances.reduce((a, b) => a + b, 0) /
      consecutiveDistances.length;
    const distanceVariance =
      consecutiveDistances.reduce(
        (sum, d) => sum + Math.pow(d - avgDistance, 2),
        0,
      ) / consecutiveDistances.length;
    const distanceStdDev = standardDeviation(consecutiveDistances);

    const skipDistances: number[] = [];
    for (let i = 0; i < embeddings.length - 2; i += 2) {
      const sim = cosineSimilarity(embeddings[i], embeddings[i + 2]);
      skipDistances.push(1 - sim);
    }
    const avgSkipDistance =
      skipDistances.length > 0
        ? skipDistances.reduce((a, b) => a + b, 0) / skipDistances.length
        : avgDistance;

    const uniformitySignal = clamp(1 - avgDistance * 2, 0, 1);
    const consistencySignal = clamp(1 - distanceVariance * 10, 0, 1);
    const rigiditySignal = clamp(1 - distanceStdDev * 5, 0, 1);
    const longRangeCoherence = clamp(1 - avgSkipDistance * 2, 0, 1);

    const score = precise(
      uniformitySignal * 0.35 +
        consistencySignal * 0.25 +
        rigiditySignal * 0.2 +
        longRangeCoherence * 0.2,
    );

    return {
      method: "embeddings",
      score,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      method: "embeddings",
      score: null,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
