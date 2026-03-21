// frontend/src/lib/real-detectors.ts — Facade re-exporting from focused modules.
// Existing imports of "@/lib/real-detectors" continue to work unchanged.
// Implementation lives in ./detectors/

export { realTextDetection } from "./detectors/text-detection";
export { realImageDetection, methodS_sightEngine, methodS_sightEngineURL, methodF_frequency, methodG_metadata } from "./detectors/image-detection";
export { methodS_sightEngineVideo } from "./detectors/video-detection";
export { methodD_statistical, buildFeatureVector } from "./detectors/statistical-analysis";
export { mapVerdict, mapImageVerdict } from "./detectors/verdict-mapper";
export type { VerdictMapping } from "./detectors/verdict-mapper";
export type { StatisticalSignal } from "./detectors/statistical-analysis";
export { clamp, precise, splitSentences, sentenceWordCounts, cosineSimilarity, standardDeviation } from "./detectors/detection-utils";
