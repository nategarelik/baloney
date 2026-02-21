import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockImageResult } from "@/lib/mock-detectors";
import { errorResponse } from "@/lib/api-utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, user_id, platform = "manual_upload" } = body;

    if (!image || typeof image !== "string") {
      return errorResponse("No image provided", 400);
    }

    const start = Date.now();
    const result = mockImageResult(platform);
    const duration = Date.now() - start;

    const contentHash = crypto.createHash("sha256").update(image.slice(0, 1000)).digest("hex");

    if (user_id) {
      await supabase.rpc("record_scan_with_provenance", {
        p_user_id: user_id,
        p_content_type: "image",
        p_platform: platform,
        p_verdict: result.verdict,
        p_confidence: result.confidence,
        p_model_used: result.model_used,
        p_source_domain: null,
        p_content_category: "photo",
        p_content_hash: contentHash,
        p_scan_duration_ms: duration,
        p_trust_score: result.trust_score,
        p_classification: result.classification,
        p_edit_magnitude: result.edit_magnitude,
      });
    }

    return NextResponse.json({ ...result, scan_id: contentHash.slice(0, 8) });
  } catch (err) {
    console.error("Image detection error:", err);
    return errorResponse("Detection failed", 500);
  }
}
