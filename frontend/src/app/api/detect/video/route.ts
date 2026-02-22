import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { methodS_sightEngineVideo } from "@/lib/real-detectors";
import { errorResponse, validatePlatform } from "@/lib/api-utils";
import crypto from "crypto";
import type { VideoDetectionResult, Verdict } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { video, frames, user_id } = body;
    const platform = validatePlatform(body.platform);

    // v2.0: Accept either a single video base64 or an array of frame base64s
    const frameBase64s: string[] = [];

    if (Array.isArray(frames) && frames.length > 0) {
      // Multi-frame input (from extension v2.0)
      for (const frame of frames.slice(0, 8)) {
        if (typeof frame === "string" && frame.length > 0) {
          frameBase64s.push(frame);
        }
      }
    } else if (video && typeof video === "string") {
      // Single frame/poster input (legacy)
      frameBase64s.push(video);
    }

    if (frameBase64s.length === 0) {
      return errorResponse("No video or frames provided", 400);
    }

    const start = Date.now();

    // v3.0: Try SightEngine native video endpoint first (server-side analysis)
    let result: VideoDetectionResult | undefined;

    if (video && typeof video === "string") {
      try {
        const mimeMatch = video.match(/^data:(video\/[a-zA-Z0-9+]+);base64,/);
        const videoMime = mimeMatch ? mimeMatch[1] : "video/mp4";
        const raw = video.replace(/^data:video\/[a-zA-Z0-9+]+;base64,/, "");
        const videoBytes = Buffer.from(raw, "base64");
        const videoBlob = new Blob([new Uint8Array(videoBytes)], {
          type: videoMime,
        });
        const seResult = await methodS_sightEngineVideo(videoBlob);

        if (seResult) {
          const score = seResult.ai_generated_score;
          let verdict: Verdict;
          if (score > 0.65) verdict = "ai_generated";
          else if (score > 0.45) verdict = "heavy_edit";
          else if (score > 0.3) verdict = "light_edit";
          else verdict = "human";

          result = {
            verdict,
            confidence: parseFloat(score.toFixed(4)),
            frames_analyzed: seResult.frames.length,
            frames_flagged_ai: seResult.frames.filter((f) => f.ai_score > 0.5)
              .length,
            ai_frame_percentage:
              seResult.frames.length > 0
                ? parseFloat(
                    (
                      seResult.frames.filter((f) => f.ai_score > 0.5).length /
                      seResult.frames.length
                    ).toFixed(4),
                  )
                : 0,
            frame_scores: seResult.frames.map((f) =>
              parseFloat(f.ai_score.toFixed(4)),
            ),
            model_used: "sightengine:native-video",
            duration_seconds: 0,
            sightengine_native: true,
            primaryAvailable: true,
            method_scores: {
              sightengine_video: {
                score,
                weight: 1.0,
                label: "SightEngine Native Video",
                available: true,
                status: "success",
                tier: "primary",
              },
            },
          };
        }
      } catch (e) {
        console.warn(
          "[Baloney] SightEngine native video failed, falling back:",
          e,
        );
      }
    }

    // Fallback: analyze first frame as image when native video fails
    if (!result && frameBase64s.length > 0) {
      try {
        const { realImageDetection } = await import("@/lib/real-detectors");
        const imgResult = await realImageDetection(frameBase64s[0]);
        const score = imgResult.confidence;
        let verdict: Verdict;
        if (score > 0.65) verdict = "ai_generated";
        else if (score > 0.45) verdict = "heavy_edit";
        else if (score > 0.3) verdict = "light_edit";
        else verdict = "human";

        result = {
          verdict,
          confidence: parseFloat(score.toFixed(4)),
          frames_analyzed: 1,
          frames_flagged_ai: score > 0.5 ? 1 : 0,
          ai_frame_percentage: score > 0.5 ? 1 : 0,
          frame_scores: [parseFloat(score.toFixed(4))],
          model_used: `frame-fallback:${imgResult.model_used}`,
          duration_seconds: 0,
          sightengine_native: false,
          primaryAvailable: imgResult.primaryAvailable ?? true,
          method_scores: imgResult.method_scores
            ? Object.fromEntries(
                Object.entries(imgResult.method_scores).map(([k, v]) => [
                  k,
                  { ...v },
                ]),
              )
            : {},
        };
      } catch (e) {
        console.warn("[Baloney] Frame fallback also failed:", e);
      }
    }

    if (!result) {
      return errorResponse("Video detection unavailable", 500);
    }

    const duration = Date.now() - start;

    const contentHash = crypto
      .createHash("sha256")
      .update(frameBase64s[0].slice(0, 1000))
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
