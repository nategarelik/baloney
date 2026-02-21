import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockTextResult } from "@/lib/mock-detectors";
import { errorResponse } from "@/lib/api-utils";
import { API_LIMITS } from "@/lib/constants";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, user_id, platform = "manual_upload" } = body;

    if (!text || typeof text !== "string") {
      return errorResponse("No text provided", 400);
    }

    if (text.length > API_LIMITS.TEXT_MAX_LENGTH) {
      return errorResponse(
        "Text too long",
        400,
        `Maximum length is ${API_LIMITS.TEXT_MAX_LENGTH} characters`
      );
    }

    const start = Date.now();
    const result = mockTextResult(text);
    const duration = Date.now() - start;

    const contentHash = crypto.createHash("sha256").update(text).digest("hex");

    if (user_id) {
      await supabase.rpc("record_scan_with_provenance", {
        p_user_id: user_id,
        p_content_type: "text",
        p_platform: platform,
        p_verdict: result.verdict,
        p_confidence: result.confidence,
        p_model_used: result.model_used,
        p_source_domain: platform + ".com",
        p_content_category: "text_post",
        p_content_hash: contentHash,
        p_scan_duration_ms: duration,
      });
    }

    return NextResponse.json({ ...result, scan_id: contentHash.slice(0, 8) });
  } catch (err) {
    console.error("Text detection error:", err);
    return errorResponse("Detection failed", 500);
  }
}
