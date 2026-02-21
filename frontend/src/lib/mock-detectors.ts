// frontend/src/lib/mock-detectors.ts — TypeScript port of backend/app/analyzers/mock_detector.py

import type {
  DetectionResult,
  TextDetectionResult,
  TextStats,
  VideoDetectionResult,
  Verdict,
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
  const roll = Math.random();
  let verdict: Verdict;
  let confidence: number;

  if (roll < 0.35) {
    // ~35% AI
    verdict = "ai_generated";
    confidence = randFloat(0.78, 0.96);
  } else if (roll < 0.9) {
    // ~55% human
    verdict = "likely_human";
    confidence = randFloat(0.8, 0.97);
  } else {
    // ~10% inconclusive
    verdict = "inconclusive";
    confidence = randFloat(0.42, 0.62);
  }

  return {
    verdict,
    confidence,
    primary_score: confidence,
    secondary_score: randFloat(confidence * 0.85, confidence * 1.0),
    model_used: "mock:Organika/sdxl-detector",
    ensemble_used: false,
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

export function mockTextResult(text: string): TextDetectionResult {
  const textStats = computeTextStats(text);

  if (text.length < 50) {
    return {
      verdict: "inconclusive",
      confidence: 0.0,
      ai_probability: 0.5,
      model_used: "mock:Hello-SimpleAI/chatgpt-detector-roberta",
      text_stats: textStats,
      caveat:
        "Text too short for reliable detection (minimum 50 characters recommended).",
    };
  }

  const roll = Math.random();
  let verdict: Verdict;
  let aiProbability: number;
  let confidence: number;
  let caveat: string;

  if (roll < 0.3) {
    // ~30% AI
    verdict = "ai_generated";
    aiProbability = randFloat(0.75, 0.95);
    confidence = aiProbability;
    caveat =
      "Text detection is experimental. This result indicates patterns consistent with AI-generated text, but should not be considered definitive.";
  } else if (roll < 0.85) {
    // ~55% human
    verdict = "likely_human";
    aiProbability = randFloat(0.05, 0.35);
    confidence = parseFloat((1 - aiProbability).toFixed(4));
    caveat =
      "Text appears human-written, but AI text detection has known limitations. Heavily edited AI text may appear human.";
  } else {
    // ~15% inconclusive
    verdict = "inconclusive";
    aiProbability = randFloat(0.35, 0.75);
    confidence = randFloat(0.42, 0.62);
    caveat =
      "Text detection confidence is low. The text may contain a mix of human and AI-generated content.";
  }

  return {
    verdict,
    confidence,
    ai_probability: aiProbability,
    model_used: "mock:Hello-SimpleAI/chatgpt-detector-roberta",
    text_stats: textStats,
    caveat,
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

  if (roll < 0.3) {
    // ~30% AI
    frameScores = Array.from({ length: numFrames }, () =>
      randFloat(0.7, 0.98)
    );
    verdict = "ai_generated";
  } else if (roll < 0.8) {
    // ~50% human
    frameScores = Array.from({ length: numFrames }, () =>
      randFloat(0.02, 0.35)
    );
    verdict = "likely_human";
  } else {
    // ~20% inconclusive
    frameScores = Array.from({ length: numFrames }, () =>
      randFloat(0.3, 0.75)
    );
    verdict = "inconclusive";
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
