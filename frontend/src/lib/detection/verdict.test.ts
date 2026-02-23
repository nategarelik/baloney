// frontend/src/lib/detection/verdict.test.ts — Tests for verdict mapping

import { describe, it, expect } from "vitest";
import { mapVerdict, mapImageVerdict, buildFeatureVector } from "./verdict";
import type { StatisticalSignal } from "./statistical";

describe("mapVerdict", () => {
  it("should return ai_generated when probability > 0.75", () => {
    const result = mapVerdict(0.85, 500);
    expect(result.verdict).toBe("ai_generated");
    expect(result.confidence).toBeCloseTo(0.85, 4);
    expect(result.trust_score).toBeLessThan(0.3);
  });

  it("should return heavy_edit when probability is between 0.55 and 0.75", () => {
    const result = mapVerdict(0.65, 500);
    expect(result.verdict).toBe("heavy_edit");
    expect(result.confidence).toBeGreaterThan(0.6);
    expect(result.trust_score).toBeGreaterThan(0);
  });

  it("should return light_edit when probability is between 0.35 and 0.55", () => {
    const result = mapVerdict(0.45, 500);
    expect(result.verdict).toBe("light_edit");
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.trust_score).toBeGreaterThan(0);
  });

  it("should return human when probability < 0.35", () => {
    const result = mapVerdict(0.25, 500);
    expect(result.verdict).toBe("human");
    expect(result.confidence).toBeCloseTo(0.75, 2);
    expect(result.trust_score).toBeGreaterThan(0.75);
  });

  it("should include short text caveat for short text", () => {
    const result = mapVerdict(0.85, 150);
    expect(result.caveat).toContain("Short text");
  });

  it("should not include short text caveat for long text", () => {
    const result = mapVerdict(0.85, 500);
    expect(result.caveat).not.toContain("Short text");
  });

  it("should return confidence as precise value", () => {
    const result = mapVerdict(0.123456789, 500);
    expect(result.confidence).toBe(0.8765);
  });

  it("should handle boundary case at 0.75", () => {
    const result = mapVerdict(0.76, 500);
    expect(result.verdict).toBe("ai_generated");
  });

  it("should handle boundary case at 0.55", () => {
    const result = mapVerdict(0.56, 500);
    expect(result.verdict).toBe("heavy_edit");
  });

  it("should handle boundary case at 0.35", () => {
    const result = mapVerdict(0.36, 500);
    expect(result.verdict).toBe("light_edit");
  });

  it("should handle boundary case just below threshold", () => {
    const result = mapVerdict(0.74, 500);
    expect(result.verdict).toBe("heavy_edit");
  });

  it("should always have edit_magnitude and trust_score", () => {
    const result = mapVerdict(0.5, 500);
    expect(result.edit_magnitude).toBeGreaterThanOrEqual(0);
    expect(result.edit_magnitude).toBeLessThanOrEqual(1);
    expect(result.trust_score).toBeGreaterThanOrEqual(0);
    expect(result.trust_score).toBeLessThanOrEqual(1);
  });
});

describe("mapImageVerdict", () => {
  it("should return ai_generated for high scores", () => {
    const result = mapImageVerdict(0.8);
    expect(result.verdict).toBe("ai_generated");
    expect(result.confidence).toBeCloseTo(0.8, 4);
  });

  it("should return heavy_edit for medium-high scores", () => {
    const result = mapImageVerdict(0.55);
    expect(result.verdict).toBe("heavy_edit");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("should return light_edit for medium scores", () => {
    const result = mapImageVerdict(0.38);
    expect(result.verdict).toBe("light_edit");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("should return human for low scores", () => {
    const result = mapImageVerdict(0.15);
    expect(result.verdict).toBe("human");
    expect(result.confidence).toBeCloseTo(0.85, 2);
  });

  it("should handle boundary case at 0.65 (ai_generated threshold)", () => {
    const result = mapImageVerdict(0.66);
    expect(result.verdict).toBe("ai_generated");
  });

  it("should handle boundary case at 0.45 (heavy_edit threshold)", () => {
    const result = mapImageVerdict(0.46);
    expect(result.verdict).toBe("heavy_edit");
  });

  it("should handle boundary case at 0.3 (light_edit threshold)", () => {
    const result = mapImageVerdict(0.31);
    expect(result.verdict).toBe("light_edit");
  });

  it("should always return values in valid range", () => {
    const testScores = [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0];
    testScores.forEach((score) => {
      const result = mapImageVerdict(score);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.trust_score).toBeGreaterThanOrEqual(0);
      expect(result.trust_score).toBeLessThanOrEqual(1);
      expect(result.edit_magnitude).toBeGreaterThanOrEqual(0);
      expect(result.edit_magnitude).toBeLessThanOrEqual(1);
    });
  });
});

describe("buildFeatureVector", () => {
  it("should map statistical signal fields to feature vector", () => {
    const stats: StatisticalSignal = {
      burstiness: 0.5,
      ttr: 0.75,
      perplexityNorm: 0.6,
      repetition: 0.25,
      readability: 0.8,
      signal: 0.5,
    };

    const result = buildFeatureVector(stats);

    expect(result.burstiness).toBe(0.5);
    expect(result.type_token_ratio).toBe(0.75);
    expect(result.repetition_score).toBe(0.25);
  });

  it("should compute perplexity from perplexityNorm", () => {
    const stats: StatisticalSignal = {
      burstiness: 0,
      ttr: 0,
      perplexityNorm: 0.5,
      repetition: 0,
      readability: 0,
      signal: 0,
    };

    const result = buildFeatureVector(stats);
    // perplexity = perplexityNorm * 200 + 50 = 0.5 * 200 + 50 = 150
    expect(result.perplexity).toBe(150);
  });

  it("should handle edge case perplexityNorm values", () => {
    const stats: StatisticalSignal = {
      burstiness: 0,
      ttr: 0,
      perplexityNorm: 0,
      repetition: 0,
      readability: 0,
      signal: 0,
    };

    const result = buildFeatureVector(stats);
    // perplexity = 0 * 200 + 50 = 50
    expect(result.perplexity).toBe(50);
  });

  it("should round perplexity to 2 decimals", () => {
    const stats: StatisticalSignal = {
      burstiness: 0,
      ttr: 0,
      perplexityNorm: 0.333,
      repetition: 0,
      readability: 0,
      signal: 0,
    };

    const result = buildFeatureVector(stats);
    // perplexity = 0.333 * 200 + 50 = 116.6 → 116.6 (rounded to 2 decimals)
    expect(result.perplexity).toBeCloseTo(116.6, 2);
  });
});
