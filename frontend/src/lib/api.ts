// frontend/src/lib/api.ts — Baloney API client

import type {
  ErrorResponse,
  DetectionResult,
  TextDetectionResult,
  ScansResponse,
  PersonalAnalytics,
  CommunityAnalytics,
  CommunityTrends,
  DomainLeaderboard,
  SharingToggleResponse,
  SharingStatus,
  SlopIndexEntry,
  ExposureScore,
  ContentProvenance,
  TrackerResponse,
} from "./types";

// ──────────────────────────────────────────────
// Error class
// ──────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: ErrorResponse | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ──────────────────────────────────────────────
// Fetch helper with timeout + typed errors
// ──────────────────────────────────────────────

async function fetchApi<T>(
  url: string,
  init?: RequestInit,
  timeoutMs = 10_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });

    if (!res.ok) {
      let body: ErrorResponse | null = null;
      try {
        body = await res.json();
      } catch {
        // non-JSON error body
      }
      throw new ApiError(
        body?.error ?? `Request failed: ${res.status}`,
        res.status,
        body,
      );
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ──────────────────────────────────────────────
// Detection endpoints
// ──────────────────────────────────────────────

export async function detectImage(
  base64Image: string,
  userId?: string,
  platform = "manual_upload",
): Promise<DetectionResult> {
  return fetchApi<DetectionResult>("/api/detect/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image, user_id: userId, platform }),
  });
}

export async function detectText(
  text: string,
  userId?: string,
  platform = "manual_upload",
): Promise<TextDetectionResult> {
  return fetchApi<TextDetectionResult>("/api/detect/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, user_id: userId, platform }),
  });
}

// ──────────────────────────────────────────────
// Scan history
// ──────────────────────────────────────────────

export async function getMyScans(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<ScansResponse> {
  return fetchApi<ScansResponse>(
    `/api/scans/me?user_id=${userId}&limit=${limit}&offset=${offset}`,
  );
}

// ──────────────────────────────────────────────
// Analytics
// ──────────────────────────────────────────────

export async function getPersonalAnalytics(
  userId: string,
): Promise<PersonalAnalytics> {
  return fetchApi<PersonalAnalytics>(
    `/api/analytics/personal?user_id=${userId}`,
  );
}

export async function getCommunityAnalytics(): Promise<CommunityAnalytics> {
  return fetchApi<CommunityAnalytics>("/api/analytics/community");
}

export async function getCommunityTrends(days = 30): Promise<CommunityTrends> {
  return fetchApi<CommunityTrends>(
    `/api/analytics/community/trends?days=${days}`,
  );
}

export async function getDomainLeaderboard(
  limit = 20,
): Promise<DomainLeaderboard> {
  return fetchApi<DomainLeaderboard>(
    `/api/analytics/community/domains?limit=${limit}`,
  );
}

// ──────────────────────────────────────────────
// Sharing
// ──────────────────────────────────────────────

export async function toggleSharing(
  userId: string,
  enabled: boolean,
): Promise<SharingToggleResponse> {
  return fetchApi<SharingToggleResponse>("/api/sharing/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, enabled }),
  });
}

export async function getSharingStatus(userId: string): Promise<SharingStatus> {
  return fetchApi<SharingStatus>(`/api/sharing/status?user_id=${userId}`);
}

// ──────────────────────────────────────────────
// Innovative Features
// ──────────────────────────────────────────────

export async function getSlopIndex(): Promise<SlopIndexEntry[]> {
  return fetchApi<SlopIndexEntry[]>("/api/slop-index");
}

export async function getExposureScore(userId: string): Promise<ExposureScore> {
  return fetchApi<ExposureScore>(`/api/exposure-score?user_id=${userId}`);
}

export async function getTopProvenance(
  limit = 20,
): Promise<ContentProvenance[]> {
  return fetchApi<ContentProvenance[]>(`/api/provenance?limit=${limit}`);
}

// ──────────────────────────────────────────────
// Tracker (AI Tracker dashboard)
// ──────────────────────────────────────────────

export async function getTrackerTrends(
  platform: string,
  contentType: string,
  days = 30,
): Promise<TrackerResponse> {
  return fetchApi<TrackerResponse>(
    `/api/analytics/tracker?platform=${platform}&content_type=${contentType}&days=${days}`,
  );
}
