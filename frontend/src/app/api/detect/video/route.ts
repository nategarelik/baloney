import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockVideoResult } from "@/lib/mock-detectors";
import { errorResponse } from "@/lib/api-utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { video, user_id, platform = "manual_upload" } = body;

    if (!video || typeof video !== "string") {
      return errorResponse("No video provided", 400);
    }

    const start = Date.now();
    const result = mockVideoResult();
    const duration = Date.now() - start;

    const contentHash = crypto
      .createHash("sha256")
      .update(video.slice(0, 1000))
      .digest("hex");

    if (user_id) {
      await supabase.rpc("record_scan_with_provenance", {
        p_user_id: user_id,
        p_content_type: "video",
        p_platform: platform,
        p_verdict: result.verdict,
        p_confidence: result.confidence,
        p_model_used: result.model_used,
        p_source_domain: null,
        p_content_category: "video",
        p_content_hash: contentHash,
        p_scan_duration_ms: duration,
        p_trust_score: 1 - result.confidence,
        p_classification: result.verdict,
        p_edit_magnitude: result.ai_frame_percentage,
      });
    }

    return NextResponse.json({ ...result, scan_id: contentHash.slice(0, 8) });
  } catch (err) {
    console.error("Video detection error:", err);
    return errorResponse("Detection failed", 500);
  }
}
