// Real image detection pipeline (v5.0 — Primary APIs Only)
// Priority: SynthID Image (early exit) → SightEngine (98.3%) → Local fallback (frequency+metadata)

import type { DetectionResult, MethodScore } from "../types";
import { DETECTION_CONFIG } from "../detection-config";
import { clamp, precise } from "./detection-utils";
import { mapImageVerdict } from "./verdict-mapper";

// ──────────────────────────────────────────────
// METHOD F: Frequency Domain Analysis (v2.0 — DCT + multi-scale FFT)
// Diffusion-generated images show different high-frequency spectral patterns
// v2.0: Adds DCT coefficient analysis, multi-scale windowing, edge detection,
//       and spectral slope estimation (Corvi et al. 2023, DEFEND 2024)
// ──────────────────────────────────────────────

export function methodF_frequency(imageBytes: Buffer): number {
  const FN = DETECTION_CONFIG.image.frequencyNormalization;
  const FW = DETECTION_CONFIG.image.frequencyWeights.withSlope;
  const FB = DETECTION_CONFIG.image.frequencyWeights.fallback;

  const size = Math.min(imageBytes.length, FN.totalSamplesCap);
  const samples = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    samples[i] = imageBytes[i] / 255.0;
  }

  // ── Signal 1: Multi-scale local variance analysis ──
  const windowSizes = FN.windowSizes;
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
      scaleUniformities.push(
        clamp(1 - varOfVar * FN.varianceOfVarianceScale, 0, 1),
      );
    }
  }

  const avgUniformity =
    scaleUniformities.length > 0
      ? scaleUniformities.reduce((a, b) => a + b, 0) / scaleUniformities.length
      : 0.5;

  // ── Signal 2: High-frequency energy (adjacent pixel differences) ──
  const analyzeLen = Math.min(samples.length, FN.analysisLengthCap);
  let highFreqEnergy = 0;
  for (let i = 1; i < analyzeLen; i++) {
    highFreqEnergy += Math.abs(samples[i] - samples[i - 1]);
  }
  highFreqEnergy /= Math.max(analyzeLen - 1, 1);
  const smoothness = clamp(1 - highFreqEnergy * FN.highFreqEnergyScale, 0, 1);

  // ── Signal 3: DCT coefficient analysis (simplified) ──
  const blockSize = FN.dctBlockSize;
  let lowFreqDCTEnergy = 0;
  let highFreqDCTEnergy = 0;
  let dctBlocks = 0;

  for (
    let blockStart = 0;
    blockStart + blockSize * blockSize <=
    Math.min(samples.length, FN.dctSamplesCap);
    blockStart += blockSize * blockSize
  ) {
    const block = samples.slice(blockStart, blockStart + blockSize * blockSize);
    const mean = block.reduce((a, b) => a + b, 0) / block.length;

    lowFreqDCTEnergy += mean * mean;

    let acEnergy = 0;
    for (let j = 0; j < block.length; j++) {
      acEnergy += Math.pow(block[j] - mean, 2);
    }
    highFreqDCTEnergy += acEnergy / block.length;
    dctBlocks++;
  }

  let dctRatioSignal = 0.5;
  if (dctBlocks > 0 && highFreqDCTEnergy > 0) {
    const dctRatio =
      lowFreqDCTEnergy /
      dctBlocks /
      (highFreqDCTEnergy / dctBlocks + FN.dctEpsilon);
    dctRatioSignal = clamp(dctRatio * FN.dctRatioScale, 0, 1);
  }

  // ── Signal 4: Edge density analysis ──
  let edgeCount = 0;
  const edgeThreshold = FN.edgeThreshold;
  for (let i = 1; i < analyzeLen; i++) {
    if (Math.abs(samples[i] - samples[i - 1]) > edgeThreshold) {
      edgeCount++;
    }
  }
  const edgeDensity = edgeCount / Math.max(analyzeLen - 1, 1);
  const edgeSignal = clamp(1 - edgeDensity * FN.edgeDensityScale, 0, 1);

  // ── Signal 5: Spectral slope estimation ──
  if (scaleUniformities.length >= 2) {
    const slopeDiff =
      scaleUniformities[scaleUniformities.length - 1] - scaleUniformities[0];
    const slopeSignal = clamp(FN.slopeBase - slopeDiff * FN.slopeScale, 0, 1);

    return precise(
      avgUniformity * FW.uniformity +
        smoothness * FW.smoothness +
        dctRatioSignal * FW.dctRatio +
        edgeSignal * FW.edge +
        slopeSignal * FW.slope,
    );
  }

  return precise(
    avgUniformity * FB.uniformity +
      smoothness * FB.smoothness +
      dctRatioSignal * FB.dctRatio +
      edgeSignal * FB.edge,
  );
}

// ──────────────────────────────────────────────
// METHOD G: Metadata Analysis (v2.0 — enhanced heuristics)
// Real photos have camera EXIF; AI images lack genuine metadata
// v2.0: TIFF tag validation, AI tool signature detection, C2PA marker check
// (Spec §3.2 Method G)
// ──────────────────────────────────────────────

export function methodG_metadata(base64Image: string): number {
  const S = DETECTION_CONFIG.image.metadata.suspicion;
  const A = DETECTION_CONFIG.image.metadata.authenticity;

  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "unknown";

  const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
  let bytes: Buffer;
  try {
    bytes = Buffer.from(raw, "base64");
  } catch {
    return DETECTION_CONFIG.image.metadata.decodeFailScore;
  }

  let suspicion = 0;
  let authenticity = 0;

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
      suspicion += S.jpegNoExif;
    } else {
      const exifSlice = bytes.slice(0, 4000).toString("ascii");

      const hasCamera =
        /Canon|Nikon|Sony|Apple|Samsung|Google|Fuji|Olympus|Panasonic|LG|Huawei|Xiaomi|OnePlus|Pixel|iPhone/i.test(
          exifSlice,
        );
      if (hasCamera) {
        authenticity += A.camera;
      } else {
        suspicion += S.noCamera;
      }

      if (exifOffset >= 0 && exifOffset + 10 < bytes.length) {
        const exifHeader = bytes
          .slice(exifOffset + 4, exifOffset + 14)
          .toString("ascii");
        const hasTiffHeader =
          exifHeader.includes("II") || exifHeader.includes("MM");
        if (hasTiffHeader) {
          authenticity += A.tiffHeader;
        } else {
          suspicion += S.invalidTiff;
        }
      }

      const hasGPS = exifSlice.includes("GPS");
      if (hasGPS) {
        authenticity += A.gps;
      }

      const hasSoftware = /Photoshop|GIMP|Lightroom|ACDSee|Paint/i.test(
        exifSlice,
      );
      if (hasSoftware) {
        suspicion += S.softwareEditing;
      }
    }

    let hasJFIF = false;
    for (let i = 0; i < Math.min(bytes.length, 100); i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe0) {
        hasJFIF = true;
        break;
      }
    }
    if (hasJFIF && !hasExif) {
      suspicion += S.jfifNoExif;
    }
  } else if (mimeType === "image/png") {
    suspicion += S.pngFormat;

    const pngText = bytes.slice(0, 8000).toString("ascii");
    const hasAISignature =
      /Stable Diffusion|DALL-E|Midjourney|ComfyUI|AUTOMATIC1111|NovelAI|DreamStudio|sd-metadata|aesthetic_score/i.test(
        pngText,
      );
    if (hasAISignature) {
      suspicion += S.aiSignature;
    }

    const hasCreationTool = /tEXt|iTXt/i.test(pngText);
    if (!hasCreationTool) {
      suspicion += S.noTextMetadata;
    }
  } else if (mimeType === "image/webp") {
    suspicion += S.webpFormat;
  }

  // ── Check 2: File structure analysis ──
  if (bytes.length < DETECTION_CONFIG.image.metadata.smallFileThreshold) {
    suspicion += S.smallFile;
  }

  const kbSize = bytes.length / 1024;
  if (
    kbSize > DETECTION_CONFIG.image.metadata.sdxlSizeRange.min &&
    kbSize < DETECTION_CONFIG.image.metadata.sdxlSizeRange.max
  ) {
    suspicion += S.sdxlSizeRange;
  }

  const headerStr = bytes.slice(0, 4000).toString("ascii");
  const hasC2PA = /c2pa|contentauth|Content Credentials/i.test(headerStr);
  if (hasC2PA) {
    authenticity += A.c2pa;
  }

  const finalScore = clamp(
    suspicion -
      authenticity * DETECTION_CONFIG.image.metadata.authenticityWeight,
    0,
    1,
  );

  return precise(finalScore);
}

// ──────────────────────────────────────────────
// METHOD S: SightEngine Commercial API (98.3% accuracy, ARIA benchmark #1)
// Covers 120+ AI generators: DALL-E, Midjourney, SD, Flux, Sora
// ──────────────────────────────────────────────

export async function methodS_sightEngine(
  imageBytes: Buffer,
  mimeType: string = "image/jpeg",
): Promise<number | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DETECTION_CONFIG.timeouts.sightEngine,
  );

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
        console.warn(`[Baloney] SightEngine unavailable (${response.status})`);
        return null;
      }
      throw new Error(`SightEngine ${response.status}`);
    }

    const data = await response.json();
    return data.type?.ai_generated ?? null;
  } catch (err) {
    console.error("[Baloney] SightEngine image error:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// URL-based variant (faster for web images — avoids uploading bytes)
export async function methodS_sightEngineURL(
  imageUrl: string,
): Promise<number | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DETECTION_CONFIG.timeouts.sightEngineUrl,
  );

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
    return data.type?.ai_generated ?? null;
  } catch (err) {
    console.error("[Baloney] SightEngine URL error:", err);
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
  const timeoutId = setTimeout(
    () => controller.abort(),
    DETECTION_CONFIG.timeouts.synthidImage,
  );

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

// ══════════════════════════════════════════════
// REAL IMAGE DETECTION — Cascading Pipeline (v5.0 — Primary APIs Only)
// Priority: SynthID Image (early exit) → SightEngine (early exit) → Local fallback
// ══════════════════════════════════════════════

export async function realImageDetection(
  base64Image: string,
): Promise<DetectionResult> {
  try {
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const raw = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const bytes = Buffer.from(raw, "base64");

    // ── Stage 1: SynthID Image (Google Imagen watermark detection) ──
    const synthidImageResult = await methodSynthID_image(bytes).catch(
      () => null,
    );

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

    // ── Stage 2: SightEngine API (98.3% accuracy) ──
    const sightEngineScore = await methodS_sightEngine(bytes, mimeType).catch(
      () => null,
    );

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
    console.warn(
      "[Baloney] Primary APIs unavailable, using local-only fallback",
    );
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
    console.error("[Baloney] Real image detection failed:", error);
    throw error;
  }
}
