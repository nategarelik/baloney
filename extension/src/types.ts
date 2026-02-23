// extension/src/types.ts — Shared type definitions for detection results

export interface FeatureVector {
  burstiness?: number;
  type_token_ratio?: number;
  perplexity?: number;
  repetition_score?: number;
}

export interface MethodScore {
  label: string;
  score: number;
  weight: number;
  available: boolean;
  status?: string;
  tier?: string;
}

export interface SentenceScore {
  text: string;
  ai_probability: number;
}

export interface DetectionResult {
  verdict: string;
  confidence: number;
  ai_probability?: number;
  model_used?: string;
  model?: string;
  caveat?: string;
  trust_score?: number;
  primary_score?: number;
  secondary_score?: number;
  edit_magnitude?: number;
  feature_vector?: FeatureVector;
  sentence_scores?: SentenceScore[];
  method_scores?: Record<string, MethodScore>;
  sourceUrl?: string;
  sourcePageUrl?: string;
  error?: string;
  ensemble_used?: boolean;
  primaryAvailable?: boolean;
  scan_id?: string;
  synthid_text_result?: string;
  pangram_windows?: PangramWindow[];
  // Video-specific
  frames_analyzed?: number;
  frames_flagged?: number;
  frames_flagged_ai?: number;
  frame_scores?: number[];
  ai_frame_percentage?: number;
  duration_seconds?: number;
}

export interface PangramWindow {
  start: number;
  end: number;
  classification?: string;
  confidence?: number;
  ai_assistance_score?: number;
}

export interface FlaggedItem {
  element: Element;
  verdict: string;
  preview: string;
}

export interface SessionStats {
  scanned: number;
  flaggedAI: number;
  textScanned: number;
  textFlagged: number;
}

export interface PageStat {
  images: number;
  text: number;
  flagged: number;
  lastScan: number;
}
