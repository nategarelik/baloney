import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { realImageDetection } from "@/lib/real-detectors";
import { errorResponse, validatePlatform } from "@/lib/api-utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, user_id, source_domain = null } = body;
    const platform = validatePlatform(body.platform);

    if (!image || typeof image !== "string") {
      return errorResponse("No image provided", 400);
    }

    const start = Date.now();
    const result = await realImageDetection(image);
    const duration = Date.now() - start;

    // v2.0: Hash more of the image data for better deduplication
    // Use first 10000 chars to capture meaningful image content differences
    const contentHash = crypto
      .createHash("sha256")
      .update(image.slice(0, 10000))
      .digest("hex");

    if (user_id) {
      await supabase.rpc("record_scan_with_provenance", {
        p_user_id: user_id,
        p_content_type: "image",
        p_platform: platform,
        p_verdict: result.verdict,
        p_confidence: result.confidence,
        p_model_used: result.model_used,
        p_source_domain: source_domain,
        p_content_category: "photo",
        p_content_hash: contentHash,
        p_scan_duration_ms: duration,
        p_trust_score: result.trust_score,
        p_classification: result.classification,
        p_edit_magnitude: result.edit_magnitude,
      });

      // Recompute user scores (fire-and-forget, don't delay response)
      supabase.rpc("compute_exposure_score", { p_user_id: user_id }).then(
        () => {},
        () => {},
      );
      supabase
        .rpc("compute_information_diet_score", { p_user_id: user_id })
        .then(
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
    }

    return NextResponse.json({ ...result, scan_id: contentHash.slice(0, 8) });
  } catch (err) {
    console.error("Image detection error:", err);
    return errorResponse("Detection failed", 500);
  }
}
