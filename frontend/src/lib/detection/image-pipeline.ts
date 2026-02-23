// frontend/src/lib/detection/image-pipeline.ts — Image detection cascading pipeline (v5.0)

import type { DetectionResult, MethodScore } from "@/lib/types";
import { DETECTION_CONFIG } from "@/lib/detection-config";
import { logger } from "@/lib/logger";
import { precise } from "./helpers";
import { mapImageVerdict } from "./verdict";
import { methodF_frequency, methodG_metadata } from "./image-analysis";
import { getProImageMethods } from "./pro-loader";

export async function realImageDetection(
  base64Image: string,
): Promise<DetectionResult> {
  try {
    // Prepare image bytes (needed by all stages)
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const bytes = Buffer.from(raw, "base64");

    const pro = await getProImageMethods();

    // Stage 1: SynthID Image (Google Imagen watermark detection)
    const synthidImageResult = pro ? await pro.methodSynthID_image(bytes).catch(() => null) : null;

    if (synthidImageResult === "Detected") {
      const freqScore = methodF_frequency(bytes);
      const metaScore = methodG_metadata(base64Image);
      const mapping = mapImageVerdict(DETECTION_CONFIG.image.synthidOverride);
      return {
        verdict: mapping.verdict,
        confidence: mapping.confidence,
        primary_score: DETECTION_CONFIG.image.synthidOverride,
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
            label: DETECTION_CONFIG.display.imageMethods.synthidImage.label,
            available: true,
            status: "success",
          },
          sightengine: {
            score: 0,
            weight: DETECTION_CONFIG.display.imageMethods.sightengine.weight,
            label: DETECTION_CONFIG.display.imageMethods.sightengine.label,
            available: false,
            status: "not_run",
          },
          frequency: {
            score: freqScore,
            weight: DETECTION_CONFIG.display.imageMethods.frequency.weight,
            label: DETECTION_CONFIG.display.imageMethods.frequency.label,
            available: true,
            status: "success",
          },
          metadata: {
            score: metaScore,
            weight: DETECTION_CONFIG.display.imageMethods.metadata.weight,
            label: DETECTION_CONFIG.display.imageMethods.metadata.label,
            available: true,
            status: "success",
          },
        },
      };
    }

    // Stage 2: SightEngine API (98.3% accuracy)
    const sightEngineScore = pro ? await pro.methodS_sightEngine(bytes, mimeType).catch(() => null) : null;

    if (sightEngineScore !== null) {
      const freqScore = methodF_frequency(bytes);
      const metaScore = methodG_metadata(base64Image);
      const compositeScore = sightEngineScore;
      const synthidAvail =
        synthidImageResult !== null && synthidImageResult !== undefined;
      const methodScores: Record<string, MethodScore> = {
        sightengine: {
          score: sightEngineScore,
          weight: 1.0,
          label: DETECTION_CONFIG.display.imageMethods.sightengine.label,
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
          label: DETECTION_CONFIG.display.imageMethods.synthidImage.label,
          available: synthidAvail,
          status: synthidAvail ? "success" : "unavailable",
        },
        frequency: {
          score: freqScore,
          weight: DETECTION_CONFIG.display.imageMethods.frequency.weight,
          label: DETECTION_CONFIG.display.imageMethods.frequency.label,
          available: true,
          status: "success",
        },
        metadata: {
          score: metaScore,
          weight: DETECTION_CONFIG.display.imageMethods.metadata.weight,
          label: DETECTION_CONFIG.display.imageMethods.metadata.label,
          available: true,
          status: "success",
        },
      };
      const modelName =
        "sightengine" +
        (synthidImageResult ? "+synthid-image:" + synthidImageResult : "");

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
    logger.warn("image-pipeline", "Primary APIs unavailable, using local-only fallback");
    const freqScore = methodF_frequency(bytes);
    const metaScore = methodG_metadata(base64Image);
    const localScore =
      freqScore * DETECTION_CONFIG.image.localFallbackWeights.frequency +
      metaScore * DETECTION_CONFIG.image.localFallbackWeights.metadata;
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
          weight: DETECTION_CONFIG.display.imageMethods.sightengine.weight,
          label: DETECTION_CONFIG.display.imageMethods.sightengine.label,
          available: false,
          status: "unavailable",
          tier: "primary",
        },
        synthid_image: {
          score: 0,
          weight: 0.37,
          label: DETECTION_CONFIG.display.imageMethods.synthidImage.label,
          available: false,
          status: "unavailable",
          tier: "primary",
        },
        frequency: {
          score: freqScore,
          weight: DETECTION_CONFIG.image.localFallbackWeights.frequency,
          label: DETECTION_CONFIG.display.imageMethods.frequency.label,
          available: true,
          status: "success",
          tier: "fallback",
        },
        metadata: {
          score: metaScore,
          weight: DETECTION_CONFIG.image.localFallbackWeights.metadata,
          label: DETECTION_CONFIG.display.imageMethods.metadata.label,
          available: true,
          status: "success",
          tier: "fallback",
        },
      },
    };
  } catch (error) {
    logger.error("image-pipeline", "Real image detection failed", error);
    throw error;
  }
}
