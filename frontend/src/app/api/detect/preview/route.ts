import { NextRequest, NextResponse } from "next/server";
import { mockTextResult } from "@/lib/mock-detectors";
import { errorResponse } from "@/lib/api-utils";
import { API_LIMITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, platform } = body;

    if (!text || typeof text !== "string") {
      return errorResponse("No text provided", 400);
    }

    if (text.length > API_LIMITS.TEXT_MAX_LENGTH) {
      return errorResponse("Text too long", 400, `Maximum length is ${API_LIMITS.TEXT_MAX_LENGTH} characters`);
    }

    // Preview mode: detect WITHOUT recording to Supabase
    const result = mockTextResult(text);

    return NextResponse.json({ ...result, platform: platform || "unknown", preview: true });
  } catch (err) {
    console.error("Preview detection error:", err);
    return errorResponse("Preview detection failed", 500);
  }
}
