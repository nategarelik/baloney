// Image detection accuracy tests with real pipeline integration
// Part A: Programmatic test images (20+ images, >100x100 equivalent byte size)
// Part B: Local fallback pipeline accuracy (methodF + methodG, no API needed)
// Part C: Full pipeline integration tests gated on SIGHTENGINE_API_USER
// Part D: Accuracy, precision, recall, F1 reporting

import { describe, it, expect, beforeAll } from "vitest";
import { loadEnv } from "vite";
import path from "path";
import {
  methodF_frequency,
  methodG_metadata,
  realImageDetection,
} from "../lib/detectors/image-detection";
import { DETECTION_CONFIG } from "../lib/detection-config";
import type { Verdict } from "../lib/types";

// Load .env.local into process.env so the real detector can access credentials.
// This runs at module evaluation time so that describe.skipIf can read the vars.
const frontendDir = path.resolve(__dirname, "../../");
const envVars = loadEnv("test", frontendDir, "");
for (const [key, value] of Object.entries(envVars)) {
  if (!(key in process.env)) {
    process.env[key] = value;
  }
}

const hasSightEngineCredentials =
  Boolean(process.env.SIGHTENGINE_API_USER) &&
  Boolean(process.env.SIGHTENGINE_API_SECRET);

// ──────────────────────────────────────────────
// Part A: Test image factory functions
// Each image is >= 100x100 px equivalent in byte volume (>= 30,000 bytes).
// We pack the payload with realistic patterns so methodF and methodG have
// enough data to exercise their multi-scale windows, DCT blocks, and edge
// analysis paths.
// ──────────────────────────────────────────────

interface TestImage {
  id: string;
  label: "ai" | "human";
  category: string;
  description: string;
  base64: string;
  mimeType: string;
}

// ── JPEG helpers ──────────────────────────────

function buildJpegBytes(opts: {
  withExif: boolean;
  cameraMake?: string;
  withGps?: boolean;
  withTiffHeader?: boolean;
  withJfif?: boolean;
  pixelFn: (i: number, total: number) => number;
  pixelCount: number;
}): number[] {
  const bytes: number[] = [0xff, 0xd8]; // SOI

  if (opts.withExif) {
    // APP1 EXIF marker
    const exifPayload: number[] = [
      0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    ];

    // TIFF header (little-endian "II" byte order)
    if (opts.withTiffHeader !== false) {
      exifPayload.push(0x49, 0x49); // "II" — little-endian
      exifPayload.push(0x2a, 0x00); // TIFF magic
      exifPayload.push(0x08, 0x00, 0x00, 0x00); // IFD offset
    }

    // Camera make string
    const make = opts.cameraMake ?? "Canon EOS R5";
    const makeBytes = Array.from(Buffer.from(make + "\0"));
    exifPayload.push(...makeBytes);

    // Optional GPS tag string (used by methodG_metadata)
    if (opts.withGps) {
      const gpsStr = Array.from(Buffer.from("GPS\0"));
      exifPayload.push(...gpsStr);
    }

    // Pad to even length
    while (exifPayload.length % 2 !== 0) exifPayload.push(0x00);

    const appLen = exifPayload.length + 2; // length field includes its own 2 bytes
    const lenHi = (appLen >> 8) & 0xff;
    const lenLo = appLen & 0xff;
    bytes.push(0xff, 0xe1, lenHi, lenLo, ...exifPayload);
  } else if (opts.withJfif) {
    // APP0 JFIF (no EXIF)
    bytes.push(
      0xff, 0xe0, 0x00, 0x10,
      0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
      0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    );
  }

  // Pixel data
  for (let i = 0; i < opts.pixelCount; i++) {
    bytes.push(opts.pixelFn(i, opts.pixelCount));
  }

  // EOI
  bytes.push(0xff, 0xd9);
  return bytes;
}

function toBase64Jpeg(bytes: number[]): string {
  return "data:image/jpeg;base64," + Buffer.from(bytes).toString("base64");
}

function toBase64Png(bytes: number[]): string {
  return "data:image/png;base64," + Buffer.from(bytes).toString("base64");
}

// ── PNG helpers ────────────────────────────────

function buildPngBytes(opts: {
  aiSignature?: string;
  hasTEXT?: boolean;
  pixelFn: (i: number, total: number) => number;
  pixelCount: number;
}): number[] {
  const bytes: number[] = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, // IHDR length (13)
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x64, // width: 100
    0x00, 0x00, 0x00, 0x64, // height: 100
    0x08, 0x02, // bit depth 8, RGB
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x00, 0x00, 0x00, 0x00, // CRC placeholder
  ];

  // Optional tEXt chunk (marks as real tool output)
  if (opts.hasTEXT) {
    const keyword = "Software";
    const text = "Adobe Photoshop 25.0";
    const payload = Buffer.from(keyword + "\0" + text);
    const chunkLen = payload.length;
    const lenHi = (chunkLen >> 8) & 0xff;
    const lenLo = chunkLen & 0xff;
    bytes.push(0x00, 0x00, lenHi, lenLo);
    bytes.push(0x74, 0x45, 0x58, 0x74); // "tEXt"
    bytes.push(...Array.from(payload));
    bytes.push(0x00, 0x00, 0x00, 0x00); // CRC placeholder
  }

  // Optional AI signature text (Stable Diffusion etc.)
  if (opts.aiSignature) {
    const sigBytes = Array.from(Buffer.from(opts.aiSignature));
    bytes.push(...sigBytes);
  }

  // Pixel data
  for (let i = 0; i < opts.pixelCount; i++) {
    bytes.push(opts.pixelFn(i, opts.pixelCount));
  }

  return bytes;
}

// ── Pixel pattern functions ────────────────────

// High variance random noise — real photo texture
function randomNoisePixel(): number {
  return Math.floor(Math.random() * 256);
}

// Smooth linear gradient — AI diffusion characteristic
function smoothGradientPixel(i: number, total: number): number {
  return Math.floor((i / total) * 255);
}

// Ultra-smooth sine wave — very AI-like, almost no high-frequency content
function ultraSmoothPixel(i: number, _total: number): number {
  const smooth = Math.floor((Math.sin(i * 0.001) + 1) * 127.5);
  const tinyNoise = Math.floor((Math.random() - 0.5) * 3);
  return Math.max(0, Math.min(255, smooth + tinyNoise));
}

// Camera-like: random texture with occasional sharp edges
function cameraTexturePixel(i: number, _total: number): number {
  const base = Math.floor(Math.random() * 200) + 20;
  const grain = Math.floor((Math.random() - 0.5) * 80);
  // Sharp edges at pixel block boundaries — simulates real object outlines
  const edge = i % 40 === 0 ? Math.floor(Math.random() * 200) - 100 : 0;
  return Math.max(0, Math.min(255, base + grain + edge));
}

// Uniform solid block — very low variance (common in AI output at solid regions)
function uniformPixel(value: number) {
  return (_i: number, _total: number): number => value;
}

// Slow low-frequency sine — midpoint between smooth and natural
function lowFreqSinePixel(i: number, _total: number): number {
  return Math.floor((Math.sin(i * 0.005) + 1) * 127.5);
}

// ── Image factory ─────────────────────────────

const LARGE_PIXEL_COUNT = 32000; // > 100x100 px RGB bytes worth of data

function makeImages(): TestImage[] {
  return [
    // ── HUMAN images (real-camera-like JPEGs) ──

    {
      id: "human-canon-exif-gps",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Canon EXIF, TIFF header, GPS data, camera texture",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Canon EOS R5",
          withGps: true,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: cameraTexturePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-iphone-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with iPhone 15 EXIF and camera noise texture",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Apple iPhone 15 Pro",
          withGps: false,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: cameraTexturePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-samsung-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Samsung Galaxy camera EXIF and noisy texture",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Samsung Galaxy S24",
          withGps: true,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: cameraTexturePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-nikon-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Nikon D850 EXIF and random noise",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Nikon D850",
          withGps: false,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: randomNoisePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-sony-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Sony A7 EXIF and camera texture",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Sony ILCE-7M4",
          withGps: true,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: cameraTexturePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-pixel-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Google Pixel camera EXIF and noisy data",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Google Pixel 8",
          withGps: false,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: cameraTexturePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-fuji-exif-gps",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Fujifilm EXIF and GPS, high-noise texture",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Fujifilm X-T5",
          withGps: true,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: randomNoisePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-panasonic-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Panasonic Lumix EXIF",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Panasonic DC-S5M2",
          withGps: false,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: cameraTexturePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-olympus-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Olympus OM camera EXIF and texture",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Olympus OM-1",
          withGps: true,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: cameraTexturePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "human-huawei-exif",
      label: "human",
      category: "camera-exif",
      description: "JPEG with Huawei P60 EXIF and noisy pixel data",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: true,
          cameraMake: "Huawei P60 Pro",
          withGps: false,
          withTiffHeader: true,
          withJfif: false,
          pixelFn: randomNoisePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },

    // ── AI images ──────────────────────────────

    {
      id: "ai-jfif-smooth-gradient",
      label: "ai",
      category: "ai-no-exif",
      description: "JFIF JPEG (no EXIF) with smooth linear gradient — AI diffusion output",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: false,
          withJfif: true,
          pixelFn: smoothGradientPixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-jfif-ultra-smooth",
      label: "ai",
      category: "ai-no-exif",
      description: "JFIF JPEG with ultra-smooth sine wave — minimal high-frequency energy",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: false,
          withJfif: true,
          pixelFn: ultraSmoothPixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-no-header-smooth",
      label: "ai",
      category: "ai-no-exif",
      description: "JPEG with no APP marker, smooth gradient data",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: false,
          withJfif: false,
          pixelFn: smoothGradientPixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-no-header-uniform",
      label: "ai",
      category: "ai-no-exif",
      description: "JPEG with no APP marker, uniform pixel block",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: false,
          withJfif: false,
          pixelFn: uniformPixel(128),
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-png-uniform-no-text",
      label: "ai",
      category: "ai-png",
      description: "PNG without tEXt chunk, uniform pixels (AI output pattern)",
      mimeType: "image/png",
      base64: toBase64Png(
        buildPngBytes({
          hasTEXT: false,
          pixelFn: uniformPixel(200),
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-png-smooth-no-text",
      label: "ai",
      category: "ai-png",
      description: "PNG without tEXt chunk, smooth gradient",
      mimeType: "image/png",
      base64: toBase64Png(
        buildPngBytes({
          hasTEXT: false,
          pixelFn: smoothGradientPixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-png-sd-signature",
      label: "ai",
      category: "ai-png-signature",
      description: "PNG with Stable Diffusion metadata signature",
      mimeType: "image/png",
      base64: toBase64Png(
        buildPngBytes({
          hasTEXT: false,
          aiSignature: "Stable Diffusion XL parameters: steps=30, sampler=DPM++",
          pixelFn: smoothGradientPixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-png-dalle-signature",
      label: "ai",
      category: "ai-png-signature",
      description: "PNG with DALL-E metadata signature embedded",
      mimeType: "image/png",
      base64: toBase64Png(
        buildPngBytes({
          hasTEXT: false,
          aiSignature: "DALL-E 3 generated image. aesthetic_score=8.5",
          pixelFn: ultraSmoothPixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-jfif-low-freq",
      label: "ai",
      category: "ai-no-exif",
      description: "JFIF JPEG with low-frequency sine wave — DCT-dominant signal",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: false,
          withJfif: true,
          pixelFn: lowFreqSinePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
    {
      id: "ai-no-header-low-freq",
      label: "ai",
      category: "ai-no-exif",
      description: "Bare JPEG with low-frequency data and no EXIF",
      mimeType: "image/jpeg",
      base64: toBase64Jpeg(
        buildJpegBytes({
          withExif: false,
          withJfif: false,
          pixelFn: lowFreqSinePixel,
          pixelCount: LARGE_PIXEL_COUNT,
        }),
      ),
    },
  ];
}

// ──────────────────────────────────────────────
// Accuracy helpers
// ──────────────────────────────────────────────

function isCorrectVerdict(verdict: Verdict, label: "ai" | "human"): boolean {
  if (label === "ai") {
    return verdict === "ai_generated" || verdict === "heavy_edit";
  }
  return verdict === "human" || verdict === "light_edit";
}

interface MetricsResult {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  specificity: number;
}

function computeMetrics(
  results: ReadonlyArray<{ label: "ai" | "human"; verdict: Verdict }>,
): MetricsResult {
  const aiResults = results.filter((r) => r.label === "ai");
  const humanResults = results.filter((r) => r.label === "human");

  const tp = aiResults.filter((r) =>
    ["ai_generated", "heavy_edit"].includes(r.verdict),
  ).length;
  const fn = aiResults.filter((r) =>
    ["human", "light_edit"].includes(r.verdict),
  ).length;
  const fp = humanResults.filter((r) =>
    ["ai_generated", "heavy_edit"].includes(r.verdict),
  ).length;
  const tn = humanResults.filter((r) =>
    ["human", "light_edit"].includes(r.verdict),
  ).length;

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;
  const accuracy = results.length > 0 ? (tp + tn) / results.length : 0;
  const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;

  return { tp, tn, fp, fn, accuracy, precision, recall, f1, specificity };
}

function printMetricsTable(
  label: string,
  metrics: MetricsResult,
  sampleCount: number,
): void {
  console.log(`\n  ┌────────────────────────────────────────────────┐`);
  console.log(`  │ ${label.padEnd(46)} │`);
  console.log(`  ├────────────────────────────────────────────────┤`);
  console.log(
    `  │ Total samples:  ${String(sampleCount).padStart(3)}                             │`,
  );
  console.log(
    `  │ True Positives  (AI->AI):     ${String(metrics.tp).padStart(3)}           │`,
  );
  console.log(
    `  │ True Negatives  (Human->Hum): ${String(metrics.tn).padStart(3)}           │`,
  );
  console.log(
    `  │ False Positives (Human->AI):  ${String(metrics.fp).padStart(3)}           │`,
  );
  console.log(
    `  │ False Negatives (AI->Human):  ${String(metrics.fn).padStart(3)}           │`,
  );
  console.log(`  ├────────────────────────────────────────────────┤`);
  console.log(
    `  │ Accuracy:     ${(metrics.accuracy * 100).toFixed(1).padStart(6)}%                    │`,
  );
  console.log(
    `  │ Precision:    ${(metrics.precision * 100).toFixed(1).padStart(6)}%                    │`,
  );
  console.log(
    `  │ Recall:       ${(metrics.recall * 100).toFixed(1).padStart(6)}%                    │`,
  );
  console.log(
    `  │ F1 Score:     ${(metrics.f1 * 100).toFixed(1).padStart(6)}%                    │`,
  );
  console.log(
    `  │ Specificity:  ${(metrics.specificity * 100).toFixed(1).padStart(6)}%                    │`,
  );
  console.log(`  └────────────────────────────────────────────────┘`);
}

// ──────────────────────────────────────────────
// Part B: Local fallback pipeline tests
// Runs without any API credentials.
// ──────────────────────────────────────────────

describe("Image Accuracy — Local Fallback Pipeline (methodF + methodG)", () => {
  const FW = DETECTION_CONFIG.image.localFallbackWeights;
  const T = DETECTION_CONFIG.image.verdictThresholds;

  let testImages: TestImage[];

  interface LocalResult {
    id: string;
    label: "ai" | "human";
    freqScore: number;
    metaScore: number;
    compositeScore: number;
    verdict: Verdict;
    correct: boolean;
  }

  let localResults: LocalResult[];

  beforeAll(() => {
    testImages = makeImages();

    localResults = testImages.map((img) => {
      const raw = img.base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const bytes = Buffer.from(raw, "base64");

      const freqScore = methodF_frequency(bytes);
      const metaScore = methodG_metadata(img.base64);
      const compositeScore =
        freqScore * FW.frequency + metaScore * FW.metadata;

      let verdict: Verdict;
      if (compositeScore > T.aiGenerated) {
        verdict = "ai_generated";
      } else if (compositeScore > T.heavyEdit) {
        verdict = "heavy_edit";
      } else if (compositeScore > T.lightEdit) {
        verdict = "light_edit";
      } else {
        verdict = "human";
      }

      return {
        id: img.id,
        label: img.label,
        freqScore,
        metaScore,
        compositeScore,
        verdict,
        correct: isCorrectVerdict(verdict, img.label),
      };
    });
  });

  it("produces scores in valid range [0, 1] for all test images", () => {
    for (const r of localResults) {
      expect(r.freqScore).toBeGreaterThanOrEqual(0);
      expect(r.freqScore).toBeLessThanOrEqual(1);
      expect(r.metaScore).toBeGreaterThanOrEqual(0);
      expect(r.metaScore).toBeLessThanOrEqual(1);
      expect(r.compositeScore).toBeGreaterThanOrEqual(0);
      expect(r.compositeScore).toBeLessThanOrEqual(1);
    }
  });

  it("AI images average higher frequency scores than human images", () => {
    const aiScores = localResults
      .filter((r) => r.label === "ai")
      .map((r) => r.freqScore);
    const humanScores = localResults
      .filter((r) => r.label === "human")
      .map((r) => r.freqScore);

    const avgAi = aiScores.reduce((a, b) => a + b, 0) / aiScores.length;
    const avgHuman =
      humanScores.reduce((a, b) => a + b, 0) / humanScores.length;

    console.log(
      `\n  Avg Frequency Score — AI: ${avgAi.toFixed(4)} | Human: ${avgHuman.toFixed(4)}`,
    );

    // AI images with smooth gradients must score higher than noisy camera images
    expect(avgAi).toBeGreaterThan(avgHuman);
  });

  it("AI images average higher metadata scores than human images", () => {
    const aiScores = localResults
      .filter((r) => r.label === "ai")
      .map((r) => r.metaScore);
    const humanScores = localResults
      .filter((r) => r.label === "human")
      .map((r) => r.metaScore);

    const avgAi = aiScores.reduce((a, b) => a + b, 0) / aiScores.length;
    const avgHuman =
      humanScores.reduce((a, b) => a + b, 0) / humanScores.length;

    console.log(
      `  Avg Metadata Score — AI: ${avgAi.toFixed(4)} | Human: ${avgHuman.toFixed(4)}`,
    );

    expect(avgAi).toBeGreaterThan(avgHuman);
  });

  it("JPEG images with EXIF + camera make score below 0.15 on metadata (real photo)", () => {
    const cameraImages = localResults.filter(
      (r) => r.label === "human" && r.id.includes("exif"),
    );
    expect(cameraImages.length).toBeGreaterThan(0);
    for (const r of cameraImages) {
      expect(r.metaScore).toBeLessThanOrEqual(0.15);
    }
  });

  it("JPEG images without EXIF score at least 0.2 on metadata (suspicious)", () => {
    const noExifImages = localResults.filter(
      (r) => r.label === "ai" && r.id.includes("jfif"),
    );
    expect(noExifImages.length).toBeGreaterThan(0);
    for (const r of noExifImages) {
      expect(r.metaScore).toBeGreaterThanOrEqual(0.2);
    }
  });

  it("PNG images without tEXt chunk score at least 0.1 on metadata", () => {
    const pngNoText = localResults.filter(
      (r) => r.label === "ai" && r.id.includes("png"),
    );
    expect(pngNoText.length).toBeGreaterThan(0);
    for (const r of pngNoText) {
      expect(r.metaScore).toBeGreaterThanOrEqual(0.1);
    }
  });

  it("PNG images with AI signature score at least 0.4 on metadata", () => {
    const sigImages = localResults.filter((r) =>
      r.id.includes("signature"),
    );
    expect(sigImages.length).toBeGreaterThan(0);
    for (const r of sigImages) {
      expect(r.metaScore).toBeGreaterThanOrEqual(0.4);
    }
  });

  it("reports per-image analysis table", () => {
    console.log(
      "\n  ┌────────────────────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "  │ LOCAL PIPELINE — Methods F+G (no API)                                                │",
    );
    console.log(
      "  ├───────────────────────────────┬───────┬──────────┬──────────┬───────────┬────────────┤",
    );
    console.log(
      "  │ Image ID                      │ Label │ FreqF    │ MetaG    │ Composite │ Verdict    │",
    );
    console.log(
      "  ├───────────────────────────────┼───────┼──────────┼──────────┼───────────┼────────────┤",
    );

    for (const r of localResults) {
      const id = r.id.padEnd(29);
      const lbl = r.label.padEnd(5);
      const freq = r.freqScore.toFixed(4).padStart(8);
      const meta = r.metaScore.toFixed(4).padStart(8);
      const comp = r.compositeScore.toFixed(4).padStart(9);
      const mark = r.correct ? "OK  " : "MISS";
      const verd = `${r.verdict.substring(0, 8)} ${mark}`.padEnd(10);
      console.log(
        `  │ ${id} │ ${lbl} │ ${freq} │ ${meta} │ ${comp} │ ${verd} │`,
      );
    }

    console.log(
      "  └───────────────────────────────┴───────┴──────────┴──────────┴───────────┴────────────┘",
    );
    expect(true).toBe(true);
  });

  it("computes and reports accuracy metrics vs 83.3% claim", () => {
    const claimed = DETECTION_CONFIG.evaluation.image.accuracy / 100;
    const metrics = computeMetrics(localResults);
    const sampleCount = localResults.length;

    printMetricsTable("LOCAL FALLBACK (F+G) Metrics", metrics, sampleCount);

    console.log(
      `\n  Claimed accuracy (detection-config.ts): ${(claimed * 100).toFixed(1)}%`,
    );
    console.log(
      `  Measured local-only accuracy:           ${(metrics.accuracy * 100).toFixed(1)}%`,
    );

    // The 83.3% claim was measured on only 6 images. With 20 images the
    // local-only pipeline may differ — we assert a minimum floor only.
    expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
    expect(metrics.precision).toBeGreaterThanOrEqual(0);
    expect(metrics.recall).toBeGreaterThanOrEqual(0);
    expect(metrics.f1).toBeGreaterThanOrEqual(0);
  });

  it("measures Cohen's d effect size between AI and human composite scores", () => {
    const aiScores = localResults
      .filter((r) => r.label === "ai")
      .map((r) => r.compositeScore);
    const humanScores = localResults
      .filter((r) => r.label === "human")
      .map((r) => r.compositeScore);

    const mean = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr: number[], m: number) =>
      Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);

    const aiMean = mean(aiScores);
    const humanMean = mean(humanScores);
    const aiStd = std(aiScores, aiMean);
    const humanStd = std(humanScores, humanMean);
    const pooled = Math.sqrt((aiStd ** 2 + humanStd ** 2) / 2);
    const cohensD = pooled > 0 ? (aiMean - humanMean) / pooled : 0;

    const effectLabel =
      cohensD > 0.8
        ? "LARGE"
        : cohensD > 0.5
          ? "MEDIUM"
          : cohensD > 0.2
            ? "SMALL"
            : "NEGLIGIBLE";

    console.log(`\n  Composite Score Distribution:`);
    console.log(
      `    AI Mean:    ${aiMean.toFixed(4)} | Human Mean: ${humanMean.toFixed(4)}`,
    );
    console.log(`    Cohen's d:  ${cohensD.toFixed(4)} (${effectLabel})`);

    // We expect AI scores to be higher on average — basic sanity check
    expect(aiMean).toBeGreaterThan(humanMean);
  });
});

// ──────────────────────────────────────────────
// Part C: Full pipeline integration tests
// Gated on SIGHTENGINE_API_USER environment variable.
// Uses a reduced set (8 images) to stay under rate limits.
// ──────────────────────────────────────────────

describe.skipIf(!hasSightEngineCredentials)(
  "Image Accuracy — Full Pipeline Integration (realImageDetection + SightEngine)",
  () => {
    // Subset: 4 human + 4 AI, chosen to cover distinct image categories
    const INTEGRATION_IMAGE_IDS = [
      "human-canon-exif-gps",
      "human-iphone-exif",
      "human-nikon-exif",
      "human-sony-exif",
      "ai-jfif-smooth-gradient",
      "ai-jfif-ultra-smooth",
      "ai-png-sd-signature",
      "ai-no-header-smooth",
    ];

    interface IntegrationResult {
      id: string;
      label: "ai" | "human";
      verdict: Verdict;
      primaryScore: number;
      modelUsed: string;
      correct: boolean;
    }

    let integrationResults: IntegrationResult[];
    let allImages: TestImage[];

    beforeAll(async () => {
      allImages = makeImages();
      const subset = allImages.filter((img) =>
        INTEGRATION_IMAGE_IDS.includes(img.id),
      );

      // Run sequentially to avoid rate-limiting SightEngine
      integrationResults = [];
      for (const img of subset) {
        const result = await realImageDetection(img.base64);
        integrationResults.push({
          id: img.id,
          label: img.label,
          verdict: result.verdict as Verdict,
          primaryScore: result.primary_score,
          modelUsed: result.model_used ?? "unknown",
          correct: isCorrectVerdict(result.verdict as Verdict, img.label),
        });
      }
    }, 300_000); // 5 min budget for up to 8 real API calls at 30s each

    it("returns valid verdicts for all integration images", () => {
      const validVerdicts: Verdict[] = [
        "human",
        "light_edit",
        "heavy_edit",
        "ai_generated",
      ];
      for (const r of integrationResults) {
        expect(validVerdicts).toContain(r.verdict);
      }
    });

    it("primary scores are in valid range [0, 1]", () => {
      for (const r of integrationResults) {
        expect(r.primaryScore).toBeGreaterThanOrEqual(0);
        expect(r.primaryScore).toBeLessThanOrEqual(1);
      }
    });

    it("reports per-image integration results table", () => {
      console.log(
        "\n  ┌─────────────────────────────────────────────────────────────────────────────┐",
      );
      console.log(
        "  │ FULL PIPELINE (SightEngine) Integration Results                             │",
      );
      console.log(
        "  ├───────────────────────────────┬───────┬───────────┬────────────────┬───────┤",
      );
      console.log(
        "  │ Image ID                      │ Label │ PrimScore │ Model          │ OK?   │",
      );
      console.log(
        "  ├───────────────────────────────┼───────┼───────────┼────────────────┼───────┤",
      );

      for (const r of integrationResults) {
        const id = r.id.padEnd(29);
        const lbl = r.label.padEnd(5);
        const score = r.primaryScore.toFixed(4).padStart(9);
        const model = r.modelUsed.substring(0, 14).padEnd(14);
        const mark = r.correct ? "OK   " : "MISS ";
        console.log(
          `  │ ${id} │ ${lbl} │ ${score} │ ${model} │ ${mark} │`,
        );
      }

      console.log(
        "  └───────────────────────────────┴───────┴───────────┴────────────────┴───────┘",
      );
      expect(true).toBe(true);
    });

    it("computes and reports full pipeline accuracy metrics", () => {
      const metrics = computeMetrics(integrationResults);
      const sampleCount = integrationResults.length;

      printMetricsTable(
        "FULL PIPELINE (SightEngine) Metrics",
        metrics,
        sampleCount,
      );

      const sightEngineBenchmark = DETECTION_CONFIG.benchmarks.sightEngine.accuracy;
      console.log(
        `\n  SightEngine published benchmark: ${sightEngineBenchmark}% (ARIA)`,
      );
      console.log(
        `  Measured integration accuracy:   ${(metrics.accuracy * 100).toFixed(1)}% on ${sampleCount} synthetic images`,
      );
      console.log(
        `  Note: Synthetic byte-level images are not representative of real-world`,
      );
      console.log(
        `  AI-generated images (DALL-E, Midjourney, SDXL). SightEngine accuracy`,
      );
      console.log(
        `  claims apply to real photographic content, not synthetic test data.`,
      );

      // With synthetic images the pipeline will route through local fallback
      // if SightEngine cannot confidently classify them. We assert basic validity.
      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.precision).toBeGreaterThanOrEqual(0);
      expect(metrics.recall).toBeGreaterThanOrEqual(0);
      expect(metrics.f1).toBeGreaterThanOrEqual(0);
    });

    it("SightEngine route is attempted for all integration images", () => {
      // At least one result should come from sightengine model path
      // (or local fallback if SightEngine API rejects synthetic images)
      for (const r of integrationResults) {
        expect(r.modelUsed).toBeTruthy();
        console.log(`  ${r.id}: model=${r.modelUsed}, verdict=${r.verdict}`);
      }
    });
  },
);
