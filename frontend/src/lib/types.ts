// frontend/src/lib/types.ts — Baloney type system

export type Verdict = "human" | "light_edit" | "heavy_edit" | "ai_generated";

export type Platform =
  | "instagram"
  | "x"
  | "manual_upload"
  | "demo_feed"
  | "tiktok"
  | "reddit"
  | "facebook";

export type ContentType = "image" | "text" | "video";

// ──────────────────────────────────────────────
// Detection responses (from /api/detect/*)
// ──────────────────────────────────────────────

export interface SentenceScore {
  text: string;
  ai_probability: number;
  start_index: number;
  end_index: number;
}

export interface FeatureVector {
  burstiness: number;
  type_token_ratio: number;
  perplexity: number;
  repetition_score: number;
}

export interface DetectionResult {
  verdict: Verdict;
  confidence: number;
  primary_score: number;
  secondary_score: number;
  model_used: string;
  ensemble_used: boolean;
  trust_score: number;
  classification: Verdict;
  edit_magnitude: number;
  scan_id?: string;
  method_scores?: Record<string, MethodScore>;
  primaryAvailable?: boolean;
  confidenceCapped?: boolean;
}

export interface MethodScore {
  score: number;
  weight: number;
  label: string;
  available: boolean;
  status?: "success" | "unavailable" | "rate_limited" | "error" | "not_run";
  tier?: "primary" | "fallback" | "watermark" | "escalation";
}

export interface PangramWindow {
  start: number;
  end: number;
  ai_assistance_score: number;
  classification: string;
  confidence: number;
}

export interface TextDetectionResult {
  verdict: Verdict;
  confidence: number;
  ai_probability: number;
  model_used: string;
  text_stats: TextStats;
  caveat: string | null;
  trust_score: number;
  classification: Verdict;
  edit_magnitude: number;
  feature_vector: FeatureVector;
  sentence_scores: SentenceScore[];
  scan_id?: string;
  method_scores?: Record<string, MethodScore>;
  primaryAvailable?: boolean;
  confidenceCapped?: boolean;
  pangram_classification?: string;
  pangram_windows?: PangramWindow[];
  synthid_text_result?: "watermarked" | "not_watermarked" | "uncertain" | null;
}

export interface TextStats {
  word_count: number;
  sentence_count: number;
  avg_word_length: number;
  avg_sentence_length: number;
  lexical_diversity: number;
}

export interface VideoDetectionResult {
  verdict: Verdict;
  confidence: number;
  frames_analyzed: number;
  frames_flagged_ai: number;
  ai_frame_percentage: number;
  frame_scores: number[];
  model_used: string;
  duration_seconds: number;
  scan_id?: string;
  method_scores?: Record<string, MethodScore>;
  primaryAvailable?: boolean;
  confidenceCapped?: boolean;
  sightengine_native?: boolean;
}

// ──────────────────────────────────────────────
// Scan history (from /api/scans/me)
// ──────────────────────────────────────────────

export interface ScanRecord {
  id: string;
  timestamp: string;
  content_type: ContentType;
  platform: Platform;
  verdict: Verdict;
  confidence: number;
  model_used: string;
  source_domain: string | null;
  content_category: string | null;
  content_hash: string | null;
  scan_duration_ms: number | null;
  trust_score: number | null;
  edit_magnitude: number | null;
}

export interface ScansResponse {
  scans: ScanRecord[];
  total: number;
  limit: number;
  offset: number;
}

// ──────────────────────────────────────────────
// Analytics (from /api/analytics/*)
// ──────────────────────────────────────────────

export interface PlatformBreakdown {
  platform: string;
  total: number;
  ai_count: number;
  avg_ai_confidence?: number;
  ai_rate?: number;
}

export interface ContentTypeBreakdown {
  content_type: string;
  total: number;
  ai_count: number;
}

export interface VerdictBreakdown {
  verdict: Verdict;
  count: number;
}

export interface PersonalAnalytics {
  total_scans: number;
  ai_exposure_rate: number;
  by_platform: PlatformBreakdown[];
  by_content_type: ContentTypeBreakdown[];
  by_verdict: VerdictBreakdown[];
}

export interface CommunityAnalytics {
  total_scans: number;
  total_users: number;
  ai_rate: number;
  by_platform: PlatformBreakdown[];
  by_content_type: ContentTypeBreakdown[];
}

export interface TrendDay {
  date: string;
  total: number;
  ai_count: number;
  ai_rate: number;
}

export interface CommunityTrends {
  days: number;
  trends: TrendDay[];
}

export interface DomainEntry {
  source_domain: string;
  total: number;
  ai_count: number;
  ai_rate: number;
}

export interface DomainLeaderboard {
  domains: DomainEntry[];
}

// ──────────────────────────────────────────────
// Sharing (from /api/sharing/*)
// ──────────────────────────────────────────────

export interface SharingStatus {
  user_id: string;
  sharing_enabled: boolean;
  exists: boolean;
}

export interface SharingToggleResponse {
  user_id: string;
  sharing_enabled: boolean;
  message: string;
}

// ──────────────────────────────────────────────
// Innovative Features
// ──────────────────────────────────────────────

export interface SlopIndexEntry {
  platform: string;
  slop_score: number;
  grade: string;
  grade_label: string;
  ai_rate_7d: number;
  ai_rate_24h: number;
  trend_direction: "rising" | "falling" | "stable";
  total_scans_7d: number;
  computed_at: string;
}

export interface ExposureScore {
  user_id: string;
  score: number;
  level: "Novice" | "Aware" | "Vigilant" | "Guardian" | "Sentinel";
  scan_frequency: number;
  platform_diversity: number;
  streak_days: number;
  total_ai_caught: number;
  total_scans: number;
}

export interface ContentProvenance {
  content_hash: string;
  sighting_count: number;
  compound_score: number;
  compound_verdict: Verdict;
  ai_votes: number;
  human_votes: number;
  platforms: string[];
  first_seen: string;
  last_seen: string;
}

export interface InformationDietScore {
  user_id: string;
  score: number;
  letter_grade: string;
  ai_content_ratio: number;
  source_diversity: number;
  trend_direction: number;
  awareness_actions: number;
  computed_at: string;
}

// ──────────────────────────────────────────────
// Tracker (from /api/analytics/tracker)
// ──────────────────────────────────────────────

export interface TrackerResponse {
  platform: string;
  content_type: string;
  days: number;
  trends: TrendDay[];
}

// ──────────────────────────────────────────────
// Dashboard Visualizations
// ──────────────────────────────────────────────

export interface RadarAxisData {
  platform: string;
  ai_rate: number;
  avg_confidence: number;
  content_diversity: number;
  scan_volume: number;
  consensus_strength: number;
}

export interface HeatmapCell {
  day: number; // 0=Sun, 6=Sat
  hour: number; // 0–23
  ai_rate: number;
  total: number;
}

export interface FlowNode {
  name: string;
}

export interface FlowLink {
  source: number;
  target: number;
  value: number;
}

export interface FlowData {
  nodes: FlowNode[];
  links: FlowLink[];
}

export interface TreemapEntry {
  platform: string;
  content_category: string;
  total: number;
  ai_count: number;
  ai_rate: number;
}

export interface SentinelLevel {
  level: string;
  count: number;
  avg_ai_caught: number;
}

// ──────────────────────────────────────────────
// Error and health responses (from /api/*)
// ──────────────────────────────────────────────

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
}

// ──────────────────────────────────────────────
// Feed (curated demo posts)
// ──────────────────────────────────────────────

export interface FeedPostData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  platform: "instagram" | "x";
  timestamp: string;
  imageUrl: string;
  caption: string;
  isAiGenerated: boolean;
  expectedConfidence: number;
}
