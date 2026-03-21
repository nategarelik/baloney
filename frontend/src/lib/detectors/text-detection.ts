// Real text detection pipeline (v5.0 — Primary APIs Only)
// Priority: SynthID (early exit) → Pangram (99.85%) → Statistical fallback

import type {
  TextDetectionResult,
  SentenceScore,
  MethodScore,
} from "../types";
import { computeTextStats } from "../mock-detectors";
import { DETECTION_CONFIG } from "../detection-config";
import { clamp, precise, splitSentences } from "./detection-utils";
import { mapVerdict } from "./verdict-mapper";
import {
  methodD_statistical,
  buildFeatureVector,
  AI_TRANSITION_PHRASES,
} from "./statistical-analysis";

// ──────────────────────────────────────────────
// Pangram types
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

// ──────────────────────────────────────────────
// METHOD P: Pangram Commercial API (99.85% accuracy)
// Emi & Spero, 2024 — arXiv:2402.14873v3
// ──────────────────────────────────────────────

async function methodP_pangram(text: string): Promise<PangramResult | null> {
  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DETECTION_CONFIG.timeouts.pangram,
  );

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

// ──────────────────────────────────────────────
// METHOD SynthID: Google SynthID Text Watermark Detection
// Detects Gemini-generated text watermarks via Railway Python backend
// ──────────────────────────────────────────────

async function methodSynthID_text(
  text: string,
): Promise<"watermarked" | "not_watermarked" | "uncertain" | null> {
  const backendUrl = process.env.RAILWAY_BACKEND_URL;
  if (!backendUrl) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DETECTION_CONFIG.timeouts.synthidText,
  );

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
// Sentence scoring (v2.0 — multi-feature per-sentence analysis)
// ──────────────────────────────────────────────

function scoreSentencesReal(
  text: string,
  aiProbability: number,
): SentenceScore[] {
  const SA = DETECTION_CONFIG.text.sentenceAdjustments;

  const sentences = splitSentences(text).filter((s) => s.length > 10);
  const wordCounts = sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length,
  );
  const avgLen =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;

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
    if (deviation <= SA.uniformThreshold) {
      prob += SA.uniformBoost;
    } else if (deviation > SA.variableThreshold) {
      prob -= SA.variableReduction;
    } else {
      prob -= SA.moderateReduction;
    }

    // v2.0 Feature 2: Word length in sentence
    const wordLenDev =
      overallAvgWordLen > 0
        ? Math.abs(sentenceAvgWordLens[i] - overallAvgWordLen) /
          overallAvgWordLen
        : 0;
    if (wordLenDev <= SA.wordLenUniformThreshold) {
      prob += SA.wordLenUniformBoost;
    } else if (wordLenDev > SA.wordLenVariableThreshold) {
      prob -= SA.wordLenVariableReduction;
    }

    // v2.0 Feature 3: Transition word at sentence start
    const lowerSent = sentence.toLowerCase().trim();
    const startsWithTransition = AI_TRANSITION_PHRASES.some((p) =>
      lowerSent.startsWith(p),
    );
    if (startsWithTransition) {
      prob += SA.transitionStartBoost;
    }

    // v2.0 Feature 4: Comma density in sentence
    const commas = (sentence.match(/,/g) || []).length;
    if (sentLen > 0 && commas / sentLen > SA.commaHighDensityThreshold) {
      prob += SA.commaHighDensityBoost;
    }

    return {
      text: sentence,
      ai_probability: precise(clamp(prob, 0, 1)),
      start_index: startIndex,
      end_index: endIndex,
    };
  });
}

// ══════════════════════════════════════════════
// REAL TEXT DETECTION — Cascading Pipeline (v5.0 — Primary APIs Only)
// Priority: SynthID (early exit) → Pangram (early exit) → Statistical fallback
// ══════════════════════════════════════════════

export async function realTextDetection(
  text: string,
): Promise<TextDetectionResult> {
  try {
    const textStats = computeTextStats(text);

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

    // ── Stage 1: SynthID Text (Google Gemini watermark detection) ──
    const synthidResult = await methodSynthID_text(text).catch(() => null);

    if (synthidResult === "watermarked") {
      const stats = methodD_statistical(text, textStats);
      const featureVector = buildFeatureVector(stats);
      const mapping = mapVerdict(
        DETECTION_CONFIG.text.synthidOverride,
        text.length,
      );
      return {
        verdict: mapping.verdict,
        confidence: mapping.confidence,
        ai_probability: DETECTION_CONFIG.text.synthidOverride,
        model_used: "synthid:watermarked",
        text_stats: textStats,
        caveat:
          "Google SynthID watermark detected — this text was generated by a Google Gemini model.",
        trust_score: mapping.trust_score,
        classification: mapping.verdict,
        edit_magnitude: mapping.edit_magnitude,
        feature_vector: featureVector,
        sentence_scores: scoreSentencesReal(
          text,
          DETECTION_CONFIG.text.synthidOverride,
        ),
        method_scores: {
          pangram: {
            score: 0,
            weight: DETECTION_CONFIG.display.textMethods.pangram.weight,
            label: DETECTION_CONFIG.display.textMethods.pangram.label,
            available: false,
            status: "not_run",
          },
          synthid_text: {
            score: 1.0,
            weight: 1.0,
            label: DETECTION_CONFIG.display.textMethods.synthidText.label,
            available: true,
            status: "success",
          },
          statistical: {
            score: stats.signal,
            weight: DETECTION_CONFIG.display.textMethods.statistical.weight,
            label: DETECTION_CONFIG.display.textMethods.statistical.label,
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
      const stats = methodD_statistical(text, textStats);
      const featureVector = buildFeatureVector(stats);

      let aiProbability = pangramResult.score;

      // Short text confidence scaling
      if (text.length < DETECTION_CONFIG.text.shortTextScalingThreshold) {
        const lengthPenalty =
          text.length / DETECTION_CONFIG.text.shortTextScalingThreshold;
        aiProbability = precise(0.5 + (aiProbability - 0.5) * lengthPenalty);
      }

      const mapping = mapVerdict(aiProbability, text.length);

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
          label: DETECTION_CONFIG.display.textMethods.pangram.label,
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
          label: DETECTION_CONFIG.display.textMethods.synthidText.label,
          available: synthidAvailable,
          status: synthidAvailable ? "success" : "unavailable",
        },
        statistical: {
          score: stats.signal,
          weight: DETECTION_CONFIG.display.textMethods.statistical.weight,
          label: DETECTION_CONFIG.display.textMethods.statistical.label,
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

    // Stage 3: Statistical-only fallback when both primary APIs are unavailable
    console.warn(
      "[Baloney] Primary text APIs unavailable, using statistical fallback",
    );
    const statsSignal = methodD_statistical(text, textStats);
    const featureVector = buildFeatureVector(statsSignal);
    const statMapping = mapVerdict(statsSignal.signal, text.length);

    return {
      verdict: statMapping.verdict,
      confidence: statMapping.confidence,
      ai_probability: statsSignal.signal,
      model_used: "statistical-only:12-features",
      text_stats: textStats,
      caveat:
        "Primary APIs unavailable. Result based on statistical analysis only — lower confidence.",
      trust_score: statMapping.trust_score,
      classification: statMapping.verdict,
      edit_magnitude: statMapping.edit_magnitude,
      feature_vector: featureVector,
      sentence_scores: [],
      method_scores: {
        pangram: {
          score: 0,
          weight: 0.5,
          label: DETECTION_CONFIG.display.textMethods.pangram.label,
          available: false,
          status: "unavailable",
          tier: "primary" as const,
        },
        synthid_text: {
          score: 0,
          weight: 0.3,
          label: "SynthID Text (Google)",
          available: false,
          status: "unavailable",
          tier: "watermark" as const,
        },
        statistical: {
          score: statsSignal.signal,
          weight: 1.0,
          label: "Statistical Analysis (12 features)",
          available: true,
          status: "success",
          tier: "fallback" as const,
        },
      },
      synthid_text_result: null,
    };
  } catch (error) {
    console.error("[Baloney] Real text detection failed:", error);
    throw error;
  }
}
