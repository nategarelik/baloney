// frontend/src/lib/detection/helpers.test.ts — Tests for helper functions

import { describe, it, expect } from "vitest";
import {
  clamp,
  precise,
  splitSentences,
  sentenceWordCounts,
  cosineSimilarity,
  standardDeviation,
} from "./helpers";

describe("clamp", () => {
  it("should return value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it("should return min when value is below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(-0.1, 0, 1)).toBe(0);
  });

  it("should return max when value is above max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(1.5, 0, 1)).toBe(1);
  });

  it("should handle exact boundary values", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("precise", () => {
  it("should round to 4 decimals by default", () => {
    expect(precise(0.123456789)).toBe(0.1235);
    expect(precise(1.999999)).toBe(2.0);
  });

  it("should round to custom decimals when specified", () => {
    expect(precise(0.123456789, 2)).toBe(0.12);
    expect(precise(0.123456789, 6)).toBe(0.123457);
  });

  it("should handle integer input", () => {
    expect(precise(5)).toBe(5);
    expect(precise(5, 2)).toBe(5);
  });

  it("should handle zero", () => {
    expect(precise(0)).toBe(0);
    expect(precise(0.0000001, 4)).toBe(0);
  });
});

describe("splitSentences", () => {
  it("should split basic sentences on period", () => {
    const result = splitSentences("First sentence. Second sentence. Third.");
    expect(result).toEqual(["First sentence", "Second sentence", "Third"]);
  });

  it("should handle exclamation marks", () => {
    const result = splitSentences("Hello! How are you! Great!");
    expect(result).toEqual(["Hello!", "How are you!", "Great!"]);
  });

  it("should handle question marks", () => {
    const result = splitSentences("What? Where? When?");
    expect(result).toEqual(["What?", "Where?", "When?"]);
  });

  it("should handle mixed punctuation", () => {
    const result = splitSentences("Statement. Question? Exclamation!");
    expect(result).toEqual(["Statement", "Question?", "Exclamation!"]);
  });

  it("should filter empty strings", () => {
    const result = splitSentences("First..Second...Third");
    expect(result).toEqual(["First", "Second", "Third"]);
  });

  it("should trim whitespace", () => {
    const result = splitSentences("  First.   Second  .  Third  ");
    expect(result).toEqual(["First", "Second", "Third"]);
  });

  it("should handle multiple consecutive exclamation/question marks", () => {
    const result = splitSentences("Really?? Wow!!! Yes.");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("sentenceWordCounts", () => {
  it("should count words in basic sentences", () => {
    const result = sentenceWordCounts("Hello world. This is a test.");
    expect(result).toEqual([2, 4]);
  });

  it("should handle single word sentences", () => {
    const result = sentenceWordCounts("Hello. World. Test.");
    expect(result).toEqual([1, 1, 1]);
  });

  it("should handle empty text", () => {
    const result = sentenceWordCounts("");
    expect(result).toEqual([]);
  });

  it("should filter empty sentences", () => {
    const result = sentenceWordCounts("First sentence..Second sentence");
    expect(result).toHaveLength(2);
  });

  it("should handle multiple spaces between words", () => {
    const result = sentenceWordCounts("Hello   world.  Multiple    spaces   here.");
    expect(result).toEqual([2, 3]);
  });

  it("should handle exclamation and question marks", () => {
    const result = sentenceWordCounts("Hello! How are you? I am fine.");
    expect(result).toEqual([1, 3, 3]);
  });
});

describe("cosineSimilarity", () => {
  it("should return 1 for identical vectors", () => {
    const result = cosineSimilarity([1, 2, 3], [1, 2, 3]);
    expect(result).toBe(1);
  });

  it("should return 0 for orthogonal vectors", () => {
    const result = cosineSimilarity([1, 0], [0, 1]);
    expect(result).toBe(0);
  });

  it("should return 0 for zero vectors", () => {
    const result = cosineSimilarity([0, 0, 0], [1, 2, 3]);
    expect(result).toBe(0);
  });

  it("should return -1 for opposite vectors", () => {
    const result = cosineSimilarity([1, 2, 3], [-1, -2, -3]);
    expect(result).toBe(-1);
  });

  it("should handle fractional similarity", () => {
    const result = cosineSimilarity([1, 1], [1, 0]);
    expect(result).toBeCloseTo(0.7071, 4);
  });

  it("should be symmetric", () => {
    const a = [2, 3, 4];
    const b = [5, 6, 7];
    expect(cosineSimilarity(a, b)).toBe(cosineSimilarity(b, a));
  });
});

describe("standardDeviation", () => {
  it("should return 0 for all same values", () => {
    expect(standardDeviation([5, 5, 5, 5, 5])).toBe(0);
  });

  it("should calculate standard deviation for known values", () => {
    // Dataset: [2, 4, 4, 4, 5, 5, 7, 9]
    // Mean: 5
    // Variance: 4
    // Std dev: 2
    const result = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(result).toBeCloseTo(2, 4);
  });

  it("should return 0 for single element", () => {
    expect(standardDeviation([42])).toBe(0);
  });

  it("should return 0 for empty array", () => {
    expect(standardDeviation([])).toBe(0);
  });

  it("should handle two elements", () => {
    // [10, 20], mean=15, variance=25, std=5
    const result = standardDeviation([10, 20]);
    expect(result).toBeCloseTo(5, 4);
  });

  it("should handle negative values", () => {
    // [-1, 0, 1], mean=0, variance=2/3, std=sqrt(2/3)≈0.8165
    const result = standardDeviation([-1, 0, 1]);
    expect(result).toBeCloseTo(0.8165, 4);
  });
});
