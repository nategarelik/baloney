// Test data factories — create realistic test data with sensible defaults

import type {
  Verdict,
  DetectionResult,
  TextDetectionResult,
  ScanRecord,
  PersonalAnalytics,
  ExposureScore,
} from "@/lib/types";

let idCounter = 0;

export function createScanRecord(
  overrides: Partial<ScanRecord> = {},
): ScanRecord {
  idCounter++;
  return {
    id: `scan-${idCounter}`,
    timestamp: new Date().toISOString(),
    content_type: "text",
    platform: "manual_upload",
    verdict: "human",
    confidence: 0.85,
    model_used: "ensemble-v1",
    source_domain: null,
    content_category: "text_post",
    content_hash: null,
    scan_duration_ms: 350,
    trust_score: 0.85,
    edit_magnitude: 0.05,
    ...overrides,
  };
}

export function createDetectionResult(
  overrides: Partial<DetectionResult> = {},
): DetectionResult {
  return {
    verdict: "human" as Verdict,
    confidence: 0.85,
    primary_score: 0.15,
    secondary_score: 0.12,
    model_used: "ensemble-v1",
    ensemble_used: true,
    trust_score: 0.85,
    classification: "human" as Verdict,
    edit_magnitude: 0.05,
    ...overrides,
  };
}

export function createTextDetectionResult(
  overrides: Partial<TextDetectionResult> = {},
): TextDetectionResult {
  return {
    verdict: "human" as Verdict,
    confidence: 0.85,
    ai_probability: 0.15,
    model_used: "ensemble-v1",
    trust_score: 0.85,
    classification: "human" as Verdict,
    edit_magnitude: 0.05,
    text_stats: {
      word_count: 150,
      sentence_count: 10,
      avg_word_length: 5.2,
      avg_sentence_length: 15,
      lexical_diversity: 0.72,
    },
    caveat: null,
    feature_vector: {
      burstiness: 0.3,
      type_token_ratio: 0.72,
      perplexity: 45.5,
      repetition_score: 0.12,
    },
    sentence_scores: [],
    ...overrides,
  };
}

export function createExposureScore(
  overrides: Partial<ExposureScore> = {},
): ExposureScore {
  return {
    user_id: "test-user",
    score: 42,
    level: "Aware",
    scan_frequency: 3.5,
    platform_diversity: 4,
    streak_days: 7,
    total_ai_caught: 15,
    total_scans: 45,
    ...overrides,
  };
}

export function createPersonalAnalytics(
  overrides: Partial<PersonalAnalytics> = {},
): PersonalAnalytics {
  return {
    total_scans: 100,
    ai_exposure_rate: 0.32,
    by_platform: [
      { platform: "x", total: 40, ai_count: 12 },
      { platform: "instagram", total: 35, ai_count: 14 },
      { platform: "reddit", total: 25, ai_count: 6 },
    ],
    by_content_type: [
      { content_type: "text", total: 50, ai_count: 15 },
      { content_type: "image", total: 45, ai_count: 16 },
      { content_type: "video", total: 5, ai_count: 1 },
    ],
    by_verdict: [
      { verdict: "human", count: 68 },
      { verdict: "ai_generated", count: 20 },
      { verdict: "light_edit", count: 8 },
      { verdict: "heavy_edit", count: 4 },
    ],
    ...overrides,
  };
}
