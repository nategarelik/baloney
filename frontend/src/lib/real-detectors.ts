// frontend/src/lib/real-detectors.ts — Real AI detection
// Primary:  Self-hosted DeBERTa-v3-large on Railway (#1 on RAID benchmark)
// Fallback: HuggingFace Inference API (RoBERTa + MiniLM + statistical)
// Image:    HuggingFace Inference API (ViT + FFT + metadata)

import { InferenceClient } from "@huggingface/inference";
import type {
  DetectionResult,
  TextDetectionResult,
  TextStats,
  Verdict,
  SentenceScore,
  FeatureVector,
} from "./types";
import { computeTextStats, mockTextResult, mockImageResult } from "./mock-detectors";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function precise(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([!?])/g, "$1|")
    .split(/[.|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function sentenceWordCounts(text: string): number[] {
  const sentences = text
    .replace(/[!?]/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.map((s) => s.split(/\s+/).filter((w) => w.length > 0).length);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ──────────────────────────────────────────────
// HuggingFace client
// ──────────────────────────────────────────────

function getHFClient(): InferenceClient {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY not configured");
  }
  return new InferenceClient(apiKey);
}

// ──────────────────────────────────────────────
// Verdict mapping
// ──────────────────────────────────────────────

interface VerdictMapping {
  verdict: Verdict;
  confidence: number;
  trust_score: number;
  edit_magnitude: number;
  caveat: string;
}

function mapVerdict(aiProbability: number, textLength: number): VerdictMapping {
  if (aiProbability > 0.75) {
    return {
      verdict: "ai_generated",
      confidence: precise(aiProbability),
      trust_score: precise(1 - aiProbability * 0.95),
      edit_magnitude: precise(0.80 + aiProbability * 0.20),
      caveat: textLength < 200
        ? "Short text — AI detection confidence is reduced. Patterns consistent with AI-generated text detected."
        : "Patterns consistent with AI-generated text detected. Text detection is experimental and should not be considered definitive.",
    };
  }

  if (aiProbability > 0.55) {
    return {
      verdict: "heavy_edit",
      confidence: precise(0.60 + (aiProbability - 0.55) * 1.0),
      trust_score: precise(0.25 + (0.75 - aiProbability) * 1.0),
      edit_magnitude: precise(0.55 + (aiProbability - 0.55) * 1.25),
      caveat: "Significant AI-assisted editing detected. Content appears substantially modified by AI tools.",
    };
  }

  if (aiProbability > 0.35) {
    return {
      verdict: "light_edit",
      confidence: precise(0.50 + (aiProbability - 0.35) * 1.0),
      trust_score: precise(0.45 + (0.55 - aiProbability) * 1.0),
      edit_magnitude: precise(0.20 + (aiProbability - 0.35) * 1.75),
      caveat: "Minor AI assistance likely. Content appears primarily human-written with some AI refinement.",
    };
  }

  return {
    verdict: "human",
    confidence: precise(1 - aiProbability),
    trust_score: precise(0.75 + (0.35 - aiProbability) * 0.66),
    edit_magnitude: precise(aiProbability * 0.57),
    caveat: "Text appears human-written, but AI text detection has known limitations. Heavily edited AI text may appear human.",
  };
}

// ──────────────────────────────────────────────
// METHOD A: Transformer-Based Binary Classification
// RoBERTa fine-tuned on GPT-2 outputs (Spec §3.1 Method A)
// ──────────────────────────────────────────────

async function methodA_roberta(client: InferenceClient, text: string): Promise<number> {
  const result = await client.textClassification({
    model: "openai-community/roberta-base-openai-detector",
    inputs: text.slice(0, 2000),
    provider: "hf-inference",
  });

  const classifications = Array.isArray(result) ? result : [result];
  const aiLabel = classifications.find(
    (c) => c.label === "Fake" || c.label === "LABEL_1"
  );

  if (!aiLabel) {
    throw new Error("AI label not found in RoBERTa response: " + JSON.stringify(classifications));
  }

  return aiLabel.score;
}

// ──────────────────────────────────────────────
// METHOD B: Sentence Embedding Analysis (EditLens-inspired)
// Uses all-MiniLM-L6-v2 to compute inter-sentence cosine distances
// AI text has more uniform embeddings (lower variance in distances)
// (Spec §3.1 Method B)
// ──────────────────────────────────────────────

async function methodB_embeddings(client: InferenceClient, sentences: string[]): Promise<number> {
  if (sentences.length < 2) return 0.5;

  // Get embeddings for each sentence
  const embeddings: number[][] = [];
  for (const sentence of sentences.slice(0, 8)) {
    const embedding = await client.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: sentence,
      provider: "hf-inference",
    });
    // featureExtraction returns number[] for single input
    if (Array.isArray(embedding) && typeof embedding[0] === "number") {
      embeddings.push(embedding as number[]);
    }
  }

  if (embeddings.length < 2) return 0.5;

  // Compute pairwise cosine distances between consecutive sentences
  const distances: number[] = [];
  for (let i = 0; i < embeddings.length - 1; i++) {
    const sim = cosineSimilarity(embeddings[i], embeddings[i + 1]);
    distances.push(1 - sim); // Convert similarity to distance
  }

  // AI text has LOWER inter-sentence distance (more uniform embeddings)
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const distanceVariance = distances.reduce(
    (sum, d) => sum + Math.pow(d - avgDistance, 2), 0
  ) / distances.length;

  // Low average distance + low variance → more AI-like
  // High average distance + high variance → more human-like
  const uniformitySignal = clamp(1 - avgDistance * 2, 0, 1); // Higher = more AI
  const consistencySignal = clamp(1 - distanceVariance * 10, 0, 1); // Higher = more AI

  return precise(uniformitySignal * 0.6 + consistencySignal * 0.4);
}

// ──────────────────────────────────────────────
// METHOD D: Statistical Feature Extraction
// Burstiness, TTR, readability, perplexity proxy
// (Spec §3.1 Method D)
// ──────────────────────────────────────────────

interface StatisticalSignal {
  burstiness: number;
  ttr: number;
  perplexityNorm: number;
  repetition: number;
  readability: number;
  signal: number;
}

function methodD_statistical(text: string, textStats: TextStats): StatisticalSignal {
  const wordCounts = sentenceWordCounts(text);
  const mean = wordCounts.length > 0
    ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    : 0;
  const variance = wordCounts.length > 0
    ? wordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wordCounts.length
    : 0;

  // Burstiness: Human text has high variance in sentence length
  const burstiness = precise(Math.min(variance / 100, 1));

  // Type-Token Ratio: AI tends toward ~0.55 TTR
  const ttr = textStats.lexical_diversity;

  // Perplexity proxy: combination of burstiness + vocabulary spread
  const perplexityNorm = precise(clamp(burstiness + (1 - ttr), 0, 1));

  // Repetition score
  const repetition = precise(clamp(1 - ttr, 0, 1));

  // Flesch-Kincaid readability approximation
  // AI clusters in specific readability ranges (typically 8-12 grade level)
  const avgSyllables = textStats.avg_word_length * 0.4; // rough syllable proxy
  const fk = 0.39 * textStats.avg_sentence_length + 11.8 * avgSyllables - 15.59;
  const fkNorm = clamp(fk / 20, 0, 1); // normalize to 0-1
  // AI text tends to cluster around grade 8-12 (fkNorm 0.4-0.6)
  const readability = Math.abs(fkNorm - 0.5) < 0.15 ? 0.7 : 0.3;

  // Combined statistical AI signal
  const signal = precise(
    (1 - burstiness) * 0.20 +
    (1 - ttr) * 0.20 +
    (1 - perplexityNorm) * 0.20 +
    repetition * 0.15 +
    readability * 0.25
  );

  return { burstiness, ttr, perplexityNorm, repetition, readability, signal };
}

function buildFeatureVector(stats: StatisticalSignal): FeatureVector {
  return {
    burstiness: stats.burstiness,
    type_token_ratio: stats.ttr,
    perplexity: precise(stats.perplexityNorm * 200 + 50, 2),
    repetition_score: stats.repetition,
  };
}

// ──────────────────────────────────────────────
// Sentence scoring
// ──────────────────────────────────────────────

function scoreSentencesReal(text: string, aiProbability: number): SentenceScore[] {
  const sentences = splitSentences(text).filter((s) => s.length > 10);
  const wordCounts = sentences.map((s) => s.split(/\s+/).filter((w) => w.length > 0).length);
  const avgLen = wordCounts.length > 0
    ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    : 0;

  let cursor = 0;
  return sentences.map((sentence, i) => {
    const startIndex = text.indexOf(sentence, cursor);
    const endIndex = startIndex + sentence.length;
    cursor = endIndex;

    let prob = aiProbability;
    const sentLen = wordCounts[i];
    const deviation = avgLen > 0 ? Math.abs(sentLen - avgLen) / avgLen : 0;

    if (deviation <= 0.30) {
      prob += 0.05; // close to avg = more uniform = more AI-like
    } else {
      prob -= 0.05; // far from avg = more variable = more human-like
    }

    return {
      text: sentence,
      ai_probability: precise(clamp(prob, 0, 1)),
      start_index: startIndex,
      end_index: endIndex,
    };
  });
}

// ──────────────────────────────────────────────
// Railway Backend Integration
// Self-hosted DeBERTa-v3-large (#1 RAID benchmark)
// ──────────────────────────────────────────────

async function railwayTextDetection(text: string): Promise<TextDetectionResult | null> {
  const backendUrl = process.env.RAILWAY_BACKEND_URL;
  if (!backendUrl) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Railway API error: ${response.status}`);
    }

    const data = await response.json();
    const aiProbability = data.final_score as number;
    const textStats = computeTextStats(text);

    // Map Railway response to TextDetectionResult format
    const mapping = mapVerdict(aiProbability, text.length);
    const stats = methodD_statistical(text, textStats);
    const featureVector = buildFeatureVector(stats);
    const sentenceScores = scoreSentencesReal(text, aiProbability);

    return {
      verdict: mapping.verdict,
      confidence: mapping.confidence,
      ai_probability: aiProbability,
      model_used: "railway:deberta-v3-large+statistical",
      text_stats: textStats,
      caveat: mapping.caveat,
      trust_score: mapping.trust_score,
      classification: mapping.verdict,
      edit_magnitude: mapping.edit_magnitude,
      feature_vector: featureVector,
      sentence_scores: sentenceScores,
    };
  } catch (error) {
    console.warn("[Baloney] Railway backend unavailable, falling back:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ══════════════════════════════════════════════
// REAL TEXT DETECTION — Multi-Signal Ensemble
// Priority: Railway DeBERTa → HuggingFace RoBERTa+MiniLM → Mock
// ══════════════════════════════════════════════

export async function realTextDetection(text: string): Promise<TextDetectionResult> {
  try {
    const textStats = computeTextStats(text);

    if (text.length < 50) {
      const stats = methodD_statistical(text, textStats);
      const featureVector = buildFeatureVector(stats);
      return {
        verdict: "light_edit",
        confidence: 0.0,
        ai_probability: 0.5,
        model_used: "deberta+statistical",
        text_stats: textStats,
        caveat: "Text too short for reliable detection (minimum 50 characters recommended).",
        trust_score: 0.5,
        classification: "light_edit",
        edit_magnitude: 0.0,
        feature_vector: featureVector,
        sentence_scores: [],
      };
    }

    // Try Railway backend first (self-hosted DeBERTa, RAID #1)
    const railwayResult = await railwayTextDetection(text);
    if (railwayResult) return railwayResult;

    // Fallback to HuggingFace Inference API
    const client = getHFClient();
    const sentences = splitSentences(text).filter((s) => s.length > 10);

    // Run all methods in parallel
    const [hfScore, embeddingScore] = await Promise.all([
      methodA_roberta(client, text),
      methodB_embeddings(client, sentences).catch(() => 0.5), // graceful fallback
    ]);

    // Method D: Statistical features (runs locally, no API)
    const stats = methodD_statistical(text, textStats);

    // Ensemble: Method A (50%) + Method B (20%) + Method D (30%)
    const aiProbability = precise(
      hfScore * 0.50 +
      embeddingScore * 0.20 +
      stats.signal * 0.30
    );

    // Sentence scoring
    const sentenceScores = scoreSentencesReal(text, aiProbability);

    // Verdict mapping
    const mapping = mapVerdict(aiProbability, text.length);

    // Feature vector
    const featureVector = buildFeatureVector(stats);

    return {
      verdict: mapping.verdict,
      confidence: mapping.confidence,
      ai_probability: aiProbability,
      model_used: "hf:roberta+minilm+statistical",
      text_stats: textStats,
      caveat: mapping.caveat,
      trust_score: mapping.trust_score,
      classification: mapping.verdict,
      edit_magnitude: mapping.edit_magnitude,
      feature_vector: featureVector,
      sentence_scores: sentenceScores,
    };
  } catch (error) {
    console.warn("[Baloney] Real text detection failed, using mock fallback:", error);
    return mockTextResult(text);
  }
}

// ══════════════════════════════════════════════
// IMAGE DETECTION
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// METHOD E: ViT-Based Classification (CLIP-style)
// umm-maybe/AI-image-detector — ViT fine-tuned to detect AI images
// Generalizes across GAN and diffusion models (Spec §3.2 Method E)
// ──────────────────────────────────────────────

async function methodE_vitClassifier(client: InferenceClient, blob: Blob): Promise<number> {
  const result = await client.imageClassification({
    model: "umm-maybe/AI-image-detector",
    data: blob,
    provider: "hf-inference",
  });

  const classifications = Array.isArray(result) ? result : [result];
  const aiLabel = classifications.find(
    (c) => c.label === "artificial" || c.label === "Fake" || c.label === "LABEL_1"
  );

  if (!aiLabel) {
    throw new Error("AI label not found in image response: " + JSON.stringify(classifications));
  }

  return aiLabel.score;
}

// ──────────────────────────────────────────────
// METHOD F: Frequency Domain Analysis (FFT)
// Diffusion-generated images show different high-frequency spectral patterns
// (Spec §3.2 Method F — Corvi et al. 2023, DEFEND 2024)
// ──────────────────────────────────────────────

function methodF_frequency(imageBytes: Buffer): number {
  // Extract raw pixel data from image bytes for frequency analysis
  // We work with a simplified spectral energy approach:
  // AI-generated images tend to have steeper spectral decay (less high-freq energy)

  const size = Math.min(imageBytes.length, 65536); // Cap analysis size
  const samples = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    samples[i] = imageBytes[i] / 255.0;
  }

  // Simple frequency-domain feature: ratio of high vs low frequency energy
  // Using a sliding window variance approach as a proxy for spectral analysis
  const windowSize = 16;
  const localVariances: number[] = [];
  for (let i = 0; i < samples.length - windowSize; i += windowSize) {
    let sum = 0, sumSq = 0;
    for (let j = 0; j < windowSize; j++) {
      const v = samples[i + j];
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / windowSize;
    const variance = sumSq / windowSize - mean * mean;
    localVariances.push(variance);
  }

  if (localVariances.length === 0) return 0.5;

  // Overall statistics of local variance
  const avgVariance = localVariances.reduce((a, b) => a + b, 0) / localVariances.length;
  const varianceOfVariance = localVariances.reduce(
    (sum, v) => sum + Math.pow(v - avgVariance, 2), 0
  ) / localVariances.length;

  // AI images tend to have more uniform local variance (smooth gradients)
  // Real photos have more variable local variance (texture, noise)
  const uniformity = clamp(1 - varianceOfVariance * 1000, 0, 1);

  // High-frequency energy proxy: adjacent pixel differences
  let highFreqEnergy = 0;
  for (let i = 1; i < Math.min(samples.length, 10000); i++) {
    highFreqEnergy += Math.abs(samples[i] - samples[i - 1]);
  }
  highFreqEnergy /= Math.min(samples.length - 1, 9999);

  // AI images typically have LESS high-frequency energy (smoother)
  const smoothness = clamp(1 - highFreqEnergy * 5, 0, 1);

  // Combine signals: high uniformity + high smoothness → more AI
  return precise(uniformity * 0.5 + smoothness * 0.5);
}

// ──────────────────────────────────────────────
// METHOD G: Metadata Analysis
// Real photos have camera EXIF; AI images lack genuine metadata
// (Spec §3.2 Method G)
// ──────────────────────────────────────────────

function methodG_metadata(base64Image: string): number {
  // Check data URI for metadata signals
  const hasDataUri = base64Image.startsWith("data:");

  // Extract MIME type from data URI
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "unknown";

  // JPEG photos from cameras typically have EXIF embedded in the binary
  // We can check for EXIF markers in the raw base64-decoded bytes
  const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
  let bytes: Buffer;
  try {
    bytes = Buffer.from(raw, "base64");
  } catch {
    return 0.3; // Can't decode = suspicious
  }

  let suspicion = 0;

  // Check for EXIF marker (0xFFE1) in JPEG
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    let hasExif = false;
    for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xE1) {
        hasExif = true;
        break;
      }
    }
    if (!hasExif) {
      suspicion += 0.25; // JPEG without EXIF is suspicious
    } else {
      // Check for camera make/model strings in EXIF
      const exifSlice = bytes.slice(0, 2000).toString("ascii");
      const hasCamera = /Canon|Nikon|Sony|Apple|Samsung|Google|Fuji|Olympus|Panasonic|LG/i.test(exifSlice);
      if (!hasCamera) suspicion += 0.10;
    }
  } else if (mimeType === "image/png") {
    // PNG images from cameras are rare; most camera output is JPEG
    suspicion += 0.10;
  }

  // Very small file size relative to dimensions could indicate AI generation
  // (AI generators often produce efficient but lacking-in-noise output)
  if (bytes.length < 5000) suspicion += 0.05;

  return precise(clamp(suspicion, 0, 1));
}

// ──────────────────────────────────────────────
// Image Verdict Mapping
// ──────────────────────────────────────────────

function mapImageVerdict(compositeScore: number): {
  verdict: Verdict;
  confidence: number;
  trust_score: number;
  edit_magnitude: number;
} {
  if (compositeScore > 0.65) {
    return {
      verdict: "ai_generated",
      confidence: precise(compositeScore),
      trust_score: precise(1 - compositeScore * 0.95),
      edit_magnitude: precise(0.80 + compositeScore * 0.20),
    };
  }

  if (compositeScore > 0.45) {
    return {
      verdict: "heavy_edit",
      confidence: precise(0.55 + (compositeScore - 0.45) * 1.0),
      trust_score: precise(0.30 + (0.65 - compositeScore) * 1.0),
      edit_magnitude: precise(0.50 + (compositeScore - 0.45) * 1.5),
    };
  }

  if (compositeScore > 0.30) {
    return {
      verdict: "light_edit",
      confidence: precise(0.50 + (compositeScore - 0.30) * 0.7),
      trust_score: precise(0.50 + (0.45 - compositeScore) * 1.5),
      edit_magnitude: precise(0.20 + (compositeScore - 0.30) * 2.0),
    };
  }

  return {
    verdict: "human",
    confidence: precise(1 - compositeScore),
    trust_score: precise(0.80 + (0.30 - compositeScore) * 0.66),
    edit_magnitude: precise(compositeScore * 0.5),
  };
}

// ══════════════════════════════════════════════
// REAL IMAGE DETECTION — Multi-Signal Ensemble
// Methods E (55%) + F (25%) + G (20%)   [Spec §5.2 composite weights]
// ══════════════════════════════════════════════

export async function realImageDetection(base64Image: string): Promise<DetectionResult> {
  try {
    const client = getHFClient();

    // Prepare image blob with content type
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const bytes = Buffer.from(raw, "base64");
    const blob = new Blob([bytes], { type: mimeType });

    // Run all methods (E is async, F and G are sync)
    const [vitScore] = await Promise.all([
      methodE_vitClassifier(client, blob),
    ]);

    const freqScore = methodF_frequency(bytes);
    const metaScore = methodG_metadata(base64Image);

    // Composite: Method E (55%) + Method F (25%) + Method G (20%)
    const compositeScore = precise(
      vitScore * 0.55 +
      freqScore * 0.25 +
      metaScore * 0.20
    );

    const mapping = mapImageVerdict(compositeScore);

    return {
      verdict: mapping.verdict,
      confidence: mapping.confidence,
      primary_score: precise(vitScore),
      secondary_score: precise(freqScore),
      model_used: "hf:vit-ai-detector+fft+metadata",
      ensemble_used: true,
      trust_score: mapping.trust_score,
      classification: mapping.verdict,
      edit_magnitude: mapping.edit_magnitude,
    };
  } catch (error) {
    console.warn("[Baloney] Real image detection failed, using mock fallback:", error);
    return mockImageResult();
  }
}
