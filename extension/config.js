// extension/config.js — Shared extension constants
// Synced from frontend/src/lib/detection-config.ts and frontend/src/lib/constants.ts
// Last synced: 2026-03-21
//
// IMPORTANT: This file uses a plain IIFE (no ES module syntax) because Chrome MV3
// content scripts cannot use ES module imports. The object is attached to globalThis
// so both content.js and sidepanel.js can read it without a bundler.
//
// When updating thresholds: edit frontend/src/lib/detection-config.ts first,
// then mirror the changed values here.

(function () {
  "use strict";

  // ── Verdict dot/bar colors ──────────────────────────────────────────────
  // Source: frontend/src/lib/constants.ts → VERDICT_COLORS (bg values)
  // and detection-config.ts → DETECTION_CONFIG.ui.dotColors
  var VERDICT_COLORS = {
    ai_generated: "#d4456b",
    heavy_edit: "#f97316",
    light_edit: "#f59e0b",
    human: "#16a34a",
    unavailable: "#94a3b8",
  };

  // ── Score color thresholds ──────────────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.ui.scoreColors
  var SCORE_COLORS = {
    high: "#d4456b",   // score > HIGH_THRESHOLD
    mid: "#f59e0b",    // score > MID_THRESHOLD
    low: "#16a34a",    // score <= MID_THRESHOLD
    HIGH_THRESHOLD: 0.65,
    MID_THRESHOLD: 0.35,
  };

  // ── Sentence-level coloring thresholds ─────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.ui.sentenceColoring
  var SENTENCE_COLORS = {
    high: "#d4456b",
    mid: "#f59e0b",
    low: "#16a34a",
    HIGH_THRESHOLD: 0.6,  // > 0.6 → red
    MID_THRESHOLD: 0.4,   // > 0.4 → amber
  };

  // ── Detection dot opacity ───────────────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.ui.dotColors
  var DOT_OPACITY = {
    BASE: 0.55,
    SCALE: 0.3,
    MAX: 0.85,
    VISIBILITY_THRESHOLD: 0.5,  // show dot if confidence >= this
  };

  // ── Detection dot color thresholds ─────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.ui.dotColors
  var DOT_COLOR_THRESHOLDS = {
    HIGH_CONFIDENCE: 0.8,  // >= 0.8 → red/pink
    MID_CONFIDENCE: 0.7,   // >= 0.7 → orange
    // below → amber
    HIGH_COLOR: "#d4456b",
    MID_COLOR: "#f97316",
    LOW_COLOR: "#f59e0b",
  };

  // ── Bayesian confidence floor ───────────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.bayesian.confidenceFloor
  var CONFIDENCE_FLOOR = 0.60;

  // ── Image verdict thresholds ────────────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.image.verdictThresholds
  var IMAGE_VERDICT_THRESHOLDS = {
    aiGenerated: 0.65,
    heavyEdit: 0.45,
    lightEdit: 0.3,
  };

  // ── Text feature interpretation thresholds ─────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.ui.featureThresholds
  var FEATURE_THRESHOLDS = {
    burstinessLow: 0.2,   // < 0.2 → "Very uniform" (AI signal)
    burstinessHigh: 0.5,  // > 0.5 → "Varied rhythm" (human signal)
    ttrLow: 0.4,          // < 0.4 → "Repetitive" (AI signal)
    ttrHigh: 0.7,         // > 0.7 → "Diverse" (human signal)
    perplexityLow: 80,    // < 80  → "Predictable" (AI signal)
    perplexityHigh: 150,  // > 150 → "Unpredictable" (human signal)
    repetitionHigh: 0.6,  // > 0.6 → "High repeat" (AI signal)
  };

  // ── Image reason thresholds ─────────────────────────────────────────────
  // Source: detection-config.ts — heuristic values used in reason generation
  var IMAGE_REASON_THRESHOLDS = {
    primaryScoreHigh: 0.7,   // primary_score > 0.7 → strong AI signature
    primaryScoreLow: 0.3,    // primary_score < 0.3 → authentic photography
    secondaryScoreHigh: 0.6, // secondary_score > 0.6 → smooth gradients
    secondaryScoreLow: 0.3,  // secondary_score < 0.3 → natural noise
    editMagnitudeHigh: 0.7,  // edit_magnitude > 0.7 → significant manipulation
    trustScoreHigh: 0.75,    // trust_score > 0.75 → high authenticity
  };

  // ── Video aggregation thresholds ────────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.image.verdictThresholds
  // (applied to multi-frame consensus logic)
  var VIDEO_AGGREGATION = {
    aiRatioHigh: 0.5,          // aiRatio > 0.5 OR avgConfidence > AI_CONF → ai_generated
    aiConfidenceHigh: 0.65,    // mirrors image.verdictThresholds.aiGenerated
    aiMinConfidence: 0.7,      // minimum confidence assigned when flagging as ai_generated
    heavyEditRatio: 0.2,       // aiRatio > 0.2 OR avgConfidence > HEAVY_CONF → heavy_edit
    heavyEditConfidence: 0.45, // mirrors image.verdictThresholds.heavyEdit
  };

  // ── Timeout values ──────────────────────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.timeouts (ms)
  var TIMEOUTS = {
    toastAutoDismiss: 12000,  // default auto-dismiss for result toasts
    toastMouseLeave: 3000,    // auto-dismiss after mouse leaves toast
    toastMinLength: 4000,     // auto-dismiss for min-length warning toast
    videoSeek: 3000,          // max wait for video.currentTime seek
    videoFallbackRetry: 2000, // timer fallback when video events already fired
    toast: 5000,              // context-menu image result toast lifetime
  };

  // ── Text scanning constants ─────────────────────────────────────────────
  // Source: detection-config.ts — heuristic minimums
  var TEXT_SCAN = {
    autoScanMinLength: 100, // chars — skip elements shorter than this
  };

  // ── Pangram segment opacity ─────────────────────────────────────────────
  // Source: detection-config.ts → DETECTION_CONFIG.ui.dotColors (opacity pattern)
  var PANGRAM = {
    opacityBase: 0.4,   // min opacity for pangram segments
    opacityScale: 0.6,  // + confidence * scale
  };

  // Attach to globalThis so plain scripts can read it without import
  globalThis.BALONEY_CONFIG = {
    VERDICT_COLORS: VERDICT_COLORS,
    SCORE_COLORS: SCORE_COLORS,
    SENTENCE_COLORS: SENTENCE_COLORS,
    DOT_OPACITY: DOT_OPACITY,
    DOT_COLOR_THRESHOLDS: DOT_COLOR_THRESHOLDS,
    CONFIDENCE_FLOOR: CONFIDENCE_FLOOR,
    IMAGE_VERDICT_THRESHOLDS: IMAGE_VERDICT_THRESHOLDS,
    FEATURE_THRESHOLDS: FEATURE_THRESHOLDS,
    IMAGE_REASON_THRESHOLDS: IMAGE_REASON_THRESHOLDS,
    VIDEO_AGGREGATION: VIDEO_AGGREGATION,
    TIMEOUTS: TIMEOUTS,
    TEXT_SCAN: TEXT_SCAN,
    PANGRAM: PANGRAM,
  };
})();
