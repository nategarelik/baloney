// frontend/src/lib/mock-detectors.ts — TypeScript port of backend/app/analyzers/mock_detector.py

import type {
  DetectionResult,
  TextDetectionResult,
  TextStats,
  VideoDetectionResult,
  Verdict,
  SentenceScore,
  FeatureVector,
} from "./types";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function randFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ──────────────────────────────────────────────
// Image Detection
// ──────────────────────────────────────────────

export function mockImageResult(
  platform: string = "manual_upload"
): DetectionResult {
  void platform;
  const roll = Math.random();
  let verdict: Verdict;
  let confidence: number;
  let trustScore: number;
  let editMagnitude: number;

  if (roll < 0.30) {
    // ~30% fully AI generated
    verdict = "ai_generated";
    confidence = randFloat(0.78, 0.96);
    trustScore = randFloat(0.05, 0.25);
    editMagnitude = randFloat(0.80, 1.0);
  } else if (roll < 0.40) {
    // ~10% heavy AI editing
    verdict = "heavy_edit";
    confidence = randFloat(0.60, 0.80);
    trustScore = randFloat(0.25, 0.45);
    editMagnitude = randFloat(0.55, 0.80);
  } else if (roll < 0.55) {
    // ~15% light editing
    verdict = "light_edit";
    confidence = randFloat(0.50, 0.70);
    trustScore = randFloat(0.45, 0.65);
    editMagnitude = randFloat(0.20, 0.55);
  } else {
    // ~45% human
    verdict = "human";
    confidence = randFloat(0.80, 0.97);
    trustScore = randFloat(0.75, 0.98);
    editMagnitude = randFloat(0.0, 0.20);
  }

  return {
    verdict,
    confidence,
    primary_score: confidence,
    secondary_score: randFloat(confidence * 0.85, confidence * 1.0),
    model_used: "mock:Organika/sdxl-detector",
    ensemble_used: false,
    trust_score: trustScore,
    classification: verdict,
    edit_magnitude: editMagnitude,
  };
}

// ──────────────────────────────────────────────
// Text Detection
// ──────────────────────────────────────────────

export function computeTextStats(text: string): TextStats {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text
    .replace(/!/g, ".")
    .replace(/\?/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[.,!?;:"'()]/g, ""))
  );

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgWordLength =
    wordCount > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / wordCount
      : 0;

  return {
    word_count: wordCount,
    sentence_count: sentenceCount,
    lexical_diversity: parseFloat(lexicalDiversity.toFixed(4)),
    avg_sentence_length: parseFloat(avgSentenceLength.toFixed(1)),
    avg_word_length: parseFloat(avgWordLength.toFixed(1)),
  };
}

function computeFeatureVector(text: string, textStats: TextStats): FeatureVector {
  // Burstiness: variance in sentence lengths normalized to 0-1
  const sentences = text
    .replace(/[!?]/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentLengths = sentences.map((s) => s.split(/\s+/).length);
  const meanLen = sentLengths.reduce((a, b) => a + b, 0) / (sentLengths.length || 1);
  const variance = sentLengths.reduce((a, b) => a + Math.pow(b - meanLen, 2), 0) / (sentLengths.length || 1);
  const burstiness = parseFloat(Math.min(variance / 100, 1).toFixed(4));

  // Type-token ratio (already computed as lexical_diversity)
  const typeTokenRatio = textStats.lexical_diversity;

  // Mock perplexity: lower TTR = more repetitive = lower perplexity (more AI-like)
  const perplexity = parseFloat((50 + (1 - typeTokenRatio) * 150 + Math.random() * 50).toFixed(2));

  // Repetition score: inverse of lexical diversity, normalized
  const repetitionScore = parseFloat((1 - typeTokenRatio + randFloat(-0.05, 0.05)).toFixed(4));

  return {
    burstiness,
    type_token_ratio: typeTokenRatio,
    perplexity,
    repetition_score: Math.max(0, Math.min(1, repetitionScore)),
  };
}

function scoreSentences(text: string, baseAiProb: number): SentenceScore[] {
  const sentences = text
    .replace(/([!?])/g, "$1|")
    .split(/[.|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  let cursor = 0;
  return sentences.map((sentence) => {
    const startIndex = text.indexOf(sentence, cursor);
    const endIndex = startIndex + sentence.length;
    cursor = endIndex;

    // Add per-sentence noise around base probability
    const noise = randFloat(-0.25, 0.25);
    const aiProbability = parseFloat(
      Math.max(0, Math.min(1, baseAiProb + noise)).toFixed(4)
    );

    return { text: sentence, ai_probability: aiProbability, start_index: startIndex, end_index: endIndex };
  });
}

export function mockTextResult(text: string): TextDetectionResult {
  const textStats = computeTextStats(text);

  if (text.length < 50) {
    const featureVector = computeFeatureVector(text, textStats);
    return {
      verdict: "light_edit",
      confidence: 0.0,
      ai_probability: 0.5,
      model_used: "mock:Hello-SimpleAI/chatgpt-detector-roberta",
      text_stats: textStats,
      caveat: "Text too short for reliable detection (minimum 50 characters recommended).",
      trust_score: 0.5,
      classification: "light_edit",
      edit_magnitude: 0.0,
      feature_vector: featureVector,
      sentence_scores: [],
    };
  }

  const roll = Math.random();
  let verdict: Verdict;
  let aiProbability: number;
  let confidence: number;
  let caveat: string;
  let trustScore: number;
  let editMagnitude: number;

  if (roll < 0.30) {
    // ~30% AI generated
    verdict = "ai_generated";
    aiProbability = randFloat(0.75, 0.95);
    confidence = aiProbability;
    trustScore = randFloat(0.05, 0.25);
    editMagnitude = randFloat(0.80, 1.0);
    caveat = "Text detection is experimental. Patterns consistent with AI-generated text detected, but should not be considered definitive.";
  } else if (roll < 0.45) {
    // ~15% heavy edit
    verdict = "heavy_edit";
    aiProbability = randFloat(0.55, 0.75);
    confidence = randFloat(0.60, 0.80);
    trustScore = randFloat(0.25, 0.45);
    editMagnitude = randFloat(0.55, 0.80);
    caveat = "Significant AI-assisted editing detected. Content appears substantially modified by AI tools.";
  } else if (roll < 0.60) {
    // ~15% light edit
    verdict = "light_edit";
    aiProbability = randFloat(0.30, 0.55);
    confidence = randFloat(0.50, 0.70);
    trustScore = randFloat(0.45, 0.65);
    editMagnitude = randFloat(0.20, 0.55);
    caveat = "Minor AI assistance likely. Content appears primarily human-written with some AI refinement.";
  } else {
    // ~40% human
    verdict = "human";
    aiProbability = randFloat(0.05, 0.30);
    confidence = parseFloat((1 - aiProbability).toFixed(4));
    trustScore = randFloat(0.75, 0.98);
    editMagnitude = randFloat(0.0, 0.20);
    caveat = "Text appears human-written, but AI text detection has known limitations. Heavily edited AI text may appear human.";
  }

  const featureVector = computeFeatureVector(text, textStats);
  const sentenceScores = scoreSentences(text, aiProbability);

  return {
    verdict,
    confidence,
    ai_probability: aiProbability,
    model_used: "mock:Hello-SimpleAI/chatgpt-detector-roberta",
    text_stats: textStats,
    caveat,
    trust_score: trustScore,
    classification: verdict,
    edit_magnitude: editMagnitude,
    feature_vector: featureVector,
    sentence_scores: sentenceScores,
  };
}

// ──────────────────────────────────────────────
// Video Detection
// ──────────────────────────────────────────────

export function mockVideoResult(): VideoDetectionResult {
  const numFrames = randInt(8, 25);
  const roll = Math.random();
  let frameScores: number[];
  let verdict: Verdict;

  if (roll < 0.30) {
    // ~30% AI
    frameScores = Array.from({ length: numFrames }, () =>
      randFloat(0.7, 0.98)
    );
    verdict = "ai_generated";
  } else if (roll < 0.40) {
    // ~10% heavy edit
    frameScores = Array.from({ length: numFrames }, () =>
      randFloat(0.5, 0.75)
    );
    verdict = "heavy_edit";
  } else if (roll < 0.55) {
    // ~15% light edit
    frameScores = Array.from({ length: numFrames }, () =>
      randFloat(0.3, 0.55)
    );
    verdict = "light_edit";
  } else {
    // ~45% human
    frameScores = Array.from({ length: numFrames }, () =>
      randFloat(0.02, 0.30)
    );
    verdict = "human";
  }

  const aiFlaggedFrames = frameScores.filter((s) => s >= 0.6).length;
  const avgConfidence =
    frameScores.reduce((sum, s) => sum + s, 0) / frameScores.length;

  return {
    verdict,
    confidence: parseFloat(avgConfidence.toFixed(4)),
    frames_analyzed: numFrames,
    frames_flagged_ai: aiFlaggedFrames,
    ai_frame_percentage: parseFloat((aiFlaggedFrames / numFrames).toFixed(4)),
    frame_scores: frameScores,
    model_used: "mock:per-frame:Organika/sdxl-detector",
    duration_seconds: parseFloat((numFrames * 1.0).toFixed(1)),
  };
}
