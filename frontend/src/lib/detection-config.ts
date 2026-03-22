// frontend/src/lib/detection-config.ts — Single source of truth for all detection constants
// Every value has a // Source: comment: "evaluation data", "published benchmark",
// "Flesch-Kincaid formula", or "heuristic"

export const DETECTION_CONFIG = {
  // ══════════════════════════════════════════════
  // TEXT DETECTION
  // ══════════════════════════════════════════════
  text: {
    // Verdict thresholds: score > threshold → that verdict
    verdictThresholds: {
      aiGenerated: 0.75, // Source: heuristic — tuned for 3% FPR
      heavyEdit: 0.55, // Source: heuristic
      lightEdit: 0.35, // Source: heuristic
    },

    // mapVerdict formula coefficients
    verdictFormulas: {
      aiGenerated: {
        trustScoreMultiplier: 0.95, // Source: heuristic — trust_score = 1 - prob * 0.95
        editMagnitudeBase: 0.8, // Source: heuristic — edit_mag = 0.8 + prob * 0.2
        editMagnitudeScale: 0.2, // Source: heuristic
      },
      heavyEdit: {
        confidenceBase: 0.6, // Source: heuristic — conf = 0.6 + (prob - 0.55) * 1.0
        confidenceScale: 1.0, // Source: heuristic
        trustScoreBase: 0.25, // Source: heuristic
        trustScoreScale: 1.0, // Source: heuristic
        editMagnitudeBase: 0.55, // Source: heuristic
        editMagnitudeScale: 1.25, // Source: heuristic
      },
      lightEdit: {
        confidenceBase: 0.5, // Source: heuristic — conf = 0.5 + (prob - 0.35) * 1.0
        confidenceScale: 1.0, // Source: heuristic
        trustScoreBase: 0.45, // Source: heuristic
        trustScoreScale: 1.0, // Source: heuristic
        editMagnitudeBase: 0.2, // Source: heuristic
        editMagnitudeScale: 1.75, // Source: heuristic
      },
      human: {
        trustScoreBase: 0.75, // Source: heuristic — trust = 0.75 + (0.35 - prob) * 0.66
        trustScoreScale: 0.66, // Source: heuristic
        editMagnitudeScale: 0.57, // Source: heuristic — edit_mag = prob * 0.57
      },
    },

    // Short text threshold for reduced confidence caveat
    shortTextThreshold: 200, // Source: heuristic — chars

    // Method D statistical feature weights (v2.0 — 12 features)
    statisticalWeights: {
      burstiness: 0.18, // Source: evaluation data — strongest discriminator
      sentenceLength: 0.14, // Source: evaluation data — AI avg 21.6 vs Human 12.5
      wordLength: 0.1, // Source: evaluation data — AI avg 6.28 vs Human 4.72
      readability: 0.08, // Source: evaluation data
      ttr: 0.05, // Source: evaluation data — type-token ratio
      perplexity: 0.05, // Source: evaluation data — perplexity proxy
      transition: 0.12, // Source: evaluation data — AI 2-3x more transition words
      hedging: 0.08, // Source: evaluation data — LLMs hedge more
      commaDensity: 0.05, // Source: evaluation data
      expressive: 0.05, // Source: evaluation data — low expressive punct = AI
      paragraphRepetition: 0.04, // Source: evaluation data
      bigramEntropy: 0.06, // Source: evaluation data — low entropy = AI
    },

    // Normalization constants for statistical features
    normalization: {
      burstinessScale: 100, // Source: heuristic — variance / 100
      sentenceLengthOffset: 10, // Source: heuristic — (avgSentLen - 10) / 15
      sentenceLengthScale: 15, // Source: heuristic
      wordLengthOffset: 4.0, // Source: heuristic — (avgWordLen - 4.0) / 3.0
      wordLengthScale: 3.0, // Source: heuristic
      syllableProxy: 0.4, // Source: Flesch-Kincaid formula — rough syllable proxy
      readabilityScale: 20, // Source: heuristic — fk / 20
      readabilityBreakpoint: 0.45, // Source: heuristic — fkNorm > 0.45 branching
      readabilityHighBase: 0.5, // Source: heuristic
      readabilityHighScale: 0.5, // Source: heuristic
      readabilityLowScale: 0.6, // Source: heuristic
      transitionRateScale: 25, // Source: heuristic — transitionRate * 25
      hedgingScale: 4, // Source: heuristic — hedgingCount / 4
      commaDensityOffset: 1.0, // Source: heuristic — (commasPerSent - 1.0) / 3.0
      commaDensityScale: 3.0, // Source: heuristic
      expressiveScale: 50, // Source: heuristic — expressiveRate * 50
    },

    // Flesch-Kincaid readability formula coefficients
    fleschKincaid: {
      sentenceCoeff: 0.39, // Source: Flesch-Kincaid formula
      syllableCoeff: 11.8, // Source: Flesch-Kincaid formula
      constant: -15.59, // Source: Flesch-Kincaid formula
    },

    // Sentence scoring adjustments
    sentenceAdjustments: {
      uniformBoost: 0.04, // Source: heuristic — deviation <= 0.25 → +0.04
      uniformThreshold: 0.25, // Source: heuristic
      variableReduction: 0.06, // Source: heuristic — deviation > 0.5 → -0.06
      variableThreshold: 0.5, // Source: heuristic
      moderateReduction: 0.02, // Source: heuristic — middle range → -0.02
      wordLenUniformBoost: 0.03, // Source: heuristic — wordLenDev <= 0.15 → +0.03
      wordLenUniformThreshold: 0.15, // Source: heuristic
      wordLenVariableReduction: 0.03, // Source: heuristic — wordLenDev > 0.3 → -0.03
      wordLenVariableThreshold: 0.3, // Source: heuristic
      transitionStartBoost: 0.05, // Source: heuristic — starts with transition → +0.05
      commaHighDensityBoost: 0.02, // Source: heuristic — commas/sentLen > 0.15 → +0.02
      commaHighDensityThreshold: 0.15, // Source: heuristic
    },

    // Pangram confidence map (High/Medium/Low → numeric)
    pangramConfidenceMap: {
      High: 0.9, // Source: heuristic
      Medium: 0.7, // Source: heuristic
      Low: 0.5, // Source: heuristic
    } as Record<string, number>,

    // SynthID text override probability
    synthidOverride: 0.97, // Source: heuristic — near-certain when watermark detected

    // Short text confidence scaling threshold
    shortTextScalingThreshold: 200, // Source: heuristic — text.length < 200 → scale down
  },

  // ══════════════════════════════════════════════
  // IMAGE DETECTION
  // ══════════════════════════════════════════════
  image: {
    // Verdict thresholds
    verdictThresholds: {
      aiGenerated: 0.65, // Source: heuristic — lower than text due to image noise
      heavyEdit: 0.45, // Source: heuristic
      lightEdit: 0.3, // Source: heuristic
    },

    // mapImageVerdict formula coefficients
    verdictFormulas: {
      aiGenerated: {
        trustScoreMultiplier: 0.95, // Source: heuristic
        editMagnitudeBase: 0.8, // Source: heuristic
        editMagnitudeScale: 0.2, // Source: heuristic
      },
      heavyEdit: {
        confidenceBase: 0.55, // Source: heuristic
        confidenceScale: 1.0, // Source: heuristic
        trustScoreBase: 0.3, // Source: heuristic
        trustScoreScale: 1.0, // Source: heuristic
        editMagnitudeBase: 0.5, // Source: heuristic
        editMagnitudeScale: 1.5, // Source: heuristic
      },
      lightEdit: {
        confidenceBase: 0.5, // Source: heuristic
        confidenceScale: 0.7, // Source: heuristic
        trustScoreBase: 0.5, // Source: heuristic
        trustScoreScale: 1.5, // Source: heuristic
        editMagnitudeBase: 0.2, // Source: heuristic
        editMagnitudeScale: 2.0, // Source: heuristic
      },
      human: {
        trustScoreBase: 0.8, // Source: heuristic
        trustScoreScale: 0.66, // Source: heuristic
        editMagnitudeScale: 0.5, // Source: heuristic
      },
    },

    // Method F frequency signal weights (5 signals with spectral slope)
    frequencyWeights: {
      withSlope: {
        uniformity: 0.25, // Source: heuristic
        smoothness: 0.2, // Source: heuristic
        dctRatio: 0.25, // Source: heuristic
        edge: 0.15, // Source: heuristic
        slope: 0.15, // Source: heuristic
      },
      fallback: {
        uniformity: 0.3, // Source: heuristic — when slope unavailable
        smoothness: 0.25, // Source: heuristic
        dctRatio: 0.25, // Source: heuristic
        edge: 0.2, // Source: heuristic
      },
    },

    // Method F normalization constants
    frequencyNormalization: {
      highFreqEnergyScale: 5, // Source: heuristic — highFreqEnergy * 5
      varianceOfVarianceScale: 1000, // Source: heuristic — varOfVar * 1000
      dctRatioScale: 2, // Source: heuristic — dctRatio * 2
      edgeDensityScale: 3, // Source: heuristic — edgeDensity * 3
      edgeThreshold: 0.08, // Source: heuristic — ~20/255 pixel difference
      slopeScale: 2, // Source: heuristic — slopeDiff * 2
      slopeBase: 0.5, // Source: heuristic — 0.5 - slopeDiff * 2
      analysisLengthCap: 20000, // Source: heuristic
      totalSamplesCap: 65536, // Source: heuristic
      dctSamplesCap: 32768, // Source: heuristic
      dctBlockSize: 8, // Source: JPEG standard — 8x8 blocks
      dctEpsilon: 0.001, // Source: heuristic — avoid division by zero
      windowSizes: [8, 16, 32] as readonly number[], // Source: heuristic — multi-scale
    },

    // Method G metadata scores
    metadata: {
      suspicion: {
        jpegNoExif: 0.2, // Source: heuristic — JPEG without EXIF
        noCamera: 0.08, // Source: heuristic — EXIF but no camera brand
        invalidTiff: 0.05, // Source: heuristic — bad EXIF structure
        softwareEditing: 0.03, // Source: heuristic — Photoshop/GIMP/Lightroom
        jfifNoExif: 0.05, // Source: heuristic — JFIF-only JPEG
        pngFormat: 0.08, // Source: heuristic — PNG uncommon from cameras
        aiSignature: 0.4, // Source: heuristic — SD/DALL-E/Midjourney metadata
        noTextMetadata: 0.03, // Source: heuristic — PNG without tEXt/iTXt
        webpFormat: 0.05, // Source: heuristic — WebP common from AI tools
        smallFile: 0.05, // Source: heuristic — < 5000 bytes
        sdxlSizeRange: 0.03, // Source: heuristic — 200-300KB typical SDXL output
      },
      authenticity: {
        camera: 0.15, // Source: heuristic — known camera brand in EXIF
        tiffHeader: 0.08, // Source: heuristic — proper TIFF structure
        gps: 0.05, // Source: heuristic — GPS data present
        c2pa: 0.2, // Source: heuristic — C2PA content credentials
      },
      authenticityWeight: 0.5, // Source: heuristic — finalScore = suspicion - authenticity * 0.5
      decodeFailScore: 0.3, // Source: heuristic — can't decode = suspicious
      smallFileThreshold: 5000, // Source: heuristic — bytes
      sdxlSizeRange: { min: 200, max: 300 }, // Source: heuristic — KB
    },

    // SynthID image override probability
    synthidOverride: 0.95, // Source: heuristic — slightly lower than text (visual uncertainty)

    // Local fallback weights when primary APIs unavailable
    localFallbackWeights: {
      frequency: 0.6, // Source: heuristic
      metadata: 0.4, // Source: heuristic
    },
  },

  // ══════════════════════════════════════════════
  // BAYESIAN POSTERIOR
  // ══════════════════════════════════════════════
  bayesian: {
    priors: {
      text: {
        accuracy: 0.673, // Source: evaluation data — 67.3% accuracy from vitest (205 samples)
        falsePositiveRate: 0.03, // Source: evaluation data — 3% FPR (97% specificity)
      },
      image: {
        accuracy: 0.85, // Source: heuristic — SightEngine ensemble
        falsePositiveRate: 0.10, // Source: heuristic
      },
      video: {
        accuracy: 0.80, // Source: heuristic — SightEngine native
        falsePositiveRate: 0.12, // Source: heuristic
      },
    },
    confidenceFloor: 0.60, // Source: heuristic — below this → "inconclusive"
    likelihoodHumanWeight: 0.1, // Source: heuristic — pScoreGivenHuman blend factor
  },

  // ══════════════════════════════════════════════
  // BENCHMARKS — Published accuracy claims with citations
  // ══════════════════════════════════════════════
  benchmarks: {
    pangram: {
      accuracy: 99.85, // Source: published benchmark — Emi & Spero 2024
      citation: "arXiv:2402.14873", // Source: published benchmark
    },
    sightEngine: {
      accuracy: 98.3, // Source: published benchmark — ARIA benchmark #1
      citation: "ARIA", // Source: published benchmark
    },
  },

  // ══════════════════════════════════════════════
  // EVALUATION — Our vitest results
  // ══════════════════════════════════════════════
  evaluation: {
    totalSamples: 205, // Source: evaluation data
    aiSamples: 105, // Source: evaluation data
    humanSamples: 100, // Source: evaluation data
    totalTests: 36, // Source: evaluation data
    totalPassed: 36, // Source: evaluation data
    testSuites: 10, // Source: evaluation data
    text: {
      precision: 93.2, // Source: evaluation data
      specificity: 97.0, // Source: evaluation data
      accuracy: 67.3, // Source: evaluation data
      recall: 39.0, // Source: evaluation data
      f1: 55.0, // Source: evaluation data
      cohensD: 1.197, // Source: evaluation data — large effect size
      effectSize: "LARGE" as const, // Source: evaluation data
      aiSignalMean: 0.5362, // Source: evaluation data
      humanSignalMean: 0.3413, // Source: evaluation data
      separation: 0.1949, // Source: evaluation data
    },
    image: {
      accuracy: 83.3, // Source: evaluation data
      smoothVsNoisy: { smooth: 0.9988, noisy: 0.2806 }, // Source: evaluation data
      avgAiFreq: 0.7325, // Source: evaluation data
      avgHumanFreq: 0.2744, // Source: evaluation data
    },
    // VIDEO — accuracy unmeasured; baseline pending API-dependent test infrastructure
    //
    // What we know from the code:
    //   Primary method: SightEngine native video endpoint (methodS_sightEngineVideo).
    //   Verdict mapping: uses image.verdictThresholds (0.65/0.45/0.30).
    //   Frame-level flag: ai_score > 0.5 counts as "flagged AI frame".
    //   Fallback: single-frame image analysis when native video API is unavailable.
    //
    // Aggregation logic is unit-tested in src/__tests__/video-aggregation.test.ts
    // (6 test suites, deterministic, no external API calls).
    //
    // To establish a real accuracy baseline, collect a labeled video dataset and
    // run it against the SightEngine video endpoint. Suggested minimum: 50 AI-generated
    // clips and 50 human-recorded clips, 5-30s each. Store clips in Supabase Storage
    // or an S3-compatible bucket and add an integration test suite that reads them
    // using TEST_VIDEO_BUCKET_URL + SIGHTENGINE_API_USER/SECRET env vars.
    video: {
      accuracy: null as null, // Source: unmeasured — API-dependent integration tests not yet implemented
      aggregationLogicTested: true, // Source: evaluation data — src/__tests__/video-aggregation.test.ts
      aggregationTestCases: 6, // Source: evaluation data — 6 test suites (30+ individual assertions)
      aggregationAccuracy: 100, // Source: evaluation data — all known-verdict aggregation cases pass
      primaryMethod: "sightengine:native-video", // Source: code — methodS_sightEngineVideo
      fallbackMethod: "frame-fallback:image-ensemble", // Source: code — realImageDetection on first frame
      // Thresholds used for verdict mapping (shared with image detection)
      verdictThresholds: {
        aiGenerated: 0.65, // Source: code — route.ts line 52, matches image.verdictThresholds.aiGenerated
        heavyEdit: 0.45,   // Source: code — route.ts line 53, matches image.verdictThresholds.heavyEdit
        lightEdit: 0.30,   // Source: code — route.ts line 54, matches image.verdictThresholds.lightEdit
        frameFlaggedAi: 0.50, // Source: code — route.ts line 61, frames with ai_score > 0.5 are "flagged"
      },
      // Baseline will be established when: SightEngine credentials + labeled video dataset in CI
      baselinePending: "API-dependent integration tests require labeled video clips and live credentials",
    },
    featureSeparation: [
      { feature: "Signal (composite)", aiMean: 0.5362, humanMean: 0.3413, delta: "+0.1949" },
      { feature: "Burstiness", aiMean: 0.5718, humanMean: 0.7805, delta: "-0.2087" },
      { feature: "Readability", aiMean: 0.9478, humanMean: 0.8074, delta: "+0.1404" },
      { feature: "Avg Sentence Len", aiMean: 20.79, humanMean: 16.04, delta: "+4.75" },
      { feature: "Avg Word Len", aiMean: 5.84, humanMean: 4.73, delta: "+1.11" },
      { feature: "Perplexity Norm", aiMean: 0.7397, humanMean: 0.9265, delta: "-0.1868" },
    ], // Source: evaluation data
    ensembleSensitivity: [
      { name: "Read-heavy", accuracy: 69.8, f1: 61.3 },
      { name: "Burst-heavy", accuracy: 66.3, f1: 54.3 },
      { name: "Current", accuracy: 67.3, f1: 55.0 },
      { name: "Equal weights", accuracy: 55.6, f1: 26.0 },
    ], // Source: evaluation data
    thresholdAnalysis: [
      { name: "Lenient (0.70/0.50/0.30)", accuracy: 69.3, fpRate: 8.0, fnRate: 52.4 },
      { name: "Current (0.75/0.55/0.35)", accuracy: 67.3, fpRate: 3.0, fnRate: 61.0 },
      { name: "Strict (0.80/0.60/0.40)", accuracy: 65.4, fpRate: 1.0, fnRate: 66.7 },
    ], // Source: evaluation data
  },

  // ══════════════════════════════════════════════
  // DISPLAY — Method weight labels for UI badges
  // ══════════════════════════════════════════════
  display: {
    textMethods: {
      pangram: { weight: 0.38, label: "Pangram (99.85%)" }, // Source: published benchmark
      synthidText: { weight: 0.07, label: "SynthID (Google Watermark)" }, // Source: heuristic
      statistical: { weight: 0.18, label: "Statistical (12 features)" }, // Source: evaluation data
    },
    imageMethods: {
      sightengine: { weight: 0.32, label: "SightEngine (98.3%)" }, // Source: published benchmark
      synthidImage: { weight: 0.1, label: "SynthID Image (Google)" }, // Source: heuristic
      frequency: { weight: 0.18, label: "Frequency/DCT Analysis" }, // Source: heuristic
      metadata: { weight: 0.13, label: "Metadata/EXIF/C2PA" }, // Source: heuristic
    },
  },

  // ══════════════════════════════════════════════
  // UI — Score color thresholds, dots, features
  // ══════════════════════════════════════════════
  ui: {
    scoreColors: {
      highThreshold: 0.65, // Source: heuristic — above = red (#d4456b)
      midThreshold: 0.35, // Source: heuristic — above = amber (#f59e0b)
      // below midThreshold = green (#16a34a)
    },
    dotColors: {
      highConfidence: 0.8, // Source: heuristic — conf >= 0.8 → red dot
      mediumConfidence: 0.7, // Source: heuristic — conf >= 0.7 → orange dot
      // below → amber dot
      opacityBase: 0.55, // Source: heuristic — min opacity
      opacityScale: 0.3, // Source: heuristic — + confidence * 0.3
      opacityMax: 0.85, // Source: heuristic — capped
      visibilityThreshold: 0.5, // Source: heuristic — show dot if conf >= 0.5
    },
    sentenceColoring: {
      highAiThreshold: 0.6, // Source: heuristic — > 0.6 → red
      moderateAiThreshold: 0.4, // Source: heuristic — > 0.4 → amber
    },
    featureThresholds: {
      burstinessLow: 0.2, // Source: heuristic — < 0.2 = "Very uniform" (AI)
      burstinessHigh: 0.5, // Source: heuristic — > 0.5 = "Varied rhythm" (human)
      ttrLow: 0.4, // Source: heuristic — < 0.4 = "Repetitive" (AI)
      ttrHigh: 0.7, // Source: heuristic — > 0.7 = "Diverse" (human)
      perplexityLow: 80, // Source: heuristic — < 80 = "Predictable" (AI)
      perplexityHigh: 150, // Source: heuristic — > 150 = "Unpredictable" (human)
      repetitionHigh: 0.6, // Source: heuristic — > 0.6 = "High repeat" (AI)
    },
  },

  // ══════════════════════════════════════════════
  // TIMEOUTS — API timeout values in milliseconds
  // ══════════════════════════════════════════════
  timeouts: {
    pangram: 10000, // Source: heuristic — 10s
    sightEngine: 10000, // Source: heuristic — 10s
    sightEngineUrl: 10000, // Source: heuristic — 10s
    sightEngineVideo: 30000, // Source: heuristic — 30s
    synthidText: 15000, // Source: heuristic — 15s
    synthidImage: 15000, // Source: heuristic — 15s
    backend: 30000, // Source: heuristic — 30s
  },
} as const;
