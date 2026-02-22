import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse, clampInt } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return errorResponse("user_id required", 400);
  }

  const limit = clampInt(req.nextUrl.searchParams.get("limit"), 50, 1, 200);
  const offset = clampInt(req.nextUrl.searchParams.get("offset"), 0, 0, 10_000);

  const { data, count } = await supabase
    .from("scans")
    .select(
      "id, created_at, content_type, platform, verdict, confidence, model_used, source_domain, content_category, trust_score, edit_magnitude, scan_duration_ms",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const scans = (data ?? []).map((s) => ({
    ...s,
    timestamp: s.created_at,
  }));

  return NextResponse.json({
    scans,
    total: count ?? 0,
    limit,
    offset,
  });
}
