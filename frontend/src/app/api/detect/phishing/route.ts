import { NextRequest, NextResponse } from "next/server";
import { classifyPhishing } from "@/lib/phishing-detector";
import { errorResponse } from "@/lib/api-utils";

const MAX_HTML_LENGTH = 2_000_000; // 2MB max HTML input

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { html, url } = body;

    if (!html || typeof html !== "string") {
      return errorResponse("No HTML provided", 400);
    }

    if (html.length > MAX_HTML_LENGTH) {
      return errorResponse(
        "HTML too large",
        400,
        `Maximum size is ${MAX_HTML_LENGTH} characters`
      );
    }

    if (url && typeof url !== "string") {
      return errorResponse("URL must be a string", 400);
    }

    const result = classifyPhishing(html, url || undefined);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Phishing detection error:", err);
    return errorResponse("Phishing detection failed", 500);
  }
}
