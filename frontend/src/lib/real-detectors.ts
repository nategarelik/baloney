// frontend/src/lib/real-detectors.ts — Real AI detection (v5.0 — Primary APIs Only)
// Text:  SynthID Text (Google Gemini watermark) → Pangram (99.85%) → Statistical (12 features)
// Image: SynthID Image (Google Imagen watermark) → SightEngine (98.3%) → Frequency/DCT → Metadata/EXIF
// Video: SightEngine native video endpoint only
// Secondary/backup code (HuggingFace, Mac Studio, Reality Defender) commented out below

// import { InferenceClient } from "@huggingface/inference";
import type {
  DetectionResult,
  TextDetectionResult,
  VideoDetectionResult,
  TextStats,
  Verdict,
  SentenceScore,
  FeatureVector,
  MethodScore,
} from "./types";
import { computeTextStats } from "./mock-detectors";

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
  return sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length,
  );
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

// ──────────────────────────────────────────────
// HuggingFace client — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// function getHFClient(): InferenceClient {
//   const apiKey = process.env.HUGGINGFACE_API_KEY;
//   if (!apiKey) {
//     throw new Error("HUGGINGFACE_API_KEY not configured");
//   }
//   return new InferenceClient(apiKey);
// }

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
      edit_magnitude: precise(0.8 + aiProbability * 0.2),
      caveat:
        textLength < 200
          ? "Short text — AI detection confidence is reduced. Patterns consistent with AI-generated text detected."
          : "Patterns consistent with AI-generated text detected. Text detection is experimental and should not be considered definitive.",
    };
  }

  if (aiProbability > 0.55) {
    return {
      verdict: "heavy_edit",
      confidence: precise(0.6 + (aiProbability - 0.55) * 1.0),
      trust_score: precise(0.25 + (0.75 - aiProbability) * 1.0),
      edit_magnitude: precise(0.55 + (aiProbability - 0.55) * 1.25),
      caveat:
        "Significant AI-assisted editing detected. Content appears substantially modified by AI tools.",
    };
  }

  if (aiProbability > 0.35) {
    return {
      verdict: "light_edit",
      confidence: precise(0.5 + (aiProbability - 0.35) * 1.0),
      trust_score: precise(0.45 + (0.55 - aiProbability) * 1.0),
      edit_magnitude: precise(0.2 + (aiProbability - 0.35) * 1.75),
      caveat:
        "Minor AI assistance likely. Content appears primarily human-written with some AI refinement.",
    };
  }

  return {
    verdict: "human",
    confidence: precise(1 - aiProbability),
    trust_score: precise(0.75 + (0.35 - aiProbability) * 0.66),
    edit_magnitude: precise(aiProbability * 0.57),
    caveat:
      "Text appears human-written, but AI text detection has known limitations. Heavily edited AI text may appear human.",
  };
}

// ──────────────────────────────────────────────
// METHOD A: RoBERTa — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// async function methodA_roberta(
//   client: InferenceClient,
//   text: string,
// ): Promise<number> {
//   const result = await client.textClassification({
//     model: "openai-community/roberta-base-openai-detector",
//     inputs: text.slice(0, 2000),
//     provider: "hf-inference",
//   });
//   const classifications = Array.isArray(result) ? result : [result];
//   const aiLabel = classifications.find(
//     (c) => c.label === "Fake" || c.label === "LABEL_1",
//   );
//   if (!aiLabel) {
//     throw new Error(
//       "AI label not found in RoBERTa response: " +
//         JSON.stringify(classifications),
//     );
//   }
//   return aiLabel.score;
// }

// ──────────────────────────────────────────────
// METHOD C: ChatGPT Detector — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// async function methodC_chatgptDetector(
//   client: InferenceClient,
//   text: string,
// ): Promise<number> {
//   const result = await client.textClassification({
//     model: "Hello-SimpleAI/chatgpt-detector-roberta",
//     inputs: text.slice(0, 2000),
//     provider: "hf-inference",
//   });
//   const classifications = Array.isArray(result) ? result : [result];
//   const aiLabel = classifications.find(
//     (c) => c.label === "ChatGPT" || c.label === "LABEL_1" || c.label === "Fake",
//   );
//   if (!aiLabel) {
//     const humanLabel = classifications.find(
//       (c) => c.label === "Human" || c.label === "LABEL_0" || c.label === "Real",
//     );
//     if (humanLabel) return precise(1 - humanLabel.score);
//     throw new Error(
//       "Labels not found in chatgpt-detector response: " +
//         JSON.stringify(classifications),
//     );
//   }
//   return aiLabel.score;
// }

// ──────────────────────────────────────────────
// METHOD B: Sentence Embeddings — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// async function methodB_embeddings(
//   client: InferenceClient,
//   sentences: string[],
// ): Promise<number> {
//   if (sentences.length < 2) return 0.5;
//   const maxSentences = 15;
//   let sampled: string[];
//   if (sentences.length <= maxSentences) {
//     sampled = sentences;
//   } else {
//     const step = sentences.length / maxSentences;
//     sampled = Array.from(
//       { length: maxSentences },
//       (_, i) => sentences[Math.min(Math.floor(i * step), sentences.length - 1)],
//     );
//   }
//   const embeddings: number[][] = [];
//   for (const sentence of sampled) {
//     const embedding = await client.featureExtraction({
//       model: "sentence-transformers/all-MiniLM-L6-v2",
//       inputs: sentence,
//       provider: "hf-inference",
//     });
//     if (Array.isArray(embedding) && typeof embedding[0] === "number") {
//       embeddings.push(embedding as number[]);
//     }
//   }
//   if (embeddings.length < 2) return 0.5;
//   const consecutiveDistances: number[] = [];
//   for (let i = 0; i < embeddings.length - 1; i++) {
//     const sim = cosineSimilarity(embeddings[i], embeddings[i + 1]);
//     consecutiveDistances.push(1 - sim);
//   }
//   const avgDistance =
//     consecutiveDistances.reduce((a, b) => a + b, 0) /
//     consecutiveDistances.length;
//   const distanceVariance =
//     consecutiveDistances.reduce(
//       (sum, d) => sum + Math.pow(d - avgDistance, 2),
//       0,
//     ) / consecutiveDistances.length;
//   const distanceStdDev = standardDeviation(consecutiveDistances);
//   const skipDistances: number[] = [];
//   for (let i = 0; i < embeddings.length - 2; i += 2) {
//     const sim = cosineSimilarity(embeddings[i], embeddings[i + 2]);
//     skipDistances.push(1 - sim);
//   }
//   const avgSkipDistance =
//     skipDistances.length > 0
//       ? skipDistances.reduce((a, b) => a + b, 0) / skipDistances.length
//       : avgDistance;
//   const uniformitySignal = clamp(1 - avgDistance * 2, 0, 1);
//   const consistencySignal = clamp(1 - distanceVariance * 10, 0, 1);
//   const rigiditySignal = clamp(1 - distanceStdDev * 5, 0, 1);
//   const longRangeCoherence = clamp(1 - avgSkipDistance * 2, 0, 1);
//   return precise(
//     uniformitySignal * 0.35 +
//       consistencySignal * 0.25 +
//       rigiditySignal * 0.2 +
//       longRangeCoherence * 0.2,
//   );
// }

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
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "nevertheless",
  "in conclusion",
  "it is important to note",
  "it's worth noting",
  "it is worth noting",
  "it should be noted",
  "in other words",
  "on the other hand",
  "as a result",
  "in addition",
  "for instance",
  "in summary",
  "to summarize",
  "overall",
  "ultimately",
  "essentially",
  "specifically",
  "significantly",
  "notably",
  "importantly",
  "interestingly",
  "remarkably",
  "particularly",
  "fundamentally",
];

// v2.0: Hedging phrases common in LLM output
const AI_HEDGING_PHRASES = [
  "it's important to",
  "it is important to",
  "it's worth",
  "it is worth",
  "it's crucial",
  "it is crucial",
  "it's essential",
  "it is essential",
  "there are several",
  "there are many",
  "there are various",
  "can be considered",
  "may be considered",
  "could potentially",
  "it depends on",
  "this can vary",
  "in many cases",
  "in some cases",
];

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
  const sentLenSignal = precise(
    clamp((textStats.avg_sentence_length - 10) / 15, 0, 1),
  );

  // Word length signal: AI text uses longer words (avg ~6.3 chars)
  // vs human text (avg ~4.7 chars). Normalize similarly.
  // Test data: AI avg 6.28, Human avg 4.72
  const wordLenSignal = precise(
    clamp((textStats.avg_word_length - 4.0) / 3.0, 0, 1),
  );

  // Flesch-Kincaid readability approximation
  // AI clusters at higher grade levels due to longer sentences + bigger words
  const avgSyllables = textStats.avg_word_length * 0.4; // rough syllable proxy
  const fk = 0.39 * textStats.avg_sentence_length + 11.8 * avgSyllables - 15.59;
  const fkNorm = clamp(fk / 20, 0, 1); // normalize to 0-1
  const readability =
    fkNorm > 0.45 ? precise(0.5 + fkNorm * 0.5) : precise(fkNorm * 0.6);

  // ── v2.0: New statistical features ──

  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter((w) => w.length > 0);
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
  const commasPerSentence =
    textStats.sentence_count > 0 ? commaCount / textStats.sentence_count : 0;
  // AI averages ~2.5 commas/sentence vs human ~1.5
  const commaDensitySignal = precise(
    clamp((commasPerSentence - 1.0) / 3.0, 0, 1),
  );

  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const emDashCount = (text.match(/[—–-]{2,}|—/g) || []).length;
  const expressiveRate =
    (exclamationCount + questionCount + emDashCount) / totalWords;
  // Human text: higher expressive punctuation rate
  // Low expressive rate → more AI-like
  const expressiveSignal = precise(clamp(1 - expressiveRate * 50, 0, 1));

  // v2.0 Feature 4: Paragraph opening patterns
  // AI tends to start paragraphs with similar structures
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  let sameStartCount = 0;
  if (paragraphs.length > 1) {
    const firstWords = paragraphs.map((p) => {
      const firstWord = p
        .trim()
        .split(/\s+/)[0]
        ?.toLowerCase()
        .replace(/[^a-z]/g, "");
      return firstWord;
    });
    const wordFreq: Record<string, number> = {};
    for (const w of firstWords) {
      if (w) wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
    const maxFreq = Math.max(...Object.values(wordFreq), 0);
    sameStartCount = maxFreq;
  }
  const paragraphRepetitionSignal =
    paragraphs.length > 2
      ? precise(clamp((sameStartCount - 1) / (paragraphs.length - 1), 0, 1))
      : 0;

  // v2.0 Feature 5: Bigram entropy (word-pair predictability)
  // AI text has lower bigram entropy — more predictable word sequences
  const bigrams: Record<string, number> = {};
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""));
  for (let i = 0; i < lowerWords.length - 1; i++) {
    const bg = lowerWords[i] + " " + lowerWords[i + 1];
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }
  const bigramTotal = Math.max(
    Object.values(bigrams).reduce((a, b) => a + b, 0),
    1,
  );
  let bigramEntropy = 0;
  for (const count of Object.values(bigrams)) {
    const p = count / bigramTotal;
    if (p > 0) bigramEntropy -= p * Math.log2(p);
  }
  // Normalize: higher entropy = more human (more varied word pairs)
  // Typical AI: 8-10 bits, Typical human: 10-13 bits
  const maxBigramEntropy = Math.log2(bigramTotal);
  const normalizedBigramEntropy =
    maxBigramEntropy > 0 ? bigramEntropy / maxBigramEntropy : 0.5;
  // Low normalized entropy → AI
  const entropySignal = precise(clamp(1 - normalizedBigramEntropy, 0, 1));

  // Combined statistical AI signal — v2.0 weights with new features
  // Original 6 features (60%) + 5 new features (40%)
  const signal = precise(
    (1 - burstiness) * 0.18 + // strongest: low burstiness = AI
      sentLenSignal * 0.14 + // strong: long sentences = AI
      wordLenSignal * 0.1 + // moderate: long words = AI
      readability * 0.08 + // moderate: high grade level = AI
      (1 - ttr) * 0.05 + // weak: low diversity = AI
      (1 - perplexityNorm) * 0.05 + // weak: low perplexity proxy = AI
      transitionSignal * 0.12 + // NEW strong: high transition words = AI
      hedgingSignal * 0.08 + // NEW moderate: hedging = AI
      commaDensitySignal * 0.05 + // NEW weak: high comma density = AI
      expressiveSignal * 0.05 + // NEW weak: low expressive punct = AI
      paragraphRepetitionSignal * 0.04 + // NEW weak: paragraph starts repeat = AI
      entropySignal * 0.06, // NEW moderate: low bigram entropy = AI
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

// ──────────────────────────────────────────────
// METHOD P: Pangram Commercial API (99.85% accuracy)
// Emi & Spero, 2024 — arXiv:2402.14873v3
// 4-tier: Fully Human / Lightly AI-Assisted / Moderately AI-Assisted / Fully AI-Generated
// Endpoint: POST https://text.api.pangram.com/v3
// Auth: x-api-key header
// Returns: fraction_ai (0-1), classification, windows[] with ai_assistance_score + confidence
// ──────────────────────────────────────────────

interface PangramWindow {
  text: string;
  label: string;
  ai_assistance_score: number;
  confidence: "High" | "Medium" | "Low";
}

interface PangramResult {
  score: number;
  classification: string;
  windows: PangramWindow[];
}

async function methodP_pangram(text: string): Promise<PangramResult | null> {
  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
          "[Baloney] Pangram rate limit reached (4-5/day free tier)",
        );
        return null;
      }
      throw new Error(`Pangram API ${response.status}`);
    }

    const data = await response.json();
    return {
      score: data.fraction_ai as number,
      classification: data.classification as string,
      windows: (data.windows ?? []) as PangramWindow[],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function scoreSentencesReal(
  text: string,
  aiProbability: number,
): SentenceScore[] {
  const sentences = splitSentences(text).filter((s) => s.length > 10);
  const wordCounts = sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length,
  );
  const avgLen =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;

  // v2.0: Pre-compute per-sentence word lengths for word-length analysis
  const sentenceAvgWordLens = sentences.map((s) => {
    const words = s.split(/\s+/).filter((w) => w.length > 0);
    return words.length > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / words.length
      : 0;
  });
  const overallAvgWordLen =
    sentenceAvgWordLens.length > 0
      ? sentenceAvgWordLens.reduce((a, b) => a + b, 0) /
        sentenceAvgWordLens.length
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
    } else if (deviation > 0.5) {
      prob -= 0.06; // far from avg = more variable = more human-like
    } else {
      prob -= 0.02;
    }

    // v2.0 Feature 2: Word length in sentence — AI uses uniformly longer words
    const wordLenDev =
      overallAvgWordLen > 0
        ? Math.abs(sentenceAvgWordLens[i] - overallAvgWordLen) /
          overallAvgWordLen
        : 0;
    if (wordLenDev <= 0.15) {
      prob += 0.03; // very uniform word length across sentences = AI
    } else if (wordLenDev > 0.3) {
      prob -= 0.03;
    }

    // v2.0 Feature 3: Transition word at sentence start
    const lowerSent = sentence.toLowerCase().trim();
    const startsWithTransition = AI_TRANSITION_PHRASES.some((p) =>
      lowerSent.startsWith(p),
    );
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
// Mac Studio Backend Integration — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// function getBackendUrl(): string | null {
//   return process.env.BACKEND_URL || process.env.RAILWAY_BACKEND_URL || null;
// }

// async function backendTextDetection(
//   text: string,
// ): Promise<TextDetectionResult | null> {
//   const backendUrl = getBackendUrl();
//   if (!backendUrl) return null;
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 30000);
//   try {
//     const response = await fetch(`${backendUrl}/api/analyze`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ text }),
//       signal: controller.signal,
//     });
//     if (!response.ok) throw new Error(`Backend API error: ${response.status}`);
//     const data = await response.json();
//     const aiProbability = data.final_score as number;
//     const textStats = computeTextStats(text);
//     const mapping = mapVerdict(aiProbability, text.length);
//     const stats = methodD_statistical(text, textStats);
//     const featureVector = buildFeatureVector(stats);
//     const sentenceScores = scoreSentencesReal(text, aiProbability);
//     const mlDetection = data.ml_detection || {};
//     const modelCount = data.model_count || mlDetection.model_count || 5;
//     const device = data.device || mlDetection.device || "unknown";
//     const modelUsed = `local:${modelCount}-model-ensemble(${device})`;
//     return {
//       verdict: mapping.verdict, confidence: mapping.confidence,
//       ai_probability: aiProbability, model_used: modelUsed,
//       text_stats: textStats, caveat: mapping.caveat,
//       trust_score: mapping.trust_score, classification: mapping.verdict,
//       edit_magnitude: mapping.edit_magnitude, feature_vector: featureVector,
//       sentence_scores: sentenceScores,
//     };
//   } catch (error) {
//     console.warn("[Baloney] Backend unavailable, falling back:", error);
//     return null;
//   } finally { clearTimeout(timeoutId); }
// }

// async function backendImageDetection(
//   base64Image: string,
// ): Promise<DetectionResult | null> {
//   const backendUrl = getBackendUrl();
//   if (!backendUrl) return null;
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 30000);
//   try {
//     const response = await fetch(`${backendUrl}/api/analyze-image-b64`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ image: base64Image }),
//       signal: controller.signal,
//     });
//     if (!response.ok) throw new Error(`Backend image API error: ${response.status}`);
//     const data = await response.json();
//     const compositeScore = data.ai_score as number;
//     const mapping = mapImageVerdict(compositeScore);
//     const methods = data.methods || {};
//     const vitScore = methods.vit_ai_detector?.score ?? compositeScore;
//     const sdxlScore = methods.sdxl_detector?.score ?? compositeScore;
//     const device = data.device || "unknown";
//     const modelCount = data.model_count || 4;
//     return {
//       verdict: mapping.verdict, confidence: mapping.confidence,
//       primary_score: precise(vitScore), secondary_score: precise(sdxlScore),
//       model_used: `local:${modelCount}-signal-ensemble(${device})`,
//       ensemble_used: true, trust_score: mapping.trust_score,
//       classification: mapping.verdict, edit_magnitude: mapping.edit_magnitude,
//     };
//   } catch (error) {
//     console.warn("[Baloney] Backend image detection unavailable:", error);
//     return null;
//   } finally { clearTimeout(timeoutId); }
// }

// ══════════════════════════════════════════════
// REAL TEXT DETECTION — Cascading Pipeline (v5.0 — Primary APIs Only)
// Priority: SynthID (early exit) → Pangram (early exit) → Error if both fail
// ══════════════════════════════════════════════

export async function realTextDetection(
  text: string,
): Promise<TextDetectionResult> {
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
        caveat:
          "Text too short for reliable detection (minimum 20 characters recommended).",
        trust_score: 0.5,
        classification: "light_edit",
        edit_magnitude: 0.0,
        feature_vector: featureVector,
        sentence_scores: [],
      };
    }

    // v5.0: Cascading pipeline — primary APIs only
    // Stage 1: SynthID (near-zero false positive watermark) → Stage 2: Pangram (99.85%) → Error if both fail

    // ── Stage 1: SynthID Text (Google Gemini watermark detection) ──
    const synthidResult = await methodSynthID_text(text).catch(() => null);

    if (synthidResult === "watermarked") {
      // SynthID confirmed — high-confidence AI, no need for further analysis
      const stats = methodD_statistical(text, textStats);
      const featureVector = buildFeatureVector(stats);
      const mapping = mapVerdict(0.97, text.length);
      return {
        verdict: mapping.verdict,
        confidence: mapping.confidence,
        ai_probability: 0.97,
        model_used: "synthid:watermarked",
        text_stats: textStats,
        caveat:
          "Google SynthID watermark detected — this text was generated by a Google Gemini model.",
        trust_score: mapping.trust_score,
        classification: mapping.verdict,
        edit_magnitude: mapping.edit_magnitude,
        feature_vector: featureVector,
        sentence_scores: scoreSentencesReal(text, 0.97),
        method_scores: {
          pangram: {
            score: 0,
            weight: 0.38,
            label: "Pangram (99.85%)",
            available: false,
            status: "not_run",
          },
          synthid_text: {
            score: 1.0,
            weight: 1.0,
            label: "SynthID (Google Watermark)",
            available: true,
            status: "success",
          },
          statistical: {
            score: stats.signal,
            weight: 0.18,
            label: "Statistical (12 features)",
            available: true,
            status: "success",
          },
        },
        synthid_text_result: "watermarked",
      };
    }

    // ── Stage 2: Pangram API (99.85% accuracy commercial detector) ──
    const pangramResult = await methodP_pangram(text).catch(() => null);

    if (pangramResult !== null) {
      // Pangram returned a result — use it as the verdict
      const stats = methodD_statistical(text, textStats);
      const featureVector = buildFeatureVector(stats);

      let aiProbability = pangramResult.score;

      // Short text confidence scaling
      if (text.length < 200) {
        const lengthPenalty = text.length / 200;
        aiProbability = precise(0.5 + (aiProbability - 0.5) * lengthPenalty);
      }

      const mapping = mapVerdict(aiProbability, text.length);

      // Sentence scoring from Pangram windows
      let sentenceScores = scoreSentencesReal(text, aiProbability);
      if (pangramResult.windows && pangramResult.windows.length > 0) {
        const pangramSentences: SentenceScore[] = pangramResult.windows.map(
          (w) => {
            const startIdx = text.indexOf(w.text);
            return {
              text: w.text,
              ai_probability: w.ai_assistance_score,
              start_index: startIdx >= 0 ? startIdx : 0,
              end_index:
                startIdx >= 0 ? startIdx + w.text.length : w.text.length,
            };
          },
        );
        if (pangramSentences.length > 0) sentenceScores = pangramSentences;
      }

      const synthidAvailable =
        synthidResult !== null && synthidResult !== undefined;
      const methodScores: Record<string, MethodScore> = {
        pangram: {
          score: pangramResult.score,
          weight: 1.0,
          label: "Pangram (99.85%)",
          available: true,
          status: "success",
        },
        synthid_text: {
          score: synthidAvailable
            ? synthidResult === "not_watermarked"
              ? 0.0
              : 0.5
            : 0,
          weight: 0.0,
          label: "SynthID (Google Watermark)",
          available: synthidAvailable,
          status: synthidAvailable ? "success" : "unavailable",
        },
        statistical: {
          score: stats.signal,
          weight: 0.18,
          label: "Statistical (12 features)",
          available: true,
          status: "success",
        },
      };

      return {
        verdict: mapping.verdict,
        confidence: mapping.confidence,
        ai_probability: aiProbability,
        model_used:
          "pangram" + (synthidResult ? "+synthid:" + synthidResult : ""),
        text_stats: textStats,
        caveat: mapping.caveat,
        trust_score: mapping.trust_score,
        classification: mapping.verdict,
        edit_magnitude: mapping.edit_magnitude,
        feature_vector: featureVector,
        sentence_scores: sentenceScores,
        method_scores: methodScores,
        pangram_classification: pangramResult.classification,
        pangram_windows: pangramResult.windows?.map((w) => ({
          start: text.indexOf(w.text),
          end: text.indexOf(w.text) + w.text.length,
          ai_assistance_score: w.ai_assistance_score,
          classification: w.label,
          confidence:
            w.confidence === "High"
              ? 0.9
              : w.confidence === "Medium"
                ? 0.7
                : 0.5,
        })),
        synthid_text_result: synthidResult,
      };
    }

    // Stage 3 (HF Ensemble) commented out — primary APIs only
    throw new Error(
      "Primary text detection APIs unavailable (SynthID + Pangram both failed)",
    );
  } catch (error) {
    console.error("[Baloney] Real text detection failed:", error);
    throw error;
  }
}

// ══════════════════════════════════════════════
// IMAGE DETECTION
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// METHOD E: ViT Classifier — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// async function methodE_vitClassifier(
//   client: InferenceClient,
//   blob: Blob,
// ): Promise<number> {
//   const result = await client.imageClassification({
//     model: "umm-maybe/AI-image-detector",
//     data: blob,
//     provider: "hf-inference",
//   });
//   const classifications = Array.isArray(result) ? result : [result];
//   const aiLabel = classifications.find(
//     (c) => c.label === "artificial" || c.label === "Fake" || c.label === "LABEL_1",
//   );
//   if (!aiLabel) {
//     throw new Error("AI label not found in image response: " + JSON.stringify(classifications));
//   }
//   return aiLabel.score;
// }

// ──────────────────────────────────────────────
// METHOD E2: SDXL Detector — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// async function methodE2_sdxlDetector(
//   client: InferenceClient,
//   blob: Blob,
// ): Promise<number> {
//   const result = await client.imageClassification({
//     model: "Organika/sdxl-detector",
//     data: blob,
//     provider: "hf-inference",
//   });
//   const classifications = Array.isArray(result) ? result : [result];
//   const aiLabel = classifications.find(
//     (c) => c.label === "artificial" || c.label === "Fake" || c.label === "LABEL_1" || c.label === "ai",
//   );
//   if (!aiLabel) {
//     const humanLabel = classifications.find(
//       (c) => c.label === "human" || c.label === "Real" || c.label === "LABEL_0" || c.label === "real",
//     );
//     if (humanLabel) return precise(1 - humanLabel.score);
//     throw new Error("AI label not found in SDXL detector response: " + JSON.stringify(classifications));
//   }
//   return aiLabel.score;
// }

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
      let sum = 0,
        sumSq = 0;
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
      const avgVar =
        localVariances.reduce((a, b) => a + b, 0) / localVariances.length;
      const varOfVar =
        localVariances.reduce((sum, v) => sum + Math.pow(v - avgVar, 2), 0) /
        localVariances.length;
      scaleUniformities.push(clamp(1 - varOfVar * 1000, 0, 1));
    }
  }

  const avgUniformity =
    scaleUniformities.length > 0
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

  for (
    let blockStart = 0;
    blockStart + blockSize * blockSize <= Math.min(samples.length, 32768);
    blockStart += blockSize * blockSize
  ) {
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
    const dctRatio =
      lowFreqDCTEnergy / dctBlocks / (highFreqDCTEnergy / dctBlocks + 0.001);
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
    const slopeDiff =
      scaleUniformities[scaleUniformities.length - 1] - scaleUniformities[0];
    // Large positive diff = more uniform at larger scales = natural spectral decay (human)
    // Small/negative diff = uniformly smooth across scales = AI
    const slopeSignal = clamp(0.5 - slopeDiff * 2, 0, 1);

    // v2.0: Weighted composite with 5 signals
    return precise(
      avgUniformity * 0.25 +
        smoothness * 0.2 +
        dctRatioSignal * 0.25 +
        edgeSignal * 0.15 +
        slopeSignal * 0.15,
    );
  }

  // Fallback if not enough scale data
  return precise(
    avgUniformity * 0.3 +
      smoothness * 0.25 +
      dctRatioSignal * 0.25 +
      edgeSignal * 0.2,
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
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe1) {
        hasExif = true;
        exifOffset = i;
        break;
      }
    }
    if (!hasExif) {
      suspicion += 0.2; // JPEG without EXIF is suspicious
    } else {
      const exifSlice = bytes.slice(0, 4000).toString("ascii");

      // Check for camera make/model strings
      const hasCamera =
        /Canon|Nikon|Sony|Apple|Samsung|Google|Fuji|Olympus|Panasonic|LG|Huawei|Xiaomi|OnePlus|Pixel|iPhone/i.test(
          exifSlice,
        );
      if (hasCamera) {
        authenticity += 0.15; // Camera brand found = likely real
      } else {
        suspicion += 0.08;
      }

      // v2.0: Check for valid TIFF header within EXIF (indicates real EXIF structure)
      if (exifOffset >= 0 && exifOffset + 10 < bytes.length) {
        // Valid EXIF should have "Exif\0\0" followed by TIFF header "II" or "MM"
        const exifHeader = bytes
          .slice(exifOffset + 4, exifOffset + 14)
          .toString("ascii");
        const hasTiffHeader =
          exifHeader.includes("II") || exifHeader.includes("MM");
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
      const hasSoftware = /Photoshop|GIMP|Lightroom|ACDSee|Paint/i.test(
        exifSlice,
      );
      if (hasSoftware) {
        // Edited photo — slight suspicion but not AI-generated
        suspicion += 0.03;
      }
    }

    // v2.0: Check for JFIF marker (many AI tools produce JFIF without EXIF)
    let hasJFIF = false;
    for (let i = 0; i < Math.min(bytes.length, 100); i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe0) {
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
    const hasAISignature =
      /Stable Diffusion|DALL-E|Midjourney|ComfyUI|AUTOMATIC1111|NovelAI|DreamStudio|sd-metadata|aesthetic_score/i.test(
        pngText,
      );
    if (hasAISignature) {
      suspicion += 0.4; // Strong AI tool signature found
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
    authenticity += 0.2; // Strong authenticity signal
  }

  // v2.0: Final score combines suspicion minus authenticity
  const finalScore = clamp(suspicion - authenticity * 0.5, 0, 1);

  return precise(finalScore);
}

// ──────────────────────────────────────────────
// METHOD S: SightEngine Commercial API (98.3% accuracy, ARIA benchmark #1)
// Covers 120+ AI generators: DALL-E, Midjourney, SD, Flux, Sora
// Endpoint: POST https://api.sightengine.com/1.0/check.json
// Auth: api_user + api_secret as form params
// Returns: type.ai_generated (0-1 float)
// ──────────────────────────────────────────────

async function methodS_sightEngine(
  imageBytes: Buffer,
  mimeType: string = "image/jpeg",
): Promise<number | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const formData = new FormData();
    const ext = mimeType.split("/")[1]?.replace("+xml", "") || "jpg";
    formData.append(
      "media",
      new Blob([new Uint8Array(imageBytes)], { type: mimeType }),
      `image.${ext}`,
    );
    formData.append("models", "genai");
    formData.append("api_user", apiUser);
    formData.append("api_secret", apiSecret);

    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 400) {
        // 429 = rate limit, 400 = daily quota exceeded on free plan
        console.warn(`[Baloney] SightEngine unavailable (${response.status})`);
        return null;
      }
      throw new Error(`SightEngine ${response.status}`);
    }

    const data = await response.json();
    console.log("[Baloney] SightEngine response:", JSON.stringify(data));
    return data.type?.ai_generated ?? null;
  } catch (err) {
    console.error("[Baloney] SightEngine image error:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// URL-based variant (faster for web images — avoids uploading bytes)
async function methodS_sightEngineURL(
  imageUrl: string,
): Promise<number | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const params = new URLSearchParams({
      url: imageUrl,
      models: "genai",
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const response = await fetch(
      `https://api.sightengine.com/1.0/check.json?${params}`,
      { signal: controller.signal },
    );

    if (!response.ok) throw new Error(`SightEngine URL ${response.status}`);
    const data = await response.json();
    console.log("[Baloney] SightEngine URL response:", JSON.stringify(data));
    return data.type?.ai_generated ?? null;
  } catch (err) {
    console.error("[Baloney] SightEngine URL error:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// SightEngine native video endpoint (60s max, full server-side analysis)
export async function methodS_sightEngineVideo(videoBlob: Blob): Promise<{
  ai_generated_score: number;
  frames: Array<{ timestamp: number; ai_score: number }>;
} | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  const formData = new FormData();
  formData.append("media", videoBlob);
  formData.append("models", "genai");
  formData.append("api_user", apiUser);
  formData.append("api_secret", apiSecret);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      "https://api.sightengine.com/1.0/video/check-sync.json",
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 429 || response.status === 400) {
        console.warn(
          `[Baloney] SightEngine Video unavailable (${response.status})`,
        );
        return null;
      }
      throw new Error(`SightEngine Video ${response.status}`);
    }
    const data = await response.json();
    console.log(
      "[Baloney] SightEngine Video response:",
      JSON.stringify(data).slice(0, 1000),
    );

    const rawFrames = data.data?.frames || [];
    const frames = rawFrames.map(
      (f: {
        time?: number;
        info?: { position?: number };
        type?: { ai_generated?: number };
      }) => ({
        timestamp: f.time ?? f.info?.position ?? 0,
        ai_score: f.type?.ai_generated ?? 0,
      }),
    );

    const avgScore =
      frames.length > 0
        ? frames.reduce(
            (s: number, f: { ai_score: number }) => s + f.ai_score,
            0,
          ) / frames.length
        : null;

    return avgScore !== null ? { ai_generated_score: avgScore, frames } : null;
  } catch (err) {
    console.error("[Baloney] SightEngine Video error:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ──────────────────────────────────────────────
// METHOD SynthID: Google SynthID Text Watermark Detection
// Detects Gemini-generated text watermarks via Railway Python backend
// Binary signal: watermarked / not_watermarked / uncertain
// ──────────────────────────────────────────────

async function methodSynthID_text(
  text: string,
): Promise<"watermarked" | "not_watermarked" | "uncertain" | null> {
  const backendUrl = process.env.RAILWAY_BACKEND_URL;
  if (!backendUrl) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${backendUrl}/api/synthid-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.synthid_detected ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ──────────────────────────────────────────────
// METHOD SynthID Image: Google Vertex AI Watermark Detection
// Detects Google Imagen-generated image watermarks
// Uses service account JWT → OAuth2 access token for auth
// ──────────────────────────────────────────────

let _gcpAccessToken: string | null = null;
let _gcpTokenExpiry = 0;

async function getGCPAccessToken(): Promise<string | null> {
  if (_gcpAccessToken && Date.now() < _gcpTokenExpiry - 60000)
    return _gcpAccessToken;

  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return null;

  try {
    const sa = JSON.parse(saJson);
    const crypto = await import("crypto");

    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" }),
    ).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const claims = Buffer.from(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    ).toString("base64url");

    const signInput = `${header}.${claims}`;
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signInput);
    const signature = sign.sign(sa.private_key, "base64url");
    const jwt = `${signInput}.${signature}`;

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!response.ok) return null;
    const data = await response.json();
    _gcpAccessToken = data.access_token;
    _gcpTokenExpiry = Date.now() + (data.expires_in ?? 3600) * 1000;
    return _gcpAccessToken;
  } catch {
    return null;
  }
}

async function methodSynthID_image(
  imageBytes: Buffer,
): Promise<"Detected" | "Not Detected" | "Possibly Detected" | null> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const region = process.env.GOOGLE_CLOUD_REGION || "us-central1";
  const accessToken = await getGCPAccessToken();
  if (!projectId || !accessToken) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const base64Image = imageBytes.toString("base64");
    const response = await fetch(
      `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/imageverification:predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          instances: [{ image: { bytesBase64Encoded: base64Image } }],
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) return null;
    const data = await response.json();
    const prediction = data.predictions?.[0];
    if (!prediction) return null;

    const verdict = prediction.decision as string | undefined;
    if (verdict === "ACCEPT") return "Detected";
    if (verdict === "REJECT") return "Not Detected";
    return "Possibly Detected";
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ──────────────────────────────────────────────
// Reality Defender — COMMENTED OUT (primary APIs only)
// ──────────────────────────────────────────────

// async function escalate_realityDefender(imageBytes: Buffer): Promise<{
//   is_deepfake: boolean;
//   confidence: number;
//   models_used: string[];
// } | null> {
//   const apiKey = process.env.REALITY_DEFENDER_API_KEY;
//   if (!apiKey) return null;
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 30000);
//   try {
//     const formData = new FormData();
//     formData.append(
//       "media",
//       new Blob([new Uint8Array(imageBytes)], { type: "image/jpeg" }),
//       "image.jpg",
//     );
//     const response = await fetch("https://api.realitydefender.com/v2/detect", {
//       method: "POST",
//       headers: { Authorization: `Bearer ${apiKey}` },
//       body: formData,
//       signal: controller.signal,
//     });
//     if (!response.ok) return null;
//     const data = await response.json();
//     return {
//       is_deepfake: data.is_deepfake ?? false,
//       confidence: data.confidence ?? 0,
//       models_used: data.models_used ?? [],
//     };
//   } catch { return null; }
//   finally { clearTimeout(timeoutId); }
// }

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
      edit_magnitude: precise(0.8 + compositeScore * 0.2),
    };
  }

  if (compositeScore > 0.45) {
    return {
      verdict: "heavy_edit",
      confidence: precise(0.55 + (compositeScore - 0.45) * 1.0),
      trust_score: precise(0.3 + (0.65 - compositeScore) * 1.0),
      edit_magnitude: precise(0.5 + (compositeScore - 0.45) * 1.5),
    };
  }

  if (compositeScore > 0.3) {
    return {
      verdict: "light_edit",
      confidence: precise(0.5 + (compositeScore - 0.3) * 0.7),
      trust_score: precise(0.5 + (0.45 - compositeScore) * 1.5),
      edit_magnitude: precise(0.2 + (compositeScore - 0.3) * 2.0),
    };
  }

  return {
    verdict: "human",
    confidence: precise(1 - compositeScore),
    trust_score: precise(0.8 + (0.3 - compositeScore) * 0.66),
    edit_magnitude: precise(compositeScore * 0.5),
  };
}

// ══════════════════════════════════════════════
// REAL IMAGE DETECTION — Cascading Pipeline (v5.0 — Primary APIs Only)
// Priority: SynthID Image (early exit) → SightEngine (early exit) → Error if both fail
// ══════════════════════════════════════════════

export async function realImageDetection(
  base64Image: string,
): Promise<DetectionResult> {
  try {
    // v5.0: Cascading pipeline — primary APIs only
    // Stage 1: SynthID Image → Stage 2: SightEngine → Error if both fail

    // Prepare image bytes (needed by all stages)
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const bytes = Buffer.from(raw, "base64");

    // ── Stage 1: SynthID Image (Google Imagen watermark detection) ──
    const synthidImageResult = await methodSynthID_image(bytes).catch(
      () => null,
    );

    if (synthidImageResult === "Detected") {
      // SynthID confirmed — high-confidence AI, no need for further analysis
      const freqScore = methodF_frequency(bytes);
      const metaScore = methodG_metadata(base64Image);
      const mapping = mapImageVerdict(0.95);
      return {
        verdict: mapping.verdict,
        confidence: mapping.confidence,
        primary_score: 0.95,
        secondary_score: precise(freqScore),
        model_used: "synthid-image:detected",
        ensemble_used: false,
        trust_score: mapping.trust_score,
        classification: mapping.verdict,
        edit_magnitude: mapping.edit_magnitude,
        method_scores: {
          synthid_image: {
            score: 1.0,
            weight: 1.0,
            label: "SynthID Image (Google)",
            available: true,
            status: "success",
          },
          sightengine: {
            score: 0,
            weight: 0.32,
            label: "SightEngine (98.3%)",
            available: false,
            status: "not_run",
          },
          frequency: {
            score: freqScore,
            weight: 0.18,
            label: "Frequency/DCT Analysis",
            available: true,
            status: "success",
          },
          metadata: {
            score: metaScore,
            weight: 0.13,
            label: "Metadata/EXIF/C2PA",
            available: true,
            status: "success",
          },
        },
      };
    }

    // ── Stage 2: SightEngine API (98.3% accuracy) ──
    const sightEngineScore = await methodS_sightEngine(bytes, mimeType).catch(
      () => null,
    );

    if (sightEngineScore !== null) {
      // SightEngine returned a result — use it as primary verdict
      const freqScore = methodF_frequency(bytes);
      const metaScore = methodG_metadata(base64Image);
      let compositeScore = sightEngineScore;
      const synthidAvail =
        synthidImageResult !== null && synthidImageResult !== undefined;
      const methodScores: Record<string, MethodScore> = {
        sightengine: {
          score: sightEngineScore,
          weight: 1.0,
          label: "SightEngine (98.3%)",
          available: true,
          status: "success",
        },
        synthid_image: {
          score: synthidAvail
            ? synthidImageResult === "Not Detected"
              ? 0.0
              : synthidImageResult === "Possibly Detected"
                ? 0.5
                : 0.5
            : 0,
          weight: 0.0,
          label: "SynthID Image (Google)",
          available: synthidAvail,
          status: synthidAvail ? "success" : "unavailable",
        },
        frequency: {
          score: freqScore,
          weight: 0.18,
          label: "Frequency/DCT Analysis",
          available: true,
          status: "success",
        },
        metadata: {
          score: metaScore,
          weight: 0.13,
          label: "Metadata/EXIF/C2PA",
          available: true,
          status: "success",
        },
      };
      const modelName =
        "sightengine" +
        (synthidImageResult ? "+synthid-image:" + synthidImageResult : "");

      // Reality Defender escalation — COMMENTED OUT (primary APIs only)

      const mapping = mapImageVerdict(compositeScore);
      return {
        verdict: mapping.verdict,
        confidence: mapping.confidence,
        primary_score: precise(sightEngineScore),
        secondary_score: precise(freqScore),
        model_used: modelName,
        ensemble_used: false,
        trust_score: mapping.trust_score,
        classification: mapping.verdict,
        edit_magnitude: mapping.edit_magnitude,
        method_scores: methodScores,
      };
    }

    // Stage 3: Local-only fallback (frequency + metadata analysis)
    // Used when both primary APIs are unavailable (quota/network issues)
    console.warn(
      "[Baloney] Primary APIs unavailable, using local-only fallback",
    );
    const freqScore = methodF_frequency(bytes);
    const metaScore = methodG_metadata(base64Image);
    const localScore = freqScore * 0.6 + metaScore * 0.4;
    const mapping = mapImageVerdict(localScore);
    return {
      verdict: mapping.verdict,
      confidence: mapping.confidence,
      primary_score: precise(localScore),
      secondary_score: precise(freqScore),
      model_used: "local-only:frequency+metadata",
      ensemble_used: false,
      primaryAvailable: false,
      confidenceCapped: true,
      trust_score: mapping.trust_score,
      classification: mapping.verdict,
      edit_magnitude: mapping.edit_magnitude,
      method_scores: {
        sightengine: {
          score: 0,
          weight: 0.32,
          label: "SightEngine (98.3%)",
          available: false,
          status: "unavailable",
          tier: "primary",
        },
        synthid_image: {
          score: 0,
          weight: 0.37,
          label: "SynthID Image (Google)",
          available: false,
          status: "unavailable",
          tier: "primary",
        },
        frequency: {
          score: freqScore,
          weight: 0.6,
          label: "Frequency/DCT Analysis",
          available: true,
          status: "success",
          tier: "fallback",
        },
        metadata: {
          score: metaScore,
          weight: 0.4,
          label: "Metadata/EXIF/C2PA",
          available: true,
          status: "success",
          tier: "fallback",
        },
      },
    };
  } catch (error) {
    console.error("[Baloney] Real image detection failed:", error);
    throw error;
  }
}

// ══════════════════════════════════════════════
// REAL VIDEO DETECTION — COMMENTED OUT (primary APIs only)
// Was: Multi-frame ensemble calling realImageDetection per-frame with skipExpensiveApis.
// Now video detection uses only SightEngine native video endpoint (in video/route.ts).
// ══════════════════════════════════════════════

// export async function realVideoDetection(
//   frameBase64s: string[],
// ): Promise<VideoDetectionResult> {
//   if (frameBase64s.length === 0) {
//     return {
//       verdict: "human", confidence: 0, frames_analyzed: 0,
//       frames_flagged_ai: 0, ai_frame_percentage: 0,
//       frame_scores: [], model_used: "none", duration_seconds: 0,
//     };
//   }
//   const startTime = Date.now();
//   const frameResults: DetectionResult[] = [];
//   const framesToAnalyze = frameBase64s.slice(0, 8);
//   for (const frameBase64 of framesToAnalyze) {
//     try {
//       const result = await realImageDetection(frameBase64);
//       frameResults.push(result);
//     } catch { /* Skip failed frames */ }
//   }
//   if (frameResults.length === 0) {
//     return {
//       verdict: "human", confidence: 0, frames_analyzed: 0,
//       frames_flagged_ai: 0, ai_frame_percentage: 0,
//       frame_scores: [], model_used: "multi-frame:none", duration_seconds: 0,
//     };
//   }
//   const frameScores = frameResults.map((r) => r.confidence);
//   const frameVerdicts = frameResults.map((r) => r.verdict);
//   const flaggedCount = frameVerdicts.filter(
//     (v) => v === "ai_generated" || v === "heavy_edit",
//   ).length;
//   const aiFramePercentage = flaggedCount / frameResults.length;
//   const scoreStdDev = standardDeviation(frameScores);
//   const avgScore = frameScores.reduce((a, b) => a + b, 0) / frameScores.length;
//   let temporalBonus = 0;
//   if (scoreStdDev < 0.08 && avgScore > 0.6) temporalBonus = 0.05;
//   else if (scoreStdDev > 0.25) temporalBonus = -0.05;
//   const finalScore = clamp(avgScore + temporalBonus, 0, 1);
//   let verdict: Verdict;
//   if (aiFramePercentage > 0.6 || finalScore > 0.65) verdict = "ai_generated";
//   else if (aiFramePercentage > 0.3 || finalScore > 0.45) verdict = "heavy_edit";
//   else if (aiFramePercentage > 0.1 || finalScore > 0.3) verdict = "light_edit";
//   else verdict = "human";
//   const duration = (Date.now() - startTime) / 1000;
//   const modelUsed = frameResults.length > 0
//     ? `multi-frame:${frameResults[0].model_used}` : "multi-frame:none";
//   return {
//     verdict, confidence: precise(finalScore),
//     frames_analyzed: frameResults.length, frames_flagged_ai: flaggedCount,
//     ai_frame_percentage: precise(aiFramePercentage),
//     frame_scores: frameScores.map((s) => precise(s)),
//     model_used: modelUsed, duration_seconds: precise(duration, 1),
//   };
// }
