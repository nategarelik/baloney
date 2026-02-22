import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clampInt } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const limit = clampInt(req.nextUrl.searchParams.get("limit"), 200, 1, 500);

  const { data, count } = await supabase
    .from("scans")
    .select(
      "id, created_at, content_type, platform, verdict, confidence, model_used, source_domain, content_category",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  const scans = (data ?? []).map((s) => ({
    ...s,
    timestamp: s.created_at,
  }));

  return NextResponse.json({
    scans,
    total: count ?? 0,
    limit,
    offset: 0,
  });
}
