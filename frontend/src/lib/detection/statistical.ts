// frontend/src/lib/detection/statistical.ts — Statistical feature extraction (v2.0 — 12 features)

import type { TextStats, SentenceScore } from "@/lib/types";
import { DETECTION_CONFIG } from "@/lib/detection-config";
import { clamp, precise, splitSentences, sentenceWordCounts } from "./helpers";

export interface StatisticalSignal {
  burstiness: number;
  ttr: number;
  perplexityNorm: number;
  repetition: number;
  readability: number;
  signal: number;
}

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

  const burstiness = precise(Math.min(variance / N.burstinessScale, 1));
  const ttr = textStats.lexical_diversity;
  const perplexityNorm = precise(clamp(burstiness + (1 - ttr), 0, 1));
  const repetition = precise(clamp(1 - ttr, 0, 1));

  const sentLenSignal = precise(
    clamp(
      (textStats.avg_sentence_length - N.sentenceLengthOffset) /
        N.sentenceLengthScale,
      0,
      1,
    ),
  );

  const wordLenSignal = precise(
    clamp(
      (textStats.avg_word_length - N.wordLengthOffset) / N.wordLengthScale,
      0,
      1,
    ),
  );

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

  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length || 1;

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

  let hedgingCount = 0;
  for (const phrase of AI_HEDGING_PHRASES) {
    if (lowerText.includes(phrase)) hedgingCount++;
  }
  const hedgingSignal = precise(clamp(hedgingCount / N.hedgingScale, 0, 1));

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

export function scoreSentencesReal(
  text: string,
  aiProbability: number,
): SentenceScore[] {
  const SA = DETECTION_CONFIG.text.sentenceAdjustments;

  const sentences = splitSentences(text).filter((s) => s.length > 10);
  const wordCounts = sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length,
  );
  const avgLen =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;

  const sentenceAvgWordLens = sentences.map((s) => {
    const words = s.split(/\s+/).filter((w) => w.length > 0);
    return words.length > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / words.length
      : 0;
  });
  const overallAvgWordLen =
    sentenceAvgWordLens.length > 0
      ? sentenceAvgWordLens.reduce((a, b) => a + b, 0) /
        sentenceAvgWordLens.length
      : 0;

  let cursor = 0;
  return sentences.map((sentence, i) => {
    const startIndex = text.indexOf(sentence, cursor);
    const endIndex = startIndex + sentence.length;
    cursor = endIndex;

    let prob = aiProbability;
    const sentLen = wordCounts[i];
    const deviation = avgLen > 0 ? Math.abs(sentLen - avgLen) / avgLen : 0;

    if (deviation <= SA.uniformThreshold) {
      prob += SA.uniformBoost;
    } else if (deviation > SA.variableThreshold) {
      prob -= SA.variableReduction;
    } else {
      prob -= SA.moderateReduction;
    }

    const wordLenDev =
      overallAvgWordLen > 0
        ? Math.abs(sentenceAvgWordLens[i] - overallAvgWordLen) /
          overallAvgWordLen
        : 0;
    if (wordLenDev <= SA.wordLenUniformThreshold) {
      prob += SA.wordLenUniformBoost;
    } else if (wordLenDev > SA.wordLenVariableThreshold) {
      prob -= SA.wordLenVariableReduction;
    }

    const lowerSent = sentence.toLowerCase().trim();
    const startsWithTransition = AI_TRANSITION_PHRASES.some((p) =>
      lowerSent.startsWith(p),
    );
    if (startsWithTransition) {
      prob += SA.transitionStartBoost;
    }

    const commas = (sentence.match(/,/g) || []).length;
    if (sentLen > 0 && commas / sentLen > SA.commaHighDensityThreshold) {
      prob += SA.commaHighDensityBoost;
    }

    return {
      text: sentence,
      ai_probability: precise(clamp(prob, 0, 1)),
      start_index: startIndex,
      end_index: endIndex,
    };
  });
}
