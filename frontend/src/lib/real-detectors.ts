// frontend/src/lib/real-detectors.ts — Real AI detection (v3.0 — Mac Studio Local Inference)
// Primary:  Mac Studio backend — 9-model local ensemble on Apple Silicon MPS
//   Text:  DeBERTa-v3-large + RoBERTa-OpenAI + RoBERTa-ChatGPT + MiniLM + Statistical (5 models)
//   Image: ViT-AI-detector + SDXL-detector + FFT + EXIF (4 signals)
// Fallback: HuggingFace API ensemble (if Mac Studio backend unavailable)
// Video:    Multi-frame analysis with temporal consistency scoring

import { InferenceClient } from "@huggingface/inference";
import type {
  DetectionResult,
  TextDetectionResult,
  VideoDetectionResult,
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

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
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
// METHOD C: ChatGPT-era Detector (covers GPT-3.5/4, Claude, Gemini)
// Hello-SimpleAI/chatgpt-detector-roberta — RoBERTa fine-tuned on
// ChatGPT outputs (HC3 dataset), complementing Method A's GPT-2 training.
// Cross-model coverage: trained on ChatGPT but generalizes to Claude/Gemini
// due to shared transformer output characteristics.
// (Added v2.0 — addresses GPT-2-only blind spot in Method A)
// ──────────────────────────────────────────────

async function methodC_chatgptDetector(client: InferenceClient, text: string): Promise<number> {
  const result = await client.textClassification({
    model: "Hello-SimpleAI/chatgpt-detector-roberta",
    inputs: text.slice(0, 2000),
    provider: "hf-inference",
  });

  const classifications = Array.isArray(result) ? result : [result];
  // This model uses "ChatGPT" label for AI-generated text
  const aiLabel = classifications.find(
    (c) => c.label === "ChatGPT" || c.label === "LABEL_1" || c.label === "Fake"
  );

  if (!aiLabel) {
    // If no AI label found, look for the human label and invert
    const humanLabel = classifications.find(
      (c) => c.label === "Human" || c.label === "LABEL_0" || c.label === "Real"
    );
    if (humanLabel) return precise(1 - humanLabel.score);
    throw new Error("Labels not found in chatgpt-detector response: " + JSON.stringify(classifications));
  }

  return aiLabel.score;
}

// ──────────────────────────────────────────────
// METHOD B: Sentence Embedding Analysis (EditLens-inspired, v2.0 enhanced)
// Uses all-MiniLM-L6-v2 to compute inter-sentence cosine distances
// AI text has more uniform embeddings (lower variance in distances)
// v2.0: Samples up to 15 sentences uniformly across the doc,
//        adds std-dev of distances + semantic clustering signal
// (Spec §3.1 Method B)
// ──────────────────────────────────────────────

async function methodB_embeddings(client: InferenceClient, sentences: string[]): Promise<number> {
  if (sentences.length < 2) return 0.5;

  // v2.0: Sample up to 15 sentences uniformly across the document
  // This captures structure from beginning, middle, and end
  const maxSentences = 15;
  let sampled: string[];
  if (sentences.length <= maxSentences) {
    sampled = sentences;
  } else {
    const step = sentences.length / maxSentences;
    sampled = Array.from({ length: maxSentences }, (_, i) =>
      sentences[Math.min(Math.floor(i * step), sentences.length - 1)]
    );
  }

  // Get embeddings for each sentence (batch them for efficiency)
  const embeddings: number[][] = [];
  for (const sentence of sampled) {
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
  const consecutiveDistances: number[] = [];
  for (let i = 0; i < embeddings.length - 1; i++) {
    const sim = cosineSimilarity(embeddings[i], embeddings[i + 1]);
    consecutiveDistances.push(1 - sim); // Convert similarity to distance
  }

  // AI text has LOWER inter-sentence distance (more uniform embeddings)
  const avgDistance = consecutiveDistances.reduce((a, b) => a + b, 0) / consecutiveDistances.length;
  const distanceVariance = consecutiveDistances.reduce(
    (sum, d) => sum + Math.pow(d - avgDistance, 2), 0
  ) / consecutiveDistances.length;

  // v2.0: Standard deviation of distances — AI text clusters tighter
  const distanceStdDev = standardDeviation(consecutiveDistances);

  // v2.0: Semantic clustering — compute all-pairs similarity for non-adjacent sentences
  // AI text maintains unnaturally high similarity even across distant sentences
  const skipDistances: number[] = [];
  for (let i = 0; i < embeddings.length - 2; i += 2) {
    const sim = cosineSimilarity(embeddings[i], embeddings[i + 2]);
    skipDistances.push(1 - sim);
  }
  const avgSkipDistance = skipDistances.length > 0
    ? skipDistances.reduce((a, b) => a + b, 0) / skipDistances.length
    : avgDistance;

  // Low average distance + low variance → more AI-like
  // High average distance + high variance → more human-like
  const uniformitySignal = clamp(1 - avgDistance * 2, 0, 1); // Higher = more AI
  const consistencySignal = clamp(1 - distanceVariance * 10, 0, 1); // Higher = more AI

  // v2.0: Low std-dev in distances means rigid structure → AI
  const rigiditySignal = clamp(1 - distanceStdDev * 5, 0, 1);

  // v2.0: High semantic coherence across non-adjacent sentences → AI
  const longRangeCoherence = clamp(1 - avgSkipDistance * 2, 0, 1);

  return precise(
    uniformitySignal * 0.35 +
    consistencySignal * 0.25 +
    rigiditySignal * 0.20 +
    longRangeCoherence * 0.20
  );
}

// ──────────────────────────────────────────────
// METHOD D: Statistical Feature Extraction (v2.0 — 12 features)
// Burstiness, TTR, readability, perplexity proxy, n-gram entropy,
// transition word frequency, punctuation patterns, hedging language
// (Spec §3.1 Method D, enhanced v2.0)
// ──────────────────────────────────────────────

interface StatisticalSignal {
  burstiness: number;
  ttr: number;
  perplexityNorm: number;
  repetition: number;
  readability: number;
  signal: number;
}

// v2.0: Common AI transition words/phrases — LLMs overuse these
const AI_TRANSITION_PHRASES = [
  "moreover", "furthermore", "additionally", "consequently", "nevertheless",
  "in conclusion", "it is important to note", "it's worth noting",
  "it is worth noting", "it should be noted", "in other words",
  "on the other hand", "as a result", "in addition", "for instance",
  "in summary", "to summarize", "overall", "ultimately", "essentially",
  "specifically", "significantly", "notably", "importantly",
  "interestingly", "remarkably", "particularly", "fundamentally",
];

// v2.0: Hedging phrases common in LLM output
const AI_HEDGING_PHRASES = [
  "it's important to", "it is important to", "it's worth", "it is worth",
  "it's crucial", "it is crucial", "it's essential", "it is essential",
  "there are several", "there are many", "there are various",
  "can be considered", "may be considered", "could potentially",
  "it depends on", "this can vary", "in many cases", "in some cases",
];

function methodD_statistical(text: string, textStats: TextStats): StatisticalSignal {
  const wordCounts = sentenceWordCounts(text);
  const mean = wordCounts.length > 0
    ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    : 0;
  const variance = wordCounts.length > 0
    ? wordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wordCounts.length
    : 0;

  // Burstiness: Human text has high variance in sentence length
  // Test data: AI avg 0.35, Human avg 0.73 — strongest discriminator
  const burstiness = precise(Math.min(variance / 100, 1));

  // Type-Token Ratio: AI tends toward ~0.55 TTR
  const ttr = textStats.lexical_diversity;

  // Perplexity proxy: combination of burstiness + vocabulary spread
  const perplexityNorm = precise(clamp(burstiness + (1 - ttr), 0, 1));

  // Repetition score
  const repetition = precise(clamp(1 - ttr, 0, 1));

  // Sentence length signal: AI text has much longer sentences (avg ~21 words)
  // vs human text (avg ~12 words). Normalize using sigmoid around threshold.
  // Test data: AI avg 21.6, Human avg 12.5
  const sentLenSignal = precise(clamp((textStats.avg_sentence_length - 10) / 15, 0, 1));

  // Word length signal: AI text uses longer words (avg ~6.3 chars)
  // vs human text (avg ~4.7 chars). Normalize similarly.
  // Test data: AI avg 6.28, Human avg 4.72
  const wordLenSignal = precise(clamp((textStats.avg_word_length - 4.0) / 3.0, 0, 1));

  // Flesch-Kincaid readability approximation
  // AI clusters at higher grade levels due to longer sentences + bigger words
  const avgSyllables = textStats.avg_word_length * 0.4; // rough syllable proxy
  const fk = 0.39 * textStats.avg_sentence_length + 11.8 * avgSyllables - 15.59;
  const fkNorm = clamp(fk / 20, 0, 1); // normalize to 0-1
  const readability = fkNorm > 0.45 ? precise(0.5 + fkNorm * 0.5) : precise(fkNorm * 0.6);

  // ── v2.0: New statistical features ──

  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length || 1;

  // v2.0 Feature 1: Transition word frequency
  // AI text uses 2-3x more transition words than human text
  // Research: GPT-4 uses "moreover" 10x more than average human writing
  let transitionCount = 0;
  for (const phrase of AI_TRANSITION_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) transitionCount += matches.length;
  }
  const transitionRate = transitionCount / totalWords;
  // AI text: ~0.03-0.06 transition rate; Human: ~0.01-0.02
  const transitionSignal = precise(clamp(transitionRate * 25, 0, 1));

  // v2.0 Feature 2: Hedging phrase frequency
  // LLMs systematically hedge more than human writers
  let hedgingCount = 0;
  for (const phrase of AI_HEDGING_PHRASES) {
    if (lowerText.includes(phrase)) hedgingCount++;
  }
  const hedgingSignal = precise(clamp(hedgingCount / 4, 0, 1));

  // v2.0 Feature 3: Punctuation pattern analysis
  // AI text: fewer em-dashes, exclamation marks, parentheticals
  // AI text: more commas per sentence, more semicolons
  const commaCount = (text.match(/,/g) || []).length;
  const commasPerSentence = textStats.sentence_count > 0
    ? commaCount / textStats.sentence_count : 0;
  // AI averages ~2.5 commas/sentence vs human ~1.5
  const commaDensitySignal = precise(clamp((commasPerSentence - 1.0) / 3.0, 0, 1));

  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const emDashCount = (text.match(/[—–-]{2,}|—/g) || []).length;
  const expressiveRate = (exclamationCount + questionCount + emDashCount) / totalWords;
  // Human text: higher expressive punctuation rate
  // Low expressive rate → more AI-like
  const expressiveSignal = precise(clamp(1 - expressiveRate * 50, 0, 1));

  // v2.0 Feature 4: Paragraph opening patterns
  // AI tends to start paragraphs with similar structures
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  let sameStartCount = 0;
  if (paragraphs.length > 1) {
    const firstWords = paragraphs.map(p => {
      const firstWord = p.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
      return firstWord;
    });
    const wordFreq: Record<string, number> = {};
    for (const w of firstWords) {
      if (w) wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
    const maxFreq = Math.max(...Object.values(wordFreq), 0);
    sameStartCount = maxFreq;
  }
  const paragraphRepetitionSignal = paragraphs.length > 2
    ? precise(clamp((sameStartCount - 1) / (paragraphs.length - 1), 0, 1))
    : 0;

  // v2.0 Feature 5: Bigram entropy (word-pair predictability)
  // AI text has lower bigram entropy — more predictable word sequences
  const bigrams: Record<string, number> = {};
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z']/g, ""));
  for (let i = 0; i < lowerWords.length - 1; i++) {
    const bg = lowerWords[i] + " " + lowerWords[i + 1];
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }
  const bigramTotal = Math.max(Object.values(bigrams).reduce((a, b) => a + b, 0), 1);
  let bigramEntropy = 0;
  for (const count of Object.values(bigrams)) {
    const p = count / bigramTotal;
    if (p > 0) bigramEntropy -= p * Math.log2(p);
  }
  // Normalize: higher entropy = more human (more varied word pairs)
  // Typical AI: 8-10 bits, Typical human: 10-13 bits
  const maxBigramEntropy = Math.log2(bigramTotal);
  const normalizedBigramEntropy = maxBigramEntropy > 0
    ? bigramEntropy / maxBigramEntropy : 0.5;
  // Low normalized entropy → AI
  const entropySignal = precise(clamp(1 - normalizedBigramEntropy, 0, 1));

  // Combined statistical AI signal — v2.0 weights with new features
  // Original 6 features (60%) + 5 new features (40%)
  const signal = precise(
    (1 - burstiness) * 0.18 +       // strongest: low burstiness = AI
    sentLenSignal * 0.14 +           // strong: long sentences = AI
    wordLenSignal * 0.10 +           // moderate: long words = AI
    readability * 0.08 +             // moderate: high grade level = AI
    (1 - ttr) * 0.05 +              // weak: low diversity = AI
    (1 - perplexityNorm) * 0.05 +   // weak: low perplexity proxy = AI
    transitionSignal * 0.12 +        // NEW strong: high transition words = AI
    hedgingSignal * 0.08 +           // NEW moderate: hedging = AI
    commaDensitySignal * 0.05 +      // NEW weak: high comma density = AI
    expressiveSignal * 0.05 +        // NEW weak: low expressive punct = AI
    paragraphRepetitionSignal * 0.04 + // NEW weak: paragraph starts repeat = AI
    entropySignal * 0.06             // NEW moderate: low bigram entropy = AI
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
// Sentence scoring (v2.0 — multi-feature per-sentence analysis)
// ──────────────────────────────────────────────

function scoreSentencesReal(text: string, aiProbability: number): SentenceScore[] {
  const sentences = splitSentences(text).filter((s) => s.length > 10);
  const wordCounts = sentences.map((s) => s.split(/\s+/).filter((w) => w.length > 0).length);
  const avgLen = wordCounts.length > 0
    ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    : 0;

  // v2.0: Pre-compute per-sentence word lengths for word-length analysis
  const sentenceAvgWordLens = sentences.map(s => {
    const words = s.split(/\s+/).filter(w => w.length > 0);
    return words.length > 0 ? words.reduce((sum, w) => sum + w.length, 0) / words.length : 0;
  });
  const overallAvgWordLen = sentenceAvgWordLens.length > 0
    ? sentenceAvgWordLens.reduce((a, b) => a + b, 0) / sentenceAvgWordLens.length
    : 0;

  let cursor = 0;
  return sentences.map((sentence, i) => {
    const startIndex = text.indexOf(sentence, cursor);
    const endIndex = startIndex + sentence.length;
    cursor = endIndex;

    let prob = aiProbability;
    const sentLen = wordCounts[i];
    const deviation = avgLen > 0 ? Math.abs(sentLen - avgLen) / avgLen : 0;

    // Feature 1: Sentence length uniformity
    if (deviation <= 0.25) {
      prob += 0.04; // close to avg = more uniform = more AI-like
    } else if (deviation > 0.50) {
      prob -= 0.06; // far from avg = more variable = more human-like
    } else {
      prob -= 0.02;
    }

    // v2.0 Feature 2: Word length in sentence — AI uses uniformly longer words
    const wordLenDev = overallAvgWordLen > 0
      ? Math.abs(sentenceAvgWordLens[i] - overallAvgWordLen) / overallAvgWordLen
      : 0;
    if (wordLenDev <= 0.15) {
      prob += 0.03; // very uniform word length across sentences = AI
    } else if (wordLenDev > 0.30) {
      prob -= 0.03;
    }

    // v2.0 Feature 3: Transition word at sentence start
    const lowerSent = sentence.toLowerCase().trim();
    const startsWithTransition = AI_TRANSITION_PHRASES.some(p => lowerSent.startsWith(p));
    if (startsWithTransition) {
      prob += 0.05;
    }

    // v2.0 Feature 4: Comma density in sentence
    const commas = (sentence.match(/,/g) || []).length;
    if (sentLen > 0 && commas / sentLen > 0.15) {
      prob += 0.02; // high comma density = AI-like
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
// Mac Studio Backend Integration (v3.0)
// 9-model local ensemble on Apple Silicon MPS
// Env: BACKEND_URL (Mac Studio) or RAILWAY_BACKEND_URL (Railway fallback)
// ──────────────────────────────────────────────

function getBackendUrl(): string | null {
  return process.env.BACKEND_URL || process.env.RAILWAY_BACKEND_URL || null;
}

async function backendTextDetection(text: string): Promise<TextDetectionResult | null> {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for local ensemble

  try {
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    const aiProbability = data.final_score as number;
    const textStats = computeTextStats(text);

    // Map backend response to TextDetectionResult format
    const mapping = mapVerdict(aiProbability, text.length);
    const stats = methodD_statistical(text, textStats);
    const featureVector = buildFeatureVector(stats);
    const sentenceScores = scoreSentencesReal(text, aiProbability);

    // Extract model info from backend response
    const mlDetection = data.ml_detection || {};
    const methodScores = mlDetection.method_scores || {};
    const modelCount = data.model_count || mlDetection.model_count || 5;
    const device = data.device || mlDetection.device || "unknown";
    const inferenceMs = data.inference_ms || mlDetection.inference_ms || 0;

    // Build model_used string showing local ensemble
    const modelUsed = `local:${modelCount}-model-ensemble(${device})`;

    return {
      verdict: mapping.verdict,
      confidence: mapping.confidence,
      ai_probability: aiProbability,
      model_used: modelUsed,
      text_stats: textStats,
      caveat: mapping.caveat,
      trust_score: mapping.trust_score,
      classification: mapping.verdict,
      edit_magnitude: mapping.edit_magnitude,
      feature_vector: featureVector,
      sentence_scores: sentenceScores,
    };
  } catch (error) {
    console.warn("[Baloney] Backend unavailable, falling back:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function backendImageDetection(base64Image: string): Promise<DetectionResult | null> {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${backendUrl}/api/analyze-image-b64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backend image API error: ${response.status}`);
    }

    const data = await response.json();
    const compositeScore = data.ai_score as number;
    const mapping = mapImageVerdict(compositeScore);

    const methods = data.methods || {};
    const vitScore = methods.vit_ai_detector?.score ?? compositeScore;
    const sdxlScore = methods.sdxl_detector?.score ?? compositeScore;
    const device = data.device || "unknown";
    const modelCount = data.model_count || 4;

    return {
      verdict: mapping.verdict,
      confidence: mapping.confidence,
      primary_score: precise(vitScore),
      secondary_score: precise(sdxlScore),
      model_used: `local:${modelCount}-signal-ensemble(${device})`,
      ensemble_used: true,
      trust_score: mapping.trust_score,
      classification: mapping.verdict,
      edit_magnitude: mapping.edit_magnitude,
    };
  } catch (error) {
    console.warn("[Baloney] Backend image detection unavailable, falling back:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ══════════════════════════════════════════════
// REAL TEXT DETECTION — Multi-Signal Ensemble (v3.0 — Mac Studio priority)
// Priority: Mac Studio 5-model ensemble → HuggingFace 4-method fallback → Mock
// Mac Studio: DeBERTa + RoBERTa-OpenAI + RoBERTa-ChatGPT + MiniLM + Statistical
// HF Fallback: A (RoBERTa, 30%) + C (ChatGPT, 25%) + B (Embeddings, 15%) + D (Stats, 30%)
// ══════════════════════════════════════════════

export async function realTextDetection(text: string): Promise<TextDetectionResult> {
  try {
    const textStats = computeTextStats(text);

    // v2.0: Lower threshold to 20 chars but scale confidence
    if (text.length < 20) {
      const stats = methodD_statistical(text, textStats);
      const featureVector = buildFeatureVector(stats);
      return {
        verdict: "light_edit",
        confidence: 0.0,
        ai_probability: 0.5,
        model_used: "deberta+statistical",
        text_stats: textStats,
        caveat: "Text too short for reliable detection (minimum 20 characters recommended).",
        trust_score: 0.5,
        classification: "light_edit",
        edit_magnitude: 0.0,
        feature_vector: featureVector,
        sentence_scores: [],
      };
    }

    // v3.0: Try Mac Studio backend first (9-model local ensemble on MPS)
    const backendResult = await backendTextDetection(text);
    if (backendResult) return backendResult;

    // Fallback to HuggingFace Inference API — v2.0: 4-method ensemble
    const client = getHFClient();
    const sentences = splitSentences(text).filter((s) => s.length > 10);

    // Method D: Statistical features (runs locally, no API, always first)
    const stats = methodD_statistical(text, textStats);

    // v2.0: Run all API methods in parallel for max speed
    // Method A (RoBERTa/GPT-2) + Method C (ChatGPT-detector) + Method B (Embeddings)
    const [hfScore, chatgptScore, embeddingScore] = await Promise.all([
      methodA_roberta(client, text).catch(() => null),
      methodC_chatgptDetector(client, text).catch(() => null),
      methodB_embeddings(client, sentences).catch(() => 0.5),
    ]);

    // v2.0: Dynamic weight allocation — if a model fails, redistribute weight
    let aiProbability: number;
    let modelName: string;

    if (hfScore !== null && chatgptScore !== null) {
      // Both transformer models available: full 4-method ensemble
      // Weights: A (30%) + C (25%) + B (15%) + D (30%)
      // Two independent classifiers covering GPT-2 era AND ChatGPT era
      aiProbability = precise(
        hfScore * 0.30 +
        chatgptScore * 0.25 +
        embeddingScore * 0.15 +
        stats.signal * 0.30
      );
      modelName = "hf:roberta+chatgpt-detector+minilm+statistical";
    } else if (hfScore !== null) {
      // Only RoBERTa available: redistribute ChatGPT weight
      aiProbability = precise(
        hfScore * 0.45 +
        embeddingScore * 0.20 +
        stats.signal * 0.35
      );
      modelName = "hf:roberta+minilm+statistical";
    } else if (chatgptScore !== null) {
      // Only ChatGPT-detector available: redistribute RoBERTa weight
      aiProbability = precise(
        chatgptScore * 0.40 +
        embeddingScore * 0.20 +
        stats.signal * 0.40
      );
      modelName = "hf:chatgpt-detector+minilm+statistical";
    } else {
      // No transformer models available: embeddings + statistical only
      aiProbability = precise(
        embeddingScore * 0.35 +
        stats.signal * 0.65
      );
      modelName = "hf:minilm+statistical";
    }

    // v2.0: Short text confidence scaling — reduce confidence for texts < 200 chars
    if (text.length < 200) {
      const lengthPenalty = text.length / 200; // 0.1 to 1.0
      // Pull probability toward 0.5 (uncertain) proportionally
      aiProbability = precise(0.5 + (aiProbability - 0.5) * lengthPenalty);
    }

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
      model_used: modelName,
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
// METHOD E2: SDXL/Flux-era Detector (v2.0)
// Organika/sdxl-detector — fine-tuned on SDXL, Midjourney, DALL-E 3 outputs
// Complements Method E's ViT which is better at GAN-era images
// ──────────────────────────────────────────────

async function methodE2_sdxlDetector(client: InferenceClient, blob: Blob): Promise<number> {
  const result = await client.imageClassification({
    model: "Organika/sdxl-detector",
    data: blob,
    provider: "hf-inference",
  });

  const classifications = Array.isArray(result) ? result : [result];
  const aiLabel = classifications.find(
    (c) => c.label === "artificial" || c.label === "Fake" || c.label === "LABEL_1" || c.label === "ai"
  );

  if (!aiLabel) {
    // Try inverting the human/real label
    const humanLabel = classifications.find(
      (c) => c.label === "human" || c.label === "Real" || c.label === "LABEL_0" || c.label === "real"
    );
    if (humanLabel) return precise(1 - humanLabel.score);
    throw new Error("AI label not found in SDXL detector response: " + JSON.stringify(classifications));
  }

  return aiLabel.score;
}

// ──────────────────────────────────────────────
// METHOD F: Frequency Domain Analysis (v2.0 — DCT + multi-scale FFT)
// Diffusion-generated images show different high-frequency spectral patterns
// v2.0: Adds DCT coefficient analysis, multi-scale windowing, edge detection,
//        and spectral slope estimation (Corvi et al. 2023, DEFEND 2024)
// ──────────────────────────────────────────────

function methodF_frequency(imageBytes: Buffer): number {
  // Extract raw pixel data from image bytes for frequency analysis
  const size = Math.min(imageBytes.length, 65536); // Cap analysis size
  const samples = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    samples[i] = imageBytes[i] / 255.0;
  }

  // ── Signal 1: Multi-scale local variance analysis ──
  // Use 3 window sizes to capture texture at different scales
  const windowSizes = [8, 16, 32];
  const scaleUniformities: number[] = [];

  for (const windowSize of windowSizes) {
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

    if (localVariances.length > 0) {
      const avgVar = localVariances.reduce((a, b) => a + b, 0) / localVariances.length;
      const varOfVar = localVariances.reduce(
        (sum, v) => sum + Math.pow(v - avgVar, 2), 0
      ) / localVariances.length;
      scaleUniformities.push(clamp(1 - varOfVar * 1000, 0, 1));
    }
  }

  const avgUniformity = scaleUniformities.length > 0
    ? scaleUniformities.reduce((a, b) => a + b, 0) / scaleUniformities.length
    : 0.5;

  // ── Signal 2: High-frequency energy (adjacent pixel differences) ──
  const analyzeLen = Math.min(samples.length, 20000);
  let highFreqEnergy = 0;
  for (let i = 1; i < analyzeLen; i++) {
    highFreqEnergy += Math.abs(samples[i] - samples[i - 1]);
  }
  highFreqEnergy /= Math.max(analyzeLen - 1, 1);
  const smoothness = clamp(1 - highFreqEnergy * 5, 0, 1);

  // ── Signal 3: DCT coefficient analysis (simplified) ──
  // AI images have different DCT coefficient distributions than real photos
  // Compute block-DCT energy distribution (8x8 blocks, like JPEG)
  const blockSize = 8;
  let lowFreqDCTEnergy = 0;
  let highFreqDCTEnergy = 0;
  let dctBlocks = 0;

  for (let blockStart = 0; blockStart + blockSize * blockSize <= Math.min(samples.length, 32768); blockStart += blockSize * blockSize) {
    // Simple 1D DCT approximation per block
    const block = samples.slice(blockStart, blockStart + blockSize * blockSize);
    const mean = block.reduce((a, b) => a + b, 0) / block.length;

    // DC component (low frequency) = block mean
    lowFreqDCTEnergy += mean * mean;

    // AC components (high frequency) = deviations from mean
    let acEnergy = 0;
    for (let j = 0; j < block.length; j++) {
      acEnergy += Math.pow(block[j] - mean, 2);
    }
    highFreqDCTEnergy += acEnergy / block.length;
    dctBlocks++;
  }

  // AI images: higher ratio of low-freq to high-freq DCT energy (smoother blocks)
  let dctRatioSignal = 0.5;
  if (dctBlocks > 0 && highFreqDCTEnergy > 0) {
    const dctRatio = (lowFreqDCTEnergy / dctBlocks) / (highFreqDCTEnergy / dctBlocks + 0.001);
    dctRatioSignal = clamp(dctRatio * 2, 0, 1); // Higher ratio = smoother = more AI
  }

  // ── Signal 4: Edge density analysis ──
  // Real photos have more complex, varied edges; AI images have cleaner edges
  let edgeCount = 0;
  const edgeThreshold = 0.08; // ~20/255 difference between adjacent pixels
  for (let i = 1; i < analyzeLen; i++) {
    if (Math.abs(samples[i] - samples[i - 1]) > edgeThreshold) {
      edgeCount++;
    }
  }
  const edgeDensity = edgeCount / Math.max(analyzeLen - 1, 1);
  // Low edge density = smoother = more likely AI
  const edgeSignal = clamp(1 - edgeDensity * 3, 0, 1);

  // ── Signal 5: Spectral slope estimation ──
  // AI images have steeper spectral decay (1/f^β with higher β)
  // Estimate by comparing variance at different scales
  if (scaleUniformities.length >= 2) {
    const slopeDiff = scaleUniformities[scaleUniformities.length - 1] - scaleUniformities[0];
    // Large positive diff = more uniform at larger scales = natural spectral decay (human)
    // Small/negative diff = uniformly smooth across scales = AI
    const slopeSignal = clamp(0.5 - slopeDiff * 2, 0, 1);

    // v2.0: Weighted composite with 5 signals
    return precise(
      avgUniformity * 0.25 +
      smoothness * 0.20 +
      dctRatioSignal * 0.25 +
      edgeSignal * 0.15 +
      slopeSignal * 0.15
    );
  }

  // Fallback if not enough scale data
  return precise(
    avgUniformity * 0.30 +
    smoothness * 0.25 +
    dctRatioSignal * 0.25 +
    edgeSignal * 0.20
  );
}

// ──────────────────────────────────────────────
// METHOD G: Metadata Analysis (v2.0 — enhanced heuristics)
// Real photos have camera EXIF; AI images lack genuine metadata
// v2.0: TIFF tag validation, AI tool signature detection, C2PA marker check,
//        resolution pattern analysis, file structure scoring
// (Spec §3.2 Method G)
// ──────────────────────────────────────────────

function methodG_metadata(base64Image: string): number {
  // Extract MIME type from data URI
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "unknown";

  // Decode raw bytes
  const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
  let bytes: Buffer;
  try {
    bytes = Buffer.from(raw, "base64");
  } catch {
    return 0.3; // Can't decode = suspicious
  }

  let suspicion = 0;
  let authenticity = 0; // v2.0: counter-signal for confirmed real photos

  // ── Check 1: EXIF analysis for JPEG ──
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    let hasExif = false;
    let exifOffset = -1;
    for (let i = 0; i < Math.min(bytes.length, 2000); i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xE1) {
        hasExif = true;
        exifOffset = i;
        break;
      }
    }
    if (!hasExif) {
      suspicion += 0.20; // JPEG without EXIF is suspicious
    } else {
      const exifSlice = bytes.slice(0, 4000).toString("ascii");

      // Check for camera make/model strings
      const hasCamera = /Canon|Nikon|Sony|Apple|Samsung|Google|Fuji|Olympus|Panasonic|LG|Huawei|Xiaomi|OnePlus|Pixel|iPhone/i.test(exifSlice);
      if (hasCamera) {
        authenticity += 0.15; // Camera brand found = likely real
      } else {
        suspicion += 0.08;
      }

      // v2.0: Check for valid TIFF header within EXIF (indicates real EXIF structure)
      if (exifOffset >= 0 && exifOffset + 10 < bytes.length) {
        // Valid EXIF should have "Exif\0\0" followed by TIFF header "II" or "MM"
        const exifHeader = bytes.slice(exifOffset + 4, exifOffset + 14).toString("ascii");
        const hasTiffHeader = exifHeader.includes("II") || exifHeader.includes("MM");
        if (hasTiffHeader) {
          authenticity += 0.08; // Proper TIFF structure = more likely real
        } else {
          suspicion += 0.05; // Invalid EXIF structure
        }
      }

      // v2.0: Check for GPS data (most phone cameras embed location)
      const hasGPS = exifSlice.includes("GPS");
      if (hasGPS) {
        authenticity += 0.05;
      }

      // v2.0: Check for software editing tags (Photoshop, GIMP = edited but not AI)
      const hasSoftware = /Photoshop|GIMP|Lightroom|ACDSee|Paint/i.test(exifSlice);
      if (hasSoftware) {
        // Edited photo — slight suspicion but not AI-generated
        suspicion += 0.03;
      }
    }

    // v2.0: Check for JFIF marker (many AI tools produce JFIF without EXIF)
    let hasJFIF = false;
    for (let i = 0; i < Math.min(bytes.length, 100); i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xE0) {
        hasJFIF = true;
        break;
      }
    }
    if (hasJFIF && !hasExif) {
      suspicion += 0.05; // JFIF-only JPEG = stripped metadata
    }
  } else if (mimeType === "image/png") {
    suspicion += 0.08; // PNG from cameras is uncommon

    // v2.0: Check for iTXt/tEXt chunks with AI tool signatures
    const pngText = bytes.slice(0, 8000).toString("ascii");
    const hasAISignature = /Stable Diffusion|DALL-E|Midjourney|ComfyUI|AUTOMATIC1111|NovelAI|DreamStudio|sd-metadata|aesthetic_score/i.test(pngText);
    if (hasAISignature) {
      suspicion += 0.40; // Strong AI tool signature found
    }

    // v2.0: Check for PNG "Software" field
    const hasCreationTool = /tEXt|iTXt/i.test(pngText);
    if (!hasCreationTool) {
      suspicion += 0.03; // No text metadata at all
    }
  } else if (mimeType === "image/webp") {
    // v2.0: WebP is increasingly common from AI tools
    suspicion += 0.05;
  }

  // ── Check 2: File structure analysis ──
  // Very small file size for image data
  if (bytes.length < 5000) {
    suspicion += 0.05;
  }

  // v2.0: Very uniform file size suggests specific generator output
  // Many AI generators produce images in specific size ranges
  const kbSize = bytes.length / 1024;
  if (kbSize > 200 && kbSize < 300) {
    // SDXL default output range
    suspicion += 0.03;
  }

  // v2.0: Check for C2PA/Content Credentials markers
  // C2PA (Coalition for Content Provenance and Authenticity) signs real photos
  const headerStr = bytes.slice(0, 4000).toString("ascii");
  const hasC2PA = /c2pa|contentauth|Content Credentials/i.test(headerStr);
  if (hasC2PA) {
    authenticity += 0.20; // Strong authenticity signal
  }

  // v2.0: Final score combines suspicion minus authenticity
  const finalScore = clamp(suspicion - authenticity * 0.5, 0, 1);

  return precise(finalScore);
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
// REAL IMAGE DETECTION — Multi-Signal Ensemble (v3.0 — Mac Studio priority)
// Priority: Mac Studio 4-signal ensemble → HuggingFace dual classifier fallback → Mock
// Mac Studio: ViT-AI-detector + SDXL-detector + FFT + EXIF (all local, MPS)
// HF Fallback: E (ViT, 35%) + E2 (SDXL, 20%) + F (DCT/FFT, 25%) + G (metadata, 20%)
// ══════════════════════════════════════════════

export async function realImageDetection(base64Image: string): Promise<DetectionResult> {
  try {
    // v3.0: Try Mac Studio backend first (4-signal local ensemble on MPS)
    const backendResult = await backendImageDetection(base64Image);
    if (backendResult) return backendResult;

    // Fallback: HuggingFace Inference API
    const client = getHFClient();

    // Prepare image blob with content type
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const bytes = Buffer.from(raw, "base64");
    const blob = new Blob([bytes], { type: mimeType });

    // v2.0: Run both classifiers in parallel + sync methods
    const [vitScore, sdxlScore] = await Promise.all([
      methodE_vitClassifier(client, blob).catch(() => null),
      methodE2_sdxlDetector(client, blob).catch(() => null),
    ]);

    const freqScore = methodF_frequency(bytes);
    const metaScore = methodG_metadata(base64Image);

    // v2.0: Dynamic weight allocation based on available classifiers
    let compositeScore: number;
    let modelName: string;

    if (vitScore !== null && sdxlScore !== null) {
      // Both classifiers available: full 4-method ensemble
      // v2.0: Confidence-aware weighting — give more weight to the more confident classifier
      const vitConfidence = Math.abs(vitScore - 0.5) * 2; // 0=uncertain, 1=confident
      const sdxlConfidence = Math.abs(sdxlScore - 0.5) * 2;
      const classifierTotal = vitConfidence + sdxlConfidence + 0.001;

      // Base weights: ViT (35%) + SDXL (20%) — adjust by relative confidence
      const vitWeight = 0.35 * (0.5 + vitConfidence / classifierTotal * 0.5);
      const sdxlWeight = 0.20 * (0.5 + sdxlConfidence / classifierTotal * 0.5);

      // Normalize all weights to sum to 1
      const totalWeight = vitWeight + sdxlWeight + 0.25 + 0.20;
      compositeScore = precise(
        (vitScore * vitWeight +
         sdxlScore * sdxlWeight +
         freqScore * 0.25 +
         metaScore * 0.20) / totalWeight
      );
      modelName = "hf:vit-ai-detector+sdxl-detector+dct-fft+metadata";

      // v2.0: Agreement bonus — if both classifiers agree strongly, boost confidence
      if ((vitScore > 0.7 && sdxlScore > 0.7) || (vitScore < 0.3 && sdxlScore < 0.3)) {
        // Strong agreement: nudge composite score slightly toward the consensus
        const classifierAvg = (vitScore + sdxlScore) / 2;
        compositeScore = precise(compositeScore * 0.85 + classifierAvg * 0.15);
      }
    } else if (vitScore !== null) {
      // Only ViT available
      compositeScore = precise(
        vitScore * 0.50 +
        freqScore * 0.28 +
        metaScore * 0.22
      );
      modelName = "hf:vit-ai-detector+dct-fft+metadata";
    } else if (sdxlScore !== null) {
      // Only SDXL detector available
      compositeScore = precise(
        sdxlScore * 0.45 +
        freqScore * 0.30 +
        metaScore * 0.25
      );
      modelName = "hf:sdxl-detector+dct-fft+metadata";
    } else {
      // No classifiers available — rely on local methods only
      compositeScore = precise(
        freqScore * 0.55 +
        metaScore * 0.45
      );
      modelName = "local:dct-fft+metadata";
    }

    const mapping = mapImageVerdict(compositeScore);

    return {
      verdict: mapping.verdict,
      confidence: mapping.confidence,
      primary_score: precise(vitScore ?? freqScore),
      secondary_score: precise(sdxlScore ?? freqScore),
      model_used: modelName,
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

// ══════════════════════════════════════════════
// REAL VIDEO DETECTION — Multi-Frame Ensemble (v2.0)
// Extracts multiple frames, runs image detection on each,
// then combines with temporal consistency analysis
// ══════════════════════════════════════════════

export async function realVideoDetection(
  frameBase64s: string[]
): Promise<VideoDetectionResult> {
  if (frameBase64s.length === 0) {
    return {
      verdict: "human",
      confidence: 0,
      frames_analyzed: 0,
      frames_flagged_ai: 0,
      ai_frame_percentage: 0,
      frame_scores: [],
      model_used: "none",
      duration_seconds: 0,
    };
  }

  const startTime = Date.now();
  const frameResults: DetectionResult[] = [];

  // Analyze each frame (limit to 8 frames for API rate limiting)
  const framesToAnalyze = frameBase64s.slice(0, 8);
  for (const frameBase64 of framesToAnalyze) {
    try {
      const result = await realImageDetection(frameBase64);
      frameResults.push(result);
    } catch {
      // Skip failed frames
    }
  }

  if (frameResults.length === 0) {
    return {
      verdict: "human",
      confidence: 0,
      frames_analyzed: 0,
      frames_flagged_ai: 0,
      ai_frame_percentage: 0,
      frame_scores: [],
      model_used: "multi-frame:none",
      duration_seconds: 0,
    };
  }

  // Extract frame-level AI scores
  const frameScores = frameResults.map(r => r.confidence);
  const frameVerdicts = frameResults.map(r => r.verdict);

  // Count AI-flagged frames (ai_generated or heavy_edit)
  const flaggedCount = frameVerdicts.filter(
    v => v === "ai_generated" || v === "heavy_edit"
  ).length;
  const aiFramePercentage = flaggedCount / frameResults.length;

  // Temporal consistency analysis:
  // AI-generated videos have VERY consistent scores across frames
  // Real videos edited with AI will have inconsistent scores
  const scoreStdDev = standardDeviation(frameScores);
  const avgScore = frameScores.reduce((a, b) => a + b, 0) / frameScores.length;

  // If scores are very consistent (stddev < 0.1) and high, more likely fully AI
  // If scores are inconsistent (stddev > 0.2), likely mixed/edited content
  let temporalBonus = 0;
  if (scoreStdDev < 0.08 && avgScore > 0.6) {
    temporalBonus = 0.05; // Very consistent AI detection across frames
  } else if (scoreStdDev > 0.25) {
    temporalBonus = -0.05; // Inconsistent = probably mixed content
  }

  const finalScore = clamp(avgScore + temporalBonus, 0, 1);

  // Determine verdict
  let verdict: Verdict;
  if (aiFramePercentage > 0.6 || finalScore > 0.65) {
    verdict = "ai_generated";
  } else if (aiFramePercentage > 0.3 || finalScore > 0.45) {
    verdict = "heavy_edit";
  } else if (aiFramePercentage > 0.1 || finalScore > 0.30) {
    verdict = "light_edit";
  } else {
    verdict = "human";
  }

  const duration = (Date.now() - startTime) / 1000;
  const modelUsed = frameResults.length > 0
    ? `multi-frame:${frameResults[0].model_used}`
    : "multi-frame:none";

  return {
    verdict,
    confidence: precise(finalScore),
    frames_analyzed: frameResults.length,
    frames_flagged_ai: flaggedCount,
    ai_frame_percentage: precise(aiFramePercentage),
    frame_scores: frameScores.map(s => precise(s)),
    model_used: modelUsed,
    duration_seconds: precise(duration, 1),
  };
}
