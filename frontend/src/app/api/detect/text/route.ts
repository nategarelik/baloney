import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { realTextDetection } from "@/lib/real-detectors";
import { errorResponse, validatePlatform } from "@/lib/api-utils";
import { requireAuth, isAuthError } from "@/lib/auth";
import { API_LIMITS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (isAuthError(auth)) return auth;

    const body = await req.json();
    const { text } = body;
    const platform = validatePlatform(body.platform);
    const userId = auth.userId;

    if (!text || typeof text !== "string") {
      return errorResponse("No text provided", 400);
    }

    if (text.length > API_LIMITS.TEXT_MAX_LENGTH) {
      return errorResponse(
        "Text too long",
        400,
        `Maximum length is ${API_LIMITS.TEXT_MAX_LENGTH} characters`,
      );
    }

    const start = Date.now();
    const result = await realTextDetection(text);
    const duration = Date.now() - start;

    const contentHash = crypto.createHash("sha256").update(text).digest("hex");

    await supabase.rpc("record_scan_with_provenance", {
      p_user_id: userId,
      p_content_type: "text",
      p_platform: platform,
      p_verdict: result.verdict,
      p_confidence: result.confidence,
      p_model_used: result.model_used,
      p_source_domain: platform + ".com",
      p_content_category: "text_post",
      p_content_hash: contentHash,
      p_scan_duration_ms: duration,
      p_trust_score: result.trust_score,
      p_classification: result.classification,
      p_edit_magnitude: result.edit_magnitude,
    });

    // Recompute user scores (fire-and-forget, don't delay response)
    supabase.rpc("compute_exposure_score", { p_user_id: userId }).then(
      () => {},
      () => {},
    );
    // Recompute slop index ~10% of scans to avoid DB load
    if (Math.random() < 0.1) {
      supabase.rpc("compute_slop_index").then(
        () => {},
        () => {},
      );
    }

    return NextResponse.json({ ...result, scan_id: contentHash.slice(0, 8) });
  } catch (err) {
    logger.error("detect/text", "Text detection failed", err);
    return errorResponse("Detection failed", 500);
  }
}
