// frontend/src/lib/mock-detectors.ts — Text stats utility
// Mock detection functions have been removed. Only computeTextStats() remains
// as it is used by the real detection pipeline in real-detectors.ts.

import type { TextStats } from "./types";

export function computeTextStats(text: string): TextStats {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text
    .replace(/!/g, ".")
    .replace(/\?/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[.,!?;:"'()]/g, "")),
  );

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgWordLength =
    wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0;

  return {
    word_count: wordCount,
    sentence_count: sentenceCount,
    lexical_diversity: parseFloat(lexicalDiversity.toFixed(4)),
    avg_sentence_length: parseFloat(avgSentenceLength.toFixed(1)),
    avg_word_length: parseFloat(avgWordLength.toFixed(1)),
  };
}
