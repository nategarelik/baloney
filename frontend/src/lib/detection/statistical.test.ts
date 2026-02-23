// frontend/src/lib/detection/statistical.test.ts — Tests for statistical feature extraction

import { describe, it, expect } from "vitest";
import { methodD_statistical } from "./statistical";
import type { TextStats } from "@/lib/types";

function createMockTextStats(overrides?: Partial<TextStats>): TextStats {
  return {
    word_count: 100,
    sentence_count: 5,
    avg_word_length: 5.0,
    avg_sentence_length: 20,
    lexical_diversity: 0.7,
    ...overrides,
  };
}

describe("methodD_statistical", () => {
  it("should return all expected fields", () => {
    const text = "This is a test sentence. It should work properly. Testing is important.";
    const stats = createMockTextStats();

    const result = methodD_statistical(text, stats);

    expect(result).toHaveProperty("burstiness");
    expect(result).toHaveProperty("ttr");
    expect(result).toHaveProperty("perplexityNorm");
    expect(result).toHaveProperty("repetition");
    expect(result).toHaveProperty("readability");
    expect(result).toHaveProperty("signal");
  });

  it("should detect AI-like patterns in repetitive text", () => {
    const aiText = `
      Moreover, it is important to note that the system works efficiently.
      Furthermore, it is crucial to understand the underlying mechanisms.
      Additionally, it is worth noting that performance remains consistent.
      Consequently, it is essential to maintain optimal configurations.
    `.trim();

    const stats = createMockTextStats({
      avg_sentence_length: 22,
      avg_word_length: 6.5,
      lexical_diversity: 0.45,
    });

    const result = methodD_statistical(aiText, stats);

    // AI text should have:
    // - Low burstiness (uniform sentence length)
    // - Low TTR (repetitive vocabulary)
    // - High signal (composite AI score)
    expect(result.burstiness).toBeLessThan(0.5);
    expect(result.ttr).toBeLessThan(0.6);
    expect(result.signal).toBeGreaterThan(0.4);
  });

  it("should detect human-like patterns in varied text", () => {
    const humanText = `
      Great! But why? I think it's cool.
      Really long sentence here with lots of different words and varied structure that humans tend to write naturally without thinking too much about uniformity.
      Short one.
      Medium length sentence here.
    `.trim();

    const stats = createMockTextStats({
      avg_sentence_length: 15,
      avg_word_length: 4.5,
      lexical_diversity: 0.85,
    });

    const result = methodD_statistical(humanText, stats);

    // Human text should have:
    // - High burstiness (varied sentence length)
    // - High TTR (diverse vocabulary)
    // - Lower signal (less AI-like)
    expect(result.burstiness).toBeGreaterThan(0.3);
    expect(result.ttr).toBeGreaterThan(0.7);
  });

  it("should handle empty text gracefully", () => {
    const text = "";
    const stats = createMockTextStats({
      word_count: 0,
      sentence_count: 0,
    });

    const result = methodD_statistical(text, stats);

    expect(result).toBeDefined();
    expect(result.signal).toBeGreaterThanOrEqual(0);
    expect(result.signal).toBeLessThanOrEqual(1);
  });

  it("should handle single-word text", () => {
    const text = "Hello";
    const stats = createMockTextStats({
      word_count: 1,
      sentence_count: 1,
      avg_word_length: 5,
      avg_sentence_length: 1,
      lexical_diversity: 1.0,
    });

    const result = methodD_statistical(text, stats);

    expect(result).toBeDefined();
    expect(result.burstiness).toBe(0);
    expect(result.signal).toBeGreaterThanOrEqual(0);
  });

  it("should return values in expected ranges (0-1 for normalized fields)", () => {
    const text = "This is a normal sentence. It has multiple words. Testing the range of values.";
    const stats = createMockTextStats();

    const result = methodD_statistical(text, stats);

    expect(result.burstiness).toBeGreaterThanOrEqual(0);
    expect(result.burstiness).toBeLessThanOrEqual(1);

    expect(result.ttr).toBeGreaterThanOrEqual(0);
    expect(result.ttr).toBeLessThanOrEqual(1);

    expect(result.perplexityNorm).toBeGreaterThanOrEqual(0);
    expect(result.perplexityNorm).toBeLessThanOrEqual(1);

    expect(result.repetition).toBeGreaterThanOrEqual(0);
    expect(result.repetition).toBeLessThanOrEqual(1);

    expect(result.readability).toBeGreaterThanOrEqual(0);
    expect(result.readability).toBeLessThanOrEqual(1);

    expect(result.signal).toBeGreaterThanOrEqual(0);
    expect(result.signal).toBeLessThanOrEqual(1);
  });

  it("should use lexical_diversity as ttr", () => {
    const text = "Test sentence here.";
    const stats = createMockTextStats({
      lexical_diversity: 0.8,
    });

    const result = methodD_statistical(text, stats);

    expect(result.ttr).toBe(0.8);
  });

  it("should calculate repetition as inverse of ttr", () => {
    const text = "Test sentence here.";
    const stats = createMockTextStats({
      lexical_diversity: 0.6,
    });

    const result = methodD_statistical(text, stats);

    // repetition = clamp(1 - ttr, 0, 1)
    expect(result.repetition).toBeCloseTo(0.4, 4);
  });

  it("should handle text with AI transition phrases", () => {
    const text = "Moreover, this is important. Furthermore, we should consider this.";
    const stats = createMockTextStats();

    const result = methodD_statistical(text, stats);

    // Should detect transition phrases and increase AI signal
    expect(result.signal).toBeGreaterThan(0.2);
  });

  it("should handle text with high lexical diversity", () => {
    const text = "Quick brown fox jumps lazy dog. Amazing sentence variety here.";
    const stats = createMockTextStats({
      lexical_diversity: 0.95,
    });

    const result = methodD_statistical(text, stats);

    expect(result.ttr).toBe(0.95);
    expect(result.repetition).toBeCloseTo(0.05, 4);
  });

  it("should handle text with low lexical diversity", () => {
    const text = "The the the the the. The the the the.";
    const stats = createMockTextStats({
      lexical_diversity: 0.2,
    });

    const result = methodD_statistical(text, stats);

    expect(result.ttr).toBe(0.2);
    expect(result.repetition).toBeCloseTo(0.8, 4);
  });
});
