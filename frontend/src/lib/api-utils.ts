// frontend/src/lib/api-utils.ts — Shared utilities for API routes

import { NextResponse } from "next/server";

/** Standardized error JSON response */
export function errorResponse(
  error: string,
  status: number,
  details?: string
) {
  return NextResponse.json(
    { error, ...(details ? { details } : {}) },
    { status }
  );
}

/** Parse + clamp an integer query param */
export function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = parseInt(raw ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}
