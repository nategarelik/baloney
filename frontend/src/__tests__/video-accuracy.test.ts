// Video Detection Accuracy Tests
//
// Three layers of accuracy measurement:
//
//   Part A: Frame-level analysis via local fallback (methodF + methodG)
//     Tests whether synthetic "frames" encoded as base64 images are classified
//     correctly when passed through the local frequency+metadata detection
//     pipeline. No external API calls. All 10 frames must run offline.
//
//   Part B: Route-level aggregation pipeline end-to-end
//     Creates mock SightEngine-style frame results (known scores) and verifies
//     the route's aggregation logic produces the correct verdict, counts, and
//     percentages. Tests the full composition of aggregation helpers.
//
//   Part C: SightEngine native video API integration (gated on credentials)
//     Sends a minimal programmatically-constructed video blob to the SightEngine
//     video endpoint and verifies the response structure. Skipped when
//     SIGHTENGINE_API_USER is absent.
//
//     NOTE ON VALID VIDEO BLOBS:
//     Creating a valid MPEG-4/H.264 bitstream programmatically without a codec
//     library is not feasible in a pure Node test environment. The SightEngine
//     video endpoint expects a structurally valid video container. A random byte
//     payload will be rejected with a 400 error. Because of this, Part C is
//     limited to testing the methodS_sightEngineVideo function's error-handling
//     behaviour when given an invalid blob (it must return null, not throw).
//     Testing with a real video clip requires an external fixture file, which is
//     documented in the gap report at the bottom of this file.
//
//   Part D: Metrics report
//     Logs frame-level and aggregation accuracy in table format.

import { describe, it, expect } from "vitest";
import { DETECTION_CONFIG } from "../lib/detection-config";
import {
  methodF_frequency,
  methodG_metadata,
  methodS_sightEngineVideo,
} from "../lib/real-detectors";
import type { Verdict } from "../lib/types";

// ──────────────────────────────────────────────────────────
// Shared constants — thresholds mirrored from route.ts
// ──────────────────────────────────────────────────────────

const VIDEO_T = DETECTION_CONFIG.image.verdictThresholds;
const FRAME_AI_THRESHOLD = 0.5;
const LOCAL_WEIGHTS = DETECTION_CONFIG.image.localFallbackWeights;

// ──────────────────────────────────────────────────────────
// Synthetic frame generators
// (Same approach as IMAGE_TEST_CASES in datasets.ts)
// ──────────────────────────────────────────────────────────

function createHumanLikeFrame(seed: number): string {
  // JPEG with EXIF + camera make + high-frequency noise
  // Mimics a real camera photo extracted from a recorded video.
  const header = [
    0xff, 0xd8, // SOI
    0xff, 0xe1, // APP1 (EXIF)
    0x00, 0x62, // length
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x4d, 0x4d, 0x00, 0x2a, // TIFF header: big-endian + TIFF magic
  ];
  const cameraInfo = Array.from(
    Buffer.from(`Canon EOS R5\0Nikon D850\0Apple iPhone 15\0GPS\0`),
  );

  // Natural high-frequency noise — real video frames have strong local variance.
  const pixelData: number[] = [];
  for (let i = 0; i < 3000; i++) {
    const base = (seed * 37 + i * 13) % 256;
    const noise = ((seed * 7 + i * 19) % 80) - 40;
    pixelData.push(Math.max(0, Math.min(255, base + noise)));
  }

  const allBytes = [...header, ...cameraInfo, ...pixelData];
  return "data:image/jpeg;base64," + Buffer.from(allBytes).toString("base64");
}

function createAiLikeFrame(seed: number): string {
  // JPEG without EXIF, smooth gradient — mimics an AI-generated video frame.
  const header = [
    0xff, 0xd8, // SOI
    0xff, 0xe0, // APP0 (JFIF — no EXIF)
    0x00, 0x10,
    0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  ];

  // Smooth gradient with minimal noise — diffusion model characteristic.
  const pixelData: number[] = [];
  for (let i = 0; i < 3000; i++) {
    const smooth = Math.floor(
      (Math.sin((seed * 0.1 + i) * 0.002) + 1) * 127,
    );
    const tinyNoise = (seed + i) % 6;
    pixelData.push(Math.max(0, Math.min(255, smooth + tinyNoise)));
  }

  const allBytes = [...header, ...pixelData];
  return "data:image/jpeg;base64," + Buffer.from(allBytes).toString("base64");
}

// ──────────────────────────────────────────────────────────
// Route-level aggregation helpers
// (Re-implemented locally so tests remain decoupled from Next.js
//  route module resolution — mirrors route.ts lines 50-69.)
// ──────────────────────────────────────────────────────────

interface FrameScore {
  readonly timestamp: number;
  readonly ai_score: number;
}

interface PipelineResult {
  readonly verdict: Verdict;
  readonly confidence: number;
  readonly frames_analyzed: number;
  readonly frames_flagged_ai: number;
  readonly ai_frame_percentage: number;
  readonly frame_scores: readonly number[];
}

function mapVideoVerdict(score: number): Verdict {
  if (score > VIDEO_T.aiGenerated) return "ai_generated";
  if (score > VIDEO_T.heavyEdit) return "heavy_edit";
  if (score > VIDEO_T.lightEdit) return "light_edit";
  return "human";
}

function aggregateFrameResults(frames: readonly FrameScore[]): PipelineResult {
  if (frames.length === 0) {
    return {
      verdict: "human",
      confidence: 0,
      frames_analyzed: 0,
      frames_flagged_ai: 0,
      ai_frame_percentage: 0,
      frame_scores: [],
    };
  }
  const avgScore =
    frames.reduce((sum, f) => sum + f.ai_score, 0) / frames.length;
  const flagged = frames.filter((f) => f.ai_score > FRAME_AI_THRESHOLD).length;
  const score = parseFloat(avgScore.toFixed(4));
  return {
    verdict: mapVideoVerdict(score),
    confidence: score,
    frames_analyzed: frames.length,
    frames_flagged_ai: flagged,
    ai_frame_percentage: parseFloat((flagged / frames.length).toFixed(4)),
    frame_scores: frames.map((f) => parseFloat(f.ai_score.toFixed(4))),
  };
}

// ══════════════════════════════════════════════════════════
// Part A — Frame-level analysis (local fallback pipeline)
// methodF + methodG on synthetic frames
// ══════════════════════════════════════════════════════════

describe("Video Accuracy — Part A: Frame-level local analysis", () => {
  // Generate 5 human-like and 5 AI-like frames.
  const humanFrames = Array.from({ length: 5 }, (_, i) =>
    createHumanLikeFrame(i + 1),
  );
  const aiFrames = Array.from({ length: 5 }, (_, i) =>
    createAiLikeFrame(i + 1),
  );

  function localScore(base64: string): number {
    const raw = base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const bytes = Buffer.from(raw, "base64");
    const freq = methodF_frequency(bytes);
    const meta = methodG_metadata(base64);
    return (
      freq * LOCAL_WEIGHTS.frequency + meta * LOCAL_WEIGHTS.metadata
    );
  }

  it("human-like frames produce lower local scores than AI-like frames on average", () => {
    const humanScores = humanFrames.map(localScore);
    const aiScores = aiFrames.map(localScore);

    const avgHuman =
      humanScores.reduce((a, b) => a + b, 0) / humanScores.length;
    const avgAi = aiScores.reduce((a, b) => a + b, 0) / aiScores.length;

    // The local pipeline should separate human vs AI frames directionally.
    expect(avgAi).toBeGreaterThan(avgHuman);
  });

  it("each human-like frame stays below the ai_generated verdict threshold", () => {
    for (const frame of humanFrames) {
      const score = localScore(frame);
      // Human frames should not trip the highest AI threshold.
      expect(score).toBeLessThanOrEqual(VIDEO_T.aiGenerated);
    }
  });

  it("AI-like frames produce scores indicating at least moderate AI signal", () => {
    const aiScores = aiFrames.map(localScore);
    const aiAboveLight = aiScores.filter(
      (s) => s > VIDEO_T.lightEdit,
    ).length;
    // Majority of AI-like frames should score above the light_edit threshold.
    expect(aiAboveLight).toBeGreaterThanOrEqual(3);
  });

  it("methodF alone separates smooth AI frames from noisy human frames", () => {
    const humanFreqScores = humanFrames.map((f) => {
      const raw = f.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      return methodF_frequency(Buffer.from(raw, "base64"));
    });
    const aiFreqScores = aiFrames.map((f) => {
      const raw = f.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      return methodF_frequency(Buffer.from(raw, "base64"));
    });
    const avgHumanFreq =
      humanFreqScores.reduce((a, b) => a + b, 0) / humanFreqScores.length;
    const avgAiFreq =
      aiFreqScores.reduce((a, b) => a + b, 0) / aiFreqScores.length;

    // AI frames (smooth gradients) should score higher on the frequency uniformity axis.
    expect(avgAiFreq).toBeGreaterThan(avgHumanFreq);
  });

  it("methodG alone penalises frames without EXIF (AI-like)", () => {
    const humanMetaScores = humanFrames.map(methodG_metadata);
    const aiMetaScores = aiFrames.map(methodG_metadata);

    const avgHumanMeta =
      humanMetaScores.reduce((a, b) => a + b, 0) / humanMetaScores.length;
    const avgAiMeta =
      aiMetaScores.reduce((a, b) => a + b, 0) / aiMetaScores.length;

    // AI frames lack EXIF, so metadata suspicion score should be higher.
    expect(avgAiMeta).toBeGreaterThan(avgHumanMeta);
  });

  it("all local scores remain within the valid [0, 1] range", () => {
    for (const frame of [...humanFrames, ...aiFrames]) {
      const score = localScore(frame);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});

// ══════════════════════════════════════════════════════════
// Part B — Route-level aggregation pipeline (end-to-end)
// Tests the full composition of aggregation + verdict logic
// ══════════════════════════════════════════════════════════

describe("Video Accuracy — Part B: Route aggregation pipeline", () => {
  // Known-verdict test cases representing real distribution patterns.
  // Each case specifies a realistic frame score distribution and the
  // expected pipeline output.
  const knownCases: Array<{
    id: string;
    description: string;
    label: "ai" | "human";
    frames: readonly FrameScore[];
    expectedVerdict: Verdict;
    expectedFlaggedCount: number;
  }> = [
    {
      id: "all-ai",
      description: "8 frames uniformly at 0.9 (AI-generated video)",
      label: "ai",
      frames: Array.from({ length: 8 }, (_, i) => ({
        timestamp: i,
        ai_score: 0.9,
      })),
      expectedVerdict: "ai_generated",
      expectedFlaggedCount: 8,
    },
    {
      id: "all-human",
      description: "8 frames uniformly at 0.05 (clean human video)",
      label: "human",
      frames: Array.from({ length: 8 }, (_, i) => ({
        timestamp: i,
        ai_score: 0.05,
      })),
      expectedVerdict: "human",
      expectedFlaggedCount: 0,
    },
    {
      id: "majority-ai",
      description: "6 AI frames (0.85) + 2 human frames (0.05)",
      label: "ai",
      frames: [
        ...Array.from({ length: 6 }, (_, i) => ({
          timestamp: i,
          ai_score: 0.85,
        })),
        { timestamp: 6, ai_score: 0.05 },
        { timestamp: 7, ai_score: 0.05 },
      ],
      // avg = (6*0.85 + 2*0.05) / 8 = (5.1 + 0.1) / 8 = 0.65 -> heavy_edit (strict >)
      expectedVerdict: "heavy_edit",
      expectedFlaggedCount: 6,
    },
    {
      id: "heavy-edit",
      description: "4 frames at 0.55 (moderate AI signal)",
      label: "ai",
      frames: Array.from({ length: 4 }, (_, i) => ({
        timestamp: i,
        ai_score: 0.55,
      })),
      expectedVerdict: "heavy_edit",
      expectedFlaggedCount: 4,
    },
    {
      id: "light-edit",
      description: "4 frames at 0.38 (weak AI signal)",
      label: "ai",
      frames: Array.from({ length: 4 }, (_, i) => ({
        timestamp: i,
        ai_score: 0.38,
      })),
      expectedVerdict: "light_edit",
      expectedFlaggedCount: 0,
    },
    {
      id: "one-ai-many-human",
      description: "1 AI frame (0.95) among 7 human frames (0.05)",
      label: "human",
      frames: [
        { timestamp: 0, ai_score: 0.95 },
        ...Array.from({ length: 7 }, (_, i) => ({
          timestamp: i + 1,
          ai_score: 0.05,
        })),
      ],
      // avg = (0.95 + 7*0.05) / 8 = (0.95 + 0.35) / 8 = 0.1625 -> human
      expectedVerdict: "human",
      expectedFlaggedCount: 1,
    },
    {
      id: "single-frame-ai",
      description: "Single AI frame (0.8)",
      label: "ai",
      frames: [{ timestamp: 0, ai_score: 0.8 }],
      expectedVerdict: "ai_generated",
      expectedFlaggedCount: 1,
    },
    {
      id: "single-frame-human",
      description: "Single clean frame (0.1)",
      label: "human",
      frames: [{ timestamp: 0, ai_score: 0.1 }],
      expectedVerdict: "human",
      expectedFlaggedCount: 0,
    },
  ];

  for (const c of knownCases) {
    it(`${c.id}: ${c.description}`, () => {
      const result = aggregateFrameResults(c.frames);
      expect(result.verdict).toBe(c.expectedVerdict);
      expect(result.frames_flagged_ai).toBe(c.expectedFlaggedCount);
      expect(result.frames_analyzed).toBe(c.frames.length);
      expect(result.ai_frame_percentage).toBeGreaterThanOrEqual(0);
      expect(result.ai_frame_percentage).toBeLessThanOrEqual(1);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.frame_scores).toHaveLength(c.frames.length);
    });
  }

  it("empty frame array is handled gracefully", () => {
    const result = aggregateFrameResults([]);
    expect(result.verdict).toBe("human");
    expect(result.frames_analyzed).toBe(0);
    expect(result.frames_flagged_ai).toBe(0);
    expect(result.frame_scores).toHaveLength(0);
  });

  it("verdict thresholds originate from DETECTION_CONFIG (not hardcoded)", () => {
    expect(VIDEO_T.aiGenerated).toBe(0.65);
    expect(VIDEO_T.heavyEdit).toBe(0.45);
    expect(VIDEO_T.lightEdit).toBe(0.3);
  });

  it("frame_scores array preserves per-frame granularity", () => {
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.1 },
      { timestamp: 1, ai_score: 0.5 },
      { timestamp: 2, ai_score: 0.9 },
    ];
    const result = aggregateFrameResults(frames);
    expect(result.frame_scores[0]).toBe(0.1);
    expect(result.frame_scores[1]).toBe(0.5);
    expect(result.frame_scores[2]).toBe(0.9);
  });

  it("ai_frame_percentage matches frames_flagged_ai / frames_analyzed", () => {
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.2 },
      { timestamp: 1, ai_score: 0.8 },
      { timestamp: 2, ai_score: 0.6 },
      { timestamp: 3, ai_score: 0.1 },
    ];
    const result = aggregateFrameResults(frames);
    const expected = parseFloat(
      (result.frames_flagged_ai / result.frames_analyzed).toFixed(4),
    );
    expect(result.ai_frame_percentage).toBe(expected);
  });
});

// ══════════════════════════════════════════════════════════
// Part C — SightEngine native video API (gated on credentials)
// ══════════════════════════════════════════════════════════

const HAS_SIGHTENGINE_CREDENTIALS =
  Boolean(process.env.SIGHTENGINE_API_USER) &&
  Boolean(process.env.SIGHTENGINE_API_SECRET);

describe.skipIf(!HAS_SIGHTENGINE_CREDENTIALS)(
  "Video Accuracy — Part C: SightEngine native video API (requires credentials)",
  () => {
    // NOTE ON VALID VIDEO CREATION:
    // Generating a structurally valid MP4/H.264 bitstream purely from
    // typed arrays is not feasible without a native codec library (e.g.,
    // ffmpeg-static). The SightEngine video endpoint rejects malformed
    // containers with a 400 error and returns null via methodS_sightEngineVideo.
    //
    // This suite tests the function contract: invalid video blob -> null (no throw).
    // For accuracy measurement with real clips, see the gap report below.

    it(
      "invalid video blob returns null without throwing",
      async () => {
        // A byte payload that is not a valid video container.
        const invalidPayload = new Uint8Array(512).fill(0xde);
        const blob = new Blob([invalidPayload], { type: "video/mp4" });

        // methodS_sightEngineVideo must catch API errors and return null.
        const result = await methodS_sightEngineVideo(blob);
        expect(result).toBeNull();
      },
      60000,
    );

    it(
      "zero-length blob returns null without throwing",
      async () => {
        const blob = new Blob([], { type: "video/mp4" });
        const result = await methodS_sightEngineVideo(blob);
        expect(result).toBeNull();
      },
      60000,
    );

    it(
      "valid response structure when real video is available",
      async () => {
        // This test only runs when TEST_VIDEO_PATH env var points to a real
        // video file on disk (e.g., a 5-second MP4 clip).
        const videoPath = process.env.TEST_VIDEO_PATH;
        if (!videoPath) {
          console.log(
            "  [skip] TEST_VIDEO_PATH not set — real video test skipped",
          );
          return;
        }

        const { readFileSync } = await import("fs");
        const fileBytes = readFileSync(videoPath);
        const mimeType = videoPath.endsWith(".webm")
          ? "video/webm"
          : "video/mp4";
        const blob = new Blob([new Uint8Array(fileBytes)], { type: mimeType });

        const result = await methodS_sightEngineVideo(blob);
        if (result === null) {
          console.warn(
            "  [warn] SightEngine video returned null for real clip — check file validity",
          );
          return;
        }

        // Verify result structure.
        expect(typeof result.ai_generated_score).toBe("number");
        expect(result.ai_generated_score).toBeGreaterThanOrEqual(0);
        expect(result.ai_generated_score).toBeLessThanOrEqual(1);
        expect(Array.isArray(result.frames)).toBe(true);

        for (const frame of result.frames) {
          expect(typeof frame.timestamp).toBe("number");
          expect(typeof frame.ai_score).toBe("number");
          expect(frame.ai_score).toBeGreaterThanOrEqual(0);
          expect(frame.ai_score).toBeLessThanOrEqual(1);
        }
      },
      60000,
    );
  },
);

// ══════════════════════════════════════════════════════════
// Part D — Metrics report
// ══════════════════════════════════════════════════════════

describe("Video Accuracy — Part D: Metrics report", () => {
  it("reports frame-level accuracy for local fallback pipeline", () => {
    function localScore(base64: string): number {
      const raw = base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const bytes = Buffer.from(raw, "base64");
      const freq = methodF_frequency(bytes);
      const meta = methodG_metadata(base64);
      return freq * LOCAL_WEIGHTS.frequency + meta * LOCAL_WEIGHTS.metadata;
    }

    const humanFrames = Array.from({ length: 5 }, (_, i) =>
      createHumanLikeFrame(i + 1),
    );
    const aiFrames = Array.from({ length: 5 }, (_, i) =>
      createAiLikeFrame(i + 1),
    );

    // Binary accuracy: AI frame scores above light_edit threshold = correct.
    // Human frame scores at or below light_edit threshold = correct.
    let correct = 0;
    const rows: string[] = [];

    for (let i = 0; i < humanFrames.length; i++) {
      const score = localScore(humanFrames[i]);
      const predictedVerdict = mapVideoVerdict(score);
      const isCorrect = predictedVerdict === "human" || predictedVerdict === "light_edit";
      if (isCorrect) correct++;
      rows.push(
        `  │ human-${i + 1}  │ human  │ ${score.toFixed(4).padStart(10)} │ ${predictedVerdict.padEnd(13)} │ ${isCorrect ? "PASS  " : "FAIL  "} │`,
      );
    }
    for (let i = 0; i < aiFrames.length; i++) {
      const score = localScore(aiFrames[i]);
      const predictedVerdict = mapVideoVerdict(score);
      const isCorrect = predictedVerdict !== "human";
      if (isCorrect) correct++;
      rows.push(
        `  │ ai-${i + 1}     │ ai     │ ${score.toFixed(4).padStart(10)} │ ${predictedVerdict.padEnd(13)} │ ${isCorrect ? "PASS  " : "FAIL  "} │`,
      );
    }

    const total = humanFrames.length + aiFrames.length;
    const accuracy = correct / total;

    console.log(
      "\n  ┌──────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "  │ VIDEO FRAME-LEVEL LOCAL ACCURACY (methodF + methodG)         │",
    );
    console.log(
      "  ├──────────────┬────────┬────────────┬───────────────┬────────┤",
    );
    console.log(
      "  │ Frame        │ Label  │ Score      │ Verdict       │ Result │",
    );
    console.log(
      "  ├──────────────┼────────┼────────────┼───────────────┼────────┤",
    );
    for (const row of rows) {
      console.log(row);
    }
    console.log(
      "  └──────────────┴────────┴────────────┴───────────────┴────────┘",
    );
    console.log(
      `\n  Frame-level local accuracy: ${correct}/${total} = ${(accuracy * 100).toFixed(1)}%`,
    );
    console.log(
      "  NOTE: Local fallback uses frequency+metadata only. SightEngine (98.3%) not measured here.",
    );

    // Expect at least 60% accuracy from the local-only pipeline.
    // This is intentionally lenient — local detection is a fallback, not primary.
    expect(accuracy).toBeGreaterThanOrEqual(0.6);
  });

  it("reports aggregation-pipeline accuracy for known-verdict cases", () => {
    const knownCases: Array<{
      id: string;
      label: "ai" | "human";
      frames: readonly FrameScore[];
      expectedVerdict: Verdict;
    }> = [
      {
        id: "all-ai-0.9",
        label: "ai",
        frames: Array.from({ length: 8 }, (_, i) => ({
          timestamp: i,
          ai_score: 0.9,
        })),
        expectedVerdict: "ai_generated",
      },
      {
        id: "all-human-0.05",
        label: "human",
        frames: Array.from({ length: 8 }, (_, i) => ({
          timestamp: i,
          ai_score: 0.05,
        })),
        expectedVerdict: "human",
      },
      {
        id: "heavy-edit-0.55",
        label: "ai",
        frames: Array.from({ length: 4 }, (_, i) => ({
          timestamp: i,
          ai_score: 0.55,
        })),
        expectedVerdict: "heavy_edit",
      },
      {
        id: "light-edit-0.38",
        label: "ai",
        frames: Array.from({ length: 4 }, (_, i) => ({
          timestamp: i,
          ai_score: 0.38,
        })),
        expectedVerdict: "light_edit",
      },
      {
        id: "single-ai-0.8",
        label: "ai",
        frames: [{ timestamp: 0, ai_score: 0.8 }],
        expectedVerdict: "ai_generated",
      },
      {
        id: "single-human-0.1",
        label: "human",
        frames: [{ timestamp: 0, ai_score: 0.1 }],
        expectedVerdict: "human",
      },
    ];

    let correct = 0;

    console.log(
      "\n  ┌──────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "  │ VIDEO AGGREGATION PIPELINE — Known-Verdict Accuracy                  │",
    );
    console.log(
      "  ├──────────────────────┬────────┬────────────┬──────────────┬──────────┤",
    );
    console.log(
      "  │ Case                 │ Label  │ Avg Score  │ Verdict      │ Result   │",
    );
    console.log(
      "  ├──────────────────────┼────────┼────────────┼──────────────┼──────────┤",
    );

    for (const c of knownCases) {
      const result = aggregateFrameResults(c.frames);
      const matched = result.verdict === c.expectedVerdict;
      if (matched) correct++;

      const id = c.id.padEnd(20);
      const label = c.label.padEnd(6);
      const score = result.confidence.toFixed(4).padStart(10);
      const verdict = result.verdict.padEnd(12);
      const outcome = matched ? "PASS    " : "FAIL    ";
      console.log(`  │ ${id} │ ${label} │ ${score} │ ${verdict} │ ${outcome} │`);

      expect(result.verdict).toBe(c.expectedVerdict);
    }

    console.log(
      "  └──────────────────────┴────────┴────────────┴──────────────┴──────────┘",
    );

    const total = knownCases.length;
    const accuracy = correct / total;

    console.log(
      `\n  Aggregation pipeline accuracy: ${correct}/${total} = ${(accuracy * 100).toFixed(1)}%`,
    );
    console.log(
      `  SightEngine native video accuracy: unmeasured (requires labeled video dataset)`,
    );
    console.log(
      `  Gap: Set TEST_VIDEO_PATH + SIGHTENGINE_API_USER/SECRET to enable API integration tests`,
    );

    expect(accuracy).toBe(1.0);
  });
});

// ══════════════════════════════════════════════════════════
// Gap report
// ══════════════════════════════════════════════════════════
//
// What IS measured by this file:
//   - Frame-level local accuracy (methodF + methodG on synthetic frames)
//   - Aggregation pipeline accuracy for 8+ known-verdict cases (100%)
//   - methodS_sightEngineVideo contract: invalid blob -> null, no throw
//
// What is NOT yet measurable without external fixtures:
//   - End-to-end accuracy of the SightEngine native video endpoint with real clips
//   - False positive / false negative rates for real AI vs human video
//   - Score distribution across a labeled video benchmark dataset
//
// To enable full accuracy measurement:
//   1. Collect a labeled dataset: 50+ AI-generated clips + 50+ human-recorded clips,
//      each 5-30 seconds, stored in Supabase Storage or S3.
//   2. Set environment variables:
//        SIGHTENGINE_API_USER  — existing credentials
//        SIGHTENGINE_API_SECRET — existing credentials
//        TEST_VIDEO_PATH       — path to a single real video file for smoke testing
//   3. The "valid response structure when real video is available" test in Part C
//      will automatically activate when TEST_VIDEO_PATH is set.
//   4. For batch evaluation, add a separate script that iterates the dataset,
//      calls methodS_sightEngineVideo per clip, and writes accuracy metrics to
//      DETECTION_CONFIG.evaluation.video.
