// METHOD D: Statistical Feature Extraction (v2.0 — 12 features)
// Burstiness, TTR, readability, perplexity proxy, n-gram entropy,
// transition word frequency, punctuation patterns, hedging language
// (Spec §3.1 Method D, enhanced v2.0)

import type { TextStats, FeatureVector } from "../types";
import { DETECTION_CONFIG } from "../detection-config";
import { clamp, precise, sentenceWordCounts } from "./detection-utils";

export interface StatisticalSignal {
  burstiness: number;
  ttr: number;
  perplexityNorm: number;
  repetition: number;
  readability: number;
  signal: number;
}

// v2.0: Common AI transition words/phrases — LLMs overuse these
const AI_TRANSITION_PHRASES = [
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "nevertheless",
  "in conclusion",
  "it is important to note",
  "it's worth noting",
  "it is worth noting",
  "it should be noted",
  "in other words",
  "on the other hand",
  "as a result",
  "in addition",
  "for instance",
  "in summary",
  "to summarize",
  "overall",
  "ultimately",
  "essentially",
  "specifically",
  "significantly",
  "notably",
  "importantly",
  "interestingly",
  "remarkably",
  "particularly",
  "fundamentally",
];

// v2.0: Hedging phrases common in LLM output
const AI_HEDGING_PHRASES = [
  "it's important to",
  "it is important to",
  "it's worth",
  "it is worth",
  "it's crucial",
  "it is crucial",
  "it's essential",
  "it is essential",
  "there are several",
  "there are many",
  "there are various",
  "can be considered",
  "may be considered",
  "could potentially",
  "it depends on",
  "this can vary",
  "in many cases",
  "in some cases",
];

export { AI_TRANSITION_PHRASES };

export function methodD_statistical(
  text: string,
  textStats: TextStats,
): StatisticalSignal {
  const W = DETECTION_CONFIG.text.statisticalWeights;
  const N = DETECTION_CONFIG.text.normalization;
  const FK = DETECTION_CONFIG.text.fleschKincaid;

  const wordCounts = sentenceWordCounts(text);
  const mean =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;
  const variance =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        wordCounts.length
      : 0;

  // Burstiness: Human text has high variance in sentence length
  // Test data: AI avg 0.35, Human avg 0.73 — strongest discriminator
  const burstiness = precise(Math.min(variance / N.burstinessScale, 1));

  // Type-Token Ratio: AI tends toward ~0.55 TTR
  const ttr = textStats.lexical_diversity;

  // Perplexity proxy: combination of burstiness + vocabulary spread
  const perplexityNorm = precise(clamp(burstiness + (1 - ttr), 0, 1));

  // Repetition score
  const repetition = precise(clamp(1 - ttr, 0, 1));

  // Sentence length signal: AI text has much longer sentences (avg ~21 words)
  // vs human text (avg ~12 words).
  // Test data: AI avg 21.6, Human avg 12.5
  const sentLenSignal = precise(
    clamp(
      (textStats.avg_sentence_length - N.sentenceLengthOffset) /
        N.sentenceLengthScale,
      0,
      1,
    ),
  );

  // Word length signal: AI text uses longer words (avg ~6.3 chars)
  // vs human text (avg ~4.7 chars).
  // Test data: AI avg 6.28, Human avg 4.72
  const wordLenSignal = precise(
    clamp(
      (textStats.avg_word_length - N.wordLengthOffset) / N.wordLengthScale,
      0,
      1,
    ),
  );

  // Flesch-Kincaid readability approximation
  // AI clusters at higher grade levels due to longer sentences + bigger words
  const avgSyllables = textStats.avg_word_length * N.syllableProxy;
  const fk =
    FK.sentenceCoeff * textStats.avg_sentence_length +
    FK.syllableCoeff * avgSyllables +
    FK.constant;
  const fkNorm = clamp(fk / N.readabilityScale, 0, 1);
  const readability =
    fkNorm > N.readabilityBreakpoint
      ? precise(N.readabilityHighBase + fkNorm * N.readabilityHighScale)
      : precise(fkNorm * N.readabilityLowScale);

  // ── v2.0: New statistical features ──

  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length || 1;

  // v2.0 Feature 1: Transition word frequency
  // AI text uses 2-3x more transition words than human text
  let transitionCount = 0;
  for (const phrase of AI_TRANSITION_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) transitionCount += matches.length;
  }
  const transitionRate = transitionCount / totalWords;
  const transitionSignal = precise(
    clamp(transitionRate * N.transitionRateScale, 0, 1),
  );

  // v2.0 Feature 2: Hedging phrase frequency
  // LLMs systematically hedge more than human writers
  let hedgingCount = 0;
  for (const phrase of AI_HEDGING_PHRASES) {
    if (lowerText.includes(phrase)) hedgingCount++;
  }
  const hedgingSignal = precise(clamp(hedgingCount / N.hedgingScale, 0, 1));

  // v2.0 Feature 3: Punctuation pattern analysis
  // AI text: fewer em-dashes, exclamation marks, parentheticals
  // AI text: more commas per sentence, more semicolons
  const commaCount = (text.match(/,/g) || []).length;
  const commasPerSentence =
    textStats.sentence_count > 0 ? commaCount / textStats.sentence_count : 0;
  const commaDensitySignal = precise(
    clamp(
      (commasPerSentence - N.commaDensityOffset) / N.commaDensityScale,
      0,
      1,
    ),
  );

  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const emDashCount = (text.match(/[—–-]{2,}|—/g) || []).length;
  const expressiveRate =
    (exclamationCount + questionCount + emDashCount) / totalWords;
  const expressiveSignal = precise(
    clamp(1 - expressiveRate * N.expressiveScale, 0, 1),
  );

  // v2.0 Feature 4: Paragraph opening patterns
  // AI tends to start paragraphs with similar structures
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  let sameStartCount = 0;
  if (paragraphs.length > 1) {
    const firstWords = paragraphs.map((p) => {
      const firstWord = p
        .trim()
        .split(/\s+/)[0]
        ?.toLowerCase()
        .replace(/[^a-z]/g, "");
      return firstWord;
    });
    const wordFreq: Record<string, number> = {};
    for (const w of firstWords) {
      if (w) wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
    const maxFreq = Math.max(...Object.values(wordFreq), 0);
    sameStartCount = maxFreq;
  }
  const paragraphRepetitionSignal =
    paragraphs.length > 2
      ? precise(clamp((sameStartCount - 1) / (paragraphs.length - 1), 0, 1))
      : 0;

  // v2.0 Feature 5: Bigram entropy (word-pair predictability)
  // AI text has lower bigram entropy — more predictable word sequences
  const bigrams: Record<string, number> = {};
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""));
  for (let i = 0; i < lowerWords.length - 1; i++) {
    const bg = lowerWords[i] + " " + lowerWords[i + 1];
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }
  const bigramTotal = Math.max(
    Object.values(bigrams).reduce((a, b) => a + b, 0),
    1,
  );
  let bigramEntropy = 0;
  for (const count of Object.values(bigrams)) {
    const p = count / bigramTotal;
    if (p > 0) bigramEntropy -= p * Math.log2(p);
  }
  const maxBigramEntropy = Math.log2(bigramTotal);
  const normalizedBigramEntropy =
    maxBigramEntropy > 0 ? bigramEntropy / maxBigramEntropy : 0.5;
  const entropySignal = precise(clamp(1 - normalizedBigramEntropy, 0, 1));

  // Combined statistical AI signal — v2.0 weights with new features
  const signal = precise(
    (1 - burstiness) * W.burstiness +
      sentLenSignal * W.sentenceLength +
      wordLenSignal * W.wordLength +
      readability * W.readability +
      (1 - ttr) * W.ttr +
      (1 - perplexityNorm) * W.perplexity +
      transitionSignal * W.transition +
      hedgingSignal * W.hedging +
      commaDensitySignal * W.commaDensity +
      expressiveSignal * W.expressive +
      paragraphRepetitionSignal * W.paragraphRepetition +
      entropySignal * W.bigramEntropy,
  );

  return { burstiness, ttr, perplexityNorm, repetition, readability, signal };
}

export function buildFeatureVector(stats: StatisticalSignal): FeatureVector {
  return {
    burstiness: stats.burstiness,
    type_token_ratio: stats.ttr,
    perplexity: precise(stats.perplexityNorm * 200 + 50, 2),
    repetition_score: stats.repetition,
  };
}
