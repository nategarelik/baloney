// frontend/src/lib/detection/image-analysis.ts — Frequency domain and metadata analysis

import { DETECTION_CONFIG } from "@/lib/detection-config";
import { clamp, precise } from "./helpers";

export function methodF_frequency(imageBytes: Buffer): number {
  const FN = DETECTION_CONFIG.image.frequencyNormalization;
  const FW = DETECTION_CONFIG.image.frequencyWeights.withSlope;
  const FB = DETECTION_CONFIG.image.frequencyWeights.fallback;

  const size = Math.min(imageBytes.length, FN.totalSamplesCap);
  const samples = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    samples[i] = imageBytes[i] / 255.0;
  }

  // Signal 1: Multi-scale local variance analysis
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

  // Signal 2: High-frequency energy (adjacent pixel differences)
  const analyzeLen = Math.min(samples.length, FN.analysisLengthCap);
  let highFreqEnergy = 0;
  for (let i = 1; i < analyzeLen; i++) {
    highFreqEnergy += Math.abs(samples[i] - samples[i - 1]);
  }
  highFreqEnergy /= Math.max(analyzeLen - 1, 1);
  const smoothness = clamp(1 - highFreqEnergy * FN.highFreqEnergyScale, 0, 1);

  // Signal 3: DCT coefficient analysis (simplified)
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

  // Signal 4: Edge density analysis
  let edgeCount = 0;
  const edgeThreshold = FN.edgeThreshold;
  for (let i = 1; i < analyzeLen; i++) {
    if (Math.abs(samples[i] - samples[i - 1]) > edgeThreshold) {
      edgeCount++;
    }
  }
  const edgeDensity = edgeCount / Math.max(analyzeLen - 1, 1);
  const edgeSignal = clamp(1 - edgeDensity * FN.edgeDensityScale, 0, 1);

  // Signal 5: Spectral slope estimation
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

  // Check 1: EXIF analysis for JPEG
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

  // Check 2: File structure analysis
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

  // Check for C2PA/Content Credentials markers
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
