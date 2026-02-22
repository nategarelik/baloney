import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: scans } = await supabase
    .from("scans")
    .select("platform, content_category, verdict");

  if (!scans || scans.length === 0) {
    return NextResponse.json([]);
  }

  // Group by platform + content_category
  const groups: Record<string, { total: number; ai_count: number }> = {};

  for (const s of scans) {
    const p = s.platform ?? "unknown";
    if (p === "demo_feed") continue;
    const cat = s.content_category ?? "uncategorized";
    const key = `${p}|${cat}`;
    if (!groups[key]) groups[key] = { total: 0, ai_count: 0 };
    groups[key].total++;
    if (s.verdict === "ai_generated" || s.verdict === "heavy_edit") {
      groups[key].ai_count++;
    }
  }

  const result = Object.entries(groups).map(([key, g]) => {
    const [platform, content_category] = key.split("|");
    return {
      platform,
      content_category,
      total: g.total,
      ai_count: g.ai_count,
      ai_rate: g.total > 0 ? Math.round((g.ai_count / g.total) * 100) : 0,
    };
  });

  return NextResponse.json(result);
}
