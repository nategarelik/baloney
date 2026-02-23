// frontend/src/lib/api-utils.ts — Shared utilities for API routes

import { NextResponse } from "next/server";

/** Standardized error JSON response — details only sent in development */
export function errorResponse(error: string, status: number, details?: string) {
  const isDev = process.env.NODE_ENV === "development";
  if (details && !isDev) {
    console.error(`[API Error] ${error}: ${details}`);
  }
  return NextResponse.json(
    { error, ...(isDev && details ? { details } : {}) },
    { status },
  );
}

const VALID_PLATFORMS = new Set([
  "instagram",
  "x",
  "manual_upload",
  "demo_feed",
  "tiktok",
  "reddit",
  "facebook",
  "linkedin",
  "medium",
  "substack",
  "threads",
  "bluesky",
  "mastodon",
  "hackernews",
  "other",
]);

/** Validate platform against allowed values, defaulting to "manual_upload" */
export function validatePlatform(platform: unknown): string {
  if (typeof platform === "string" && VALID_PLATFORMS.has(platform)) {
    return platform;
  }
  return "manual_upload";
}

/** Parse + clamp an integer query param */
export function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = parseInt(raw ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}
