import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ConfidenceLevel, PlatformBreakdown } from "@/lib/types";

function computeConfidenceLevel(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= 100) return "high";
  if (sampleSize >= 30) return "medium";
  if (sampleSize >= 10) return "low";
  return "insufficient";
}

export async function GET() {
  const [statsRes, platformRes, contentTypeRes] = await Promise.all([
    supabase.from("v_community_stats").select("*").single(),
    supabase.from("v_community_by_platform").select("*"),
    supabase.from("v_community_by_content_type").select("*"),
  ]);

  const stats = statsRes.data;

  const byPlatform: PlatformBreakdown[] = (platformRes.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row: any): PlatformBreakdown => {
      const sampleSize: number = row.total ?? 0;
      return {
        platform: row.platform,
        total: row.total,
        ai_count: row.ai_count,
        avg_ai_confidence: row.avg_ai_confidence,
        ai_rate: row.ai_rate,
        sample_size: sampleSize,
        confidence_level: computeConfidenceLevel(sampleSize),
      };
    },
  );

  return NextResponse.json({
    total_scans: stats?.total_scans ?? 0,
    total_users: stats?.total_users ?? 0,
    ai_rate: stats?.ai_rate ?? 0,
    by_platform: byPlatform,
    by_content_type: contentTypeRes.data ?? [],
  });
}
