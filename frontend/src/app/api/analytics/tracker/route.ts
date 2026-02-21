import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse, clampInt } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const platform = params.get("platform");
  const contentType = params.get("content_type");
  const days = clampInt(params.get("days"), 30, 1, 365);

  if (!platform) {
    return errorResponse("platform query parameter is required", 400);
  }
  if (!contentType) {
    return errorResponse("content_type query parameter is required", 400);
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDate = since.toISOString().split("T")[0];

  // Query scans table filtered by platform + content_type, grouped by day
  const { data, error } = await supabase.rpc("get_tracker_trends", {
    p_platform: platform,
    p_content_type: contentType,
    p_since: sinceDate,
  });

  // Fallback: if RPC doesn't exist, query directly
  if (error) {
    const { data: rawData, error: rawError } = await supabase
      .from("scans")
      .select("created_at, verdict")
      .eq("platform", platform)
      .eq("content_type", contentType)
      .gte("created_at", sinceDate)
      .order("created_at", { ascending: true });

    if (rawError) {
      return errorResponse("Failed to fetch tracker data", 500, rawError.message);
    }

    // Aggregate by date in JS
    const byDate = new Map<string, { total: number; ai_count: number }>();
    for (const row of rawData ?? []) {
      const date = row.created_at.split("T")[0];
      const entry = byDate.get(date) ?? { total: 0, ai_count: 0 };
      entry.total++;
      if (row.verdict === "ai_generated") entry.ai_count++;
      byDate.set(date, entry);
    }

    const trends = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { total, ai_count }]) => ({
        date,
        total,
        ai_count,
        ai_rate: total > 0 ? Math.round((ai_count / total) * 100) / 100 : 0,
      }));

    return NextResponse.json({ platform, content_type: contentType, days, trends });
  }

  return NextResponse.json({ platform, content_type: contentType, days, trends: data ?? [] });
}
