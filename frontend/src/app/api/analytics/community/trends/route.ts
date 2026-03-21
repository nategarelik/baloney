import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clampInt } from "@/lib/api-utils";
import type { ConfidenceLevel, SampleMetadata, TrendDay } from "@/lib/types";

function computeConfidenceLevel(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= 100) return "high";
  if (sampleSize >= 30) return "medium";
  if (sampleSize >= 10) return "low";
  return "insufficient";
}

function buildSampleMetadata(
  trends: TrendDay[],
  days: number,
): SampleMetadata {
  const totalScans = trends.reduce((sum, t) => sum + t.total, 0);
  return {
    sample_size: totalScans,
    confidence_level: computeConfidenceLevel(totalScans),
    period: `last ${days} days`,
  };
}

export async function GET(req: NextRequest) {
  const days = clampInt(req.nextUrl.searchParams.get("days"), 30, 1, 365);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("v_community_trends")
    .select("*")
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: true });

  const trends: TrendDay[] = data ?? [];

  return NextResponse.json({
    days,
    trends,
    sample_metadata: buildSampleMetadata(trends, days),
  });
}
