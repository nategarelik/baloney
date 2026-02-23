// frontend/src/lib/detection/helpers.ts — Shared utility functions

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function precise(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/([!?])/g, "$1|")
    .split(/[.|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function sentenceWordCounts(text: string): number[] {
  const sentences = text
    .replace(/[!?]/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length,
  );
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}
