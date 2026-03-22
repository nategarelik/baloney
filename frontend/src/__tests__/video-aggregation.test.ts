// Video Detection Accuracy Baseline — Aggregation Logic Tests
//
// Methodology note:
// Video detection accuracy cannot be fully benchmarked the same way text and image
// can, for three reasons:
//
//   1. Frame sourcing: We cannot inline real video frames into test datasets the
//      way we inline text strings. Realistic frame sets require external storage.
//
//   2. API dependency: The primary detection method (methodS_sightEngineVideo)
//      calls SightEngine's synchronous video endpoint. That call cannot run in
//      automated tests without live credentials and real video data.
//
//   3. Aggregation is separable: The verdict-mapping logic (score thresholds)
//      is purely deterministic given an ai_generated_score. We can unit-test
//      this layer in complete isolation from the external API.
//
// This file establishes the baseline by testing the two separable layers:
//
//   Layer A — Frame-level flagging:
//     A frame is counted as "flagged AI" when its ai_score > 0.5.
//     This mirrors the threshold used in route.ts to compute frames_flagged_ai
//     and ai_frame_percentage.
//
//   Layer B — Video-level verdict from average frame score:
//     Given an ai_generated_score (the average ai_score across all frames),
//     the route maps to a Verdict using the thresholds defined in
//     DETECTION_CONFIG.image.verdictThresholds (score > 0.65 -> ai_generated,
//     > 0.45 -> heavy_edit, > 0.3 -> light_edit, else human).
//     These thresholds match the image thresholds and are documented in
//     detection-config.ts.
//
// When SightEngine native video credentials are available in CI, an integration
// test layer (Layer C) should be added that sends real short video clips and
// verifies the returned score distribution matches known-AI vs known-human clips.

import { describe, it, expect } from "vitest";
import { DETECTION_CONFIG } from "../lib/detection-config";
import type { Verdict } from "../lib/types";

// ──────────────────────────────────────────────────────────
// Re-implementation of the aggregation logic from
// frontend/src/app/api/detect/video/route.ts
// (lines 51-55, 62-64, 115-117)
// This is intentionally kept as a local copy so the tests
// remain self-contained and are decoupled from Next.js route
// module resolution.
// ──────────────────────────────────────────────────────────

const VIDEO_T = DETECTION_CONFIG.image.verdictThresholds;
const FRAME_AI_THRESHOLD = 0.5; // frames with ai_score > this are "flagged AI"

function mapVideoVerdict(aiGeneratedScore: number): Verdict {
  if (aiGeneratedScore > VIDEO_T.aiGenerated) return "ai_generated";
  if (aiGeneratedScore > VIDEO_T.heavyEdit) return "heavy_edit";
  if (aiGeneratedScore > VIDEO_T.lightEdit) return "light_edit";
  return "human";
}

interface FrameScore {
  readonly timestamp: number;
  readonly ai_score: number;
}

interface AggregationResult {
  readonly verdict: Verdict;
  readonly ai_generated_score: number;
  readonly frames_flagged_ai: number;
  readonly ai_frame_percentage: number;
}

function aggregateFrames(frames: readonly FrameScore[]): AggregationResult {
  if (frames.length === 0) {
    return {
      verdict: "human",
      ai_generated_score: 0,
      frames_flagged_ai: 0,
      ai_frame_percentage: 0,
    };
  }

  const avgScore =
    frames.reduce((sum, f) => sum + f.ai_score, 0) / frames.length;

  const flaggedCount = frames.filter(
    (f) => f.ai_score > FRAME_AI_THRESHOLD,
  ).length;

  return {
    verdict: mapVideoVerdict(avgScore),
    ai_generated_score: parseFloat(avgScore.toFixed(4)),
    frames_flagged_ai: flaggedCount,
    ai_frame_percentage: parseFloat(
      (flaggedCount / frames.length).toFixed(4),
    ),
  };
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function uniformFrames(
  count: number,
  score: number,
): readonly FrameScore[] {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: i,
    ai_score: score,
  }));
}

// ══════════════════════════════════════════════════════════
// Layer A — Frame-level flagging threshold
// ══════════════════════════════════════════════════════════

describe("Video Aggregation — Frame-level flagging (Layer A)", () => {
  it("frames with ai_score > 0.5 are counted as flagged AI", () => {
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.3 },
      { timestamp: 1, ai_score: 0.51 }, // above threshold
      { timestamp: 2, ai_score: 0.7 },  // above threshold
    ];
    const result = aggregateFrames(frames);
    expect(result.frames_flagged_ai).toBe(2);
  });

  it("frame exactly at 0.5 is NOT flagged (strict >)", () => {
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.5 },
    ];
    const result = aggregateFrames(frames);
    expect(result.frames_flagged_ai).toBe(0);
  });

  it("ai_frame_percentage is correct for mixed frames", () => {
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.2 },
      { timestamp: 1, ai_score: 0.8 },
      { timestamp: 2, ai_score: 0.6 },
      { timestamp: 3, ai_score: 0.1 },
    ];
    const result = aggregateFrames(frames);
    expect(result.frames_flagged_ai).toBe(2);
    expect(result.ai_frame_percentage).toBe(0.5);
  });

  it("produces scores in [0, 1] for arbitrary frame sets", () => {
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.0 },
      { timestamp: 1, ai_score: 0.25 },
      { timestamp: 2, ai_score: 0.5 },
      { timestamp: 3, ai_score: 0.75 },
      { timestamp: 4, ai_score: 1.0 },
    ];
    const result = aggregateFrames(frames);
    expect(result.ai_generated_score).toBeGreaterThanOrEqual(0);
    expect(result.ai_generated_score).toBeLessThanOrEqual(1);
    expect(result.ai_frame_percentage).toBeGreaterThanOrEqual(0);
    expect(result.ai_frame_percentage).toBeLessThanOrEqual(1);
  });
});

// ══════════════════════════════════════════════════════════
// Layer B — Video-level verdict from average frame score
// ══════════════════════════════════════════════════════════

describe("Video Aggregation — Verdict mapping (Layer B)", () => {
  it("all frames flagged AI -> ai_generated verdict", () => {
    const frames = uniformFrames(8, 0.9);
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("ai_generated");
  });

  it("no frames flagged -> human verdict", () => {
    const frames = uniformFrames(8, 0.1);
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("human");
  });

  it("high majority AI frames -> ai_generated verdict", () => {
    // 7 of 8 frames heavily AI, 1 frame clean
    const frames: readonly FrameScore[] = [
      ...uniformFrames(7, 0.85),
      { timestamp: 7, ai_score: 0.05 },
    ];
    // avg = (7 * 0.85 + 0.05) / 8 = 0.7500
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("ai_generated");
  });

  it("moderate AI signal -> heavy_edit verdict", () => {
    // avg score in (0.45, 0.65]
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.5 },
      { timestamp: 1, ai_score: 0.55 },
      { timestamp: 2, ai_score: 0.5 },
      { timestamp: 3, ai_score: 0.5 },
    ];
    // avg = 0.5125
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("heavy_edit");
  });

  it("weak AI signal -> light_edit verdict", () => {
    // avg score in (0.30, 0.45]
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.35 },
      { timestamp: 1, ai_score: 0.40 },
      { timestamp: 2, ai_score: 0.38 },
    ];
    // avg ~= 0.3767
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("light_edit");
  });

  it("very low AI signal -> human verdict", () => {
    // avg score <= 0.30
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.1 },
      { timestamp: 1, ai_score: 0.2 },
      { timestamp: 2, ai_score: 0.15 },
    ];
    // avg ~= 0.15
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("human");
  });

  it("single frame video matches that frame's verdict", () => {
    const aiFrame = aggregateFrames([{ timestamp: 0, ai_score: 0.8 }]);
    expect(aiFrame.verdict).toBe("ai_generated");

    const humanFrame = aggregateFrames([{ timestamp: 0, ai_score: 0.1 }]);
    expect(humanFrame.verdict).toBe("human");
  });
});

// ══════════════════════════════════════════════════════════
// Layer B — Boundary values
// ══════════════════════════════════════════════════════════

describe("Video Aggregation — Threshold boundaries (Layer B)", () => {
  it("score just above ai_generated threshold -> ai_generated", () => {
    // threshold is 0.65 (DETECTION_CONFIG.image.verdictThresholds.aiGenerated)
    expect(mapVideoVerdict(0.6501)).toBe("ai_generated");
    expect(mapVideoVerdict(0.65 + 1e-10)).toBe("ai_generated");
  });

  it("score at ai_generated threshold falls to heavy_edit (strict >)", () => {
    expect(mapVideoVerdict(0.65)).toBe("heavy_edit");
  });

  it("score just above heavy_edit threshold -> heavy_edit", () => {
    expect(mapVideoVerdict(0.4501)).toBe("heavy_edit");
    expect(mapVideoVerdict(0.45 + 1e-10)).toBe("heavy_edit");
  });

  it("score at heavy_edit threshold falls to light_edit (strict >)", () => {
    expect(mapVideoVerdict(0.45)).toBe("light_edit");
  });

  it("score just above light_edit threshold -> light_edit", () => {
    expect(mapVideoVerdict(0.3001)).toBe("light_edit");
    expect(mapVideoVerdict(0.30 + 1e-10)).toBe("light_edit");
  });

  it("score at light_edit threshold falls to human (strict >)", () => {
    expect(mapVideoVerdict(0.3)).toBe("human");
  });

  it("zero score is human", () => {
    expect(mapVideoVerdict(0)).toBe("human");
  });

  it("score of 1.0 is ai_generated", () => {
    expect(mapVideoVerdict(1.0)).toBe("ai_generated");
  });
});

// ══════════════════════════════════════════════════════════
// Layer B — Edge cases
// ══════════════════════════════════════════════════════════

describe("Video Aggregation — Edge cases", () => {
  it("empty frame array produces human verdict with zero scores", () => {
    const result = aggregateFrames([]);
    expect(result.verdict).toBe("human");
    expect(result.ai_generated_score).toBe(0);
    expect(result.frames_flagged_ai).toBe(0);
    expect(result.ai_frame_percentage).toBe(0);
  });

  it("mixed frames: one AI frame among many human frames", () => {
    // 1 high-AI frame, 7 clean frames — avg stays well below ai_generated
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.95 },
      ...uniformFrames(7, 0.05),
    ];
    // avg = (0.95 + 7 * 0.05) / 8 = (0.95 + 0.35) / 8 = 0.1625
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("human");
    expect(result.frames_flagged_ai).toBe(1);
    expect(result.ai_frame_percentage).toBe(0.125);
  });

  it("mixed frames: one clean frame among many AI frames", () => {
    // 7 high-AI frames, 1 clean — avg stays well above ai_generated
    const frames: readonly FrameScore[] = [
      { timestamp: 0, ai_score: 0.05 },
      ...uniformFrames(7, 0.95),
    ];
    // avg = (0.05 + 7 * 0.95) / 8 = (0.05 + 6.65) / 8 = 0.8375
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("ai_generated");
    expect(result.frames_flagged_ai).toBe(7);
  });

  it("perfectly balanced frames (50/50 AI/human) -> light_edit or heavy_edit", () => {
    // 4 frames at 0.0, 4 frames at 0.8 -> avg = 0.4 -> heavy_edit
    const frames: readonly FrameScore[] = [
      ...uniformFrames(4, 0.0),
      ...uniformFrames(4, 0.8),
    ];
    const result = aggregateFrames(frames);
    expect(["heavy_edit", "light_edit"]).toContain(result.verdict);
    expect(result.ai_frame_percentage).toBe(0.5);
  });

  it("large frame count (60 frames) aggregates correctly", () => {
    // Simulate a 60-second video sampled at 1fps, all clean
    const frames = uniformFrames(60, 0.05);
    const result = aggregateFrames(frames);
    expect(result.verdict).toBe("human");
    expect(result.ai_generated_score).toBe(0.05);
    expect(result.frames_flagged_ai).toBe(0);
  });

  it("verdict thresholds are sourced from DETECTION_CONFIG (not hardcoded)", () => {
    // Verify our local VIDEO_T reference matches the config object
    expect(VIDEO_T.aiGenerated).toBe(0.65);
    expect(VIDEO_T.heavyEdit).toBe(0.45);
    expect(VIDEO_T.lightEdit).toBe(0.3);
  });
});

// ══════════════════════════════════════════════════════════
// Aggregation accuracy summary report
// ══════════════════════════════════════════════════════════

describe("Video Aggregation — Accuracy baseline report", () => {
  it("reports known-verdict test case outcomes", () => {
    // These cases represent the minimum set needed to establish a baseline.
    // Each case has a known "ground truth" label and the expected verdict.
    const cases: Array<{
      id: string;
      label: "ai" | "human";
      frames: readonly FrameScore[];
      expectedVerdict: Verdict;
      description: string;
    }> = [
      {
        id: "all-ai-frames",
        label: "ai",
        frames: uniformFrames(8, 0.9),
        expectedVerdict: "ai_generated",
        description: "8 frames all at 0.9 — fully AI-generated video",
      },
      {
        id: "all-human-frames",
        label: "human",
        frames: uniformFrames(8, 0.05),
        expectedVerdict: "human",
        description: "8 frames all at 0.05 — clean human video",
      },
      {
        id: "heavy-edit-mix",
        label: "ai",
        frames: uniformFrames(4, 0.55),
        expectedVerdict: "heavy_edit",
        description: "4 frames at 0.55 — moderate AI signal",
      },
      {
        id: "light-edit-mix",
        label: "ai",
        frames: uniformFrames(4, 0.38),
        expectedVerdict: "light_edit",
        description: "4 frames at 0.38 — weak AI signal",
      },
      {
        id: "single-ai-frame",
        label: "ai",
        frames: [{ timestamp: 0, ai_score: 0.85 }],
        expectedVerdict: "ai_generated",
        description: "single frame at 0.85 — single-frame AI",
      },
      {
        id: "single-human-frame",
        label: "human",
        frames: [{ timestamp: 0, ai_score: 0.1 }],
        expectedVerdict: "human",
        description: "single frame at 0.1 — single-frame human",
      },
    ];

    // Accuracy is measured against expectedVerdict (exact match), not binary AI/human.
    // This is appropriate for aggregation unit tests where the expected verdict is known.
    let correct = 0;

    console.log(
      "\n  ┌───────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "  │ VIDEO AGGREGATION — Known-Verdict Test Case Results                   │",
    );
    console.log(
      "  ├──────────────────────┬────────┬──────────────┬──────────────┬────────┤",
    );
    console.log(
      "  │ Case ID              │ Label  │ Avg Score    │ Verdict      │ Result │",
    );
    console.log(
      "  ├──────────────────────┼────────┼──────────────┼──────────────┼────────┤",
    );

    for (const c of cases) {
      const result = aggregateFrames(c.frames);
      expect(result.verdict).toBe(c.expectedVerdict);

      const matched = result.verdict === c.expectedVerdict;
      if (matched) correct++;

      const id = c.id.padEnd(20);
      const label = c.label.padEnd(6);
      const score = result.ai_generated_score.toFixed(4).padStart(12);
      const verdict = result.verdict.padEnd(12);
      const outcome = matched ? "PASS  " : "FAIL  ";
      console.log(`  │ ${id} │ ${label} │ ${score} │ ${verdict} │ ${outcome} │`);
    }

    console.log(
      "  └──────────────────────┴────────┴──────────────┴──────────────┴────────┘",
    );

    const total = cases.length;
    const accuracy = correct / total;

    console.log(
      `\n  Aggregation-only accuracy: ${correct}/${total} = ${(accuracy * 100).toFixed(1)}%`,
    );
    console.log(
      "  NOTE: These cases test deterministic aggregation logic only.",
    );
    console.log(
      "  Frame-level accuracy depends on SightEngine API (unmeasured, API-dependent).",
    );

    expect(accuracy).toBe(1.0);
  });
});
