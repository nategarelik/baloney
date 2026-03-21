import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ConfidenceLevel, SlopIndexEntry } from "@/lib/types";

function computeConfidenceLevel(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= 100) return "high";
  if (sampleSize >= 30) return "medium";
  if (sampleSize >= 10) return "low";
  return "insufficient";
}

export async function GET() {
  const { data } = await supabase.from("v_slop_index_latest").select("*");

  const entries: SlopIndexEntry[] = (data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row: any): SlopIndexEntry => {
      const sampleSize: number = row.total_scans_7d ?? 0;
      return {
        platform: row.platform,
        slop_score: row.slop_score,
        grade: row.grade,
        grade_label: row.grade_label,
        ai_rate_7d: row.ai_rate_7d,
        ai_rate_24h: row.ai_rate_24h,
        trend_direction: row.trend_direction,
        total_scans_7d: sampleSize,
        computed_at: row.computed_at,
        sample_size: sampleSize,
        confidence_level: computeConfidenceLevel(sampleSize),
        period: "last 7 days",
      };
    },
  );

  return NextResponse.json(entries);
}
