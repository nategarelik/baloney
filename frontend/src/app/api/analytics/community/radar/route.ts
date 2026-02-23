import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthError(auth)) return auth;

  // Get scans from last 30 days, grouped by platform
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: scans } = await supabase
    .from("scans")
    .select(
      "platform, verdict, confidence, content_type, content_category",
    )
    .gte("created_at", since.toISOString());

  if (!scans || scans.length === 0) {
    return NextResponse.json([]);
  }

  // Group by platform
  const byPlatform: Record<
    string,
    {
      total: number;
      ai_count: number;
      confidences: number[];
      content_types: Set<string>;
      verdicts: Record<string, number>;
    }
  > = {};

  for (const s of scans) {
    const p = s.platform ?? "unknown";
    if (!byPlatform[p]) {
      byPlatform[p] = {
        total: 0,
        ai_count: 0,
        confidences: [],
        content_types: new Set(),
        verdicts: {},
      };
    }
    const g = byPlatform[p];
    g.total++;
    if (s.verdict === "ai_generated" || s.verdict === "heavy_edit") {
      g.ai_count++;
    }
    g.confidences.push(s.confidence ?? 0);
    if (s.content_type) g.content_types.add(s.content_type);
    g.verdicts[s.verdict] = (g.verdicts[s.verdict] ?? 0) + 1;
  }

  // Find max scan volume for normalization
  const maxVolume = Math.max(...Object.values(byPlatform).map((g) => g.total));

  const result = Object.entries(byPlatform)
    .filter(([p]) => p !== "demo_feed")
    .map(([platform, g]) => {
      const avgConf =
        g.confidences.reduce((a, b) => a + b, 0) / g.confidences.length;
      // Content diversity: how many different content types (max 3: text/image/video)
      const contentDiversity = Math.min((g.content_types.size / 3) * 100, 100);
      // Scan volume normalized 0-100
      const scanVolume = maxVolume > 0 ? (g.total / maxVolume) * 100 : 0;
      // Consensus: how much do verdicts agree? Higher = more agreement
      const maxVerdictCount = Math.max(...Object.values(g.verdicts));
      const consensus = g.total > 0 ? (maxVerdictCount / g.total) * 100 : 0;

      return {
        platform,
        ai_rate: Math.round((g.ai_count / g.total) * 100),
        avg_confidence: Math.round(avgConf * 100),
        content_diversity: Math.round(contentDiversity),
        scan_volume: Math.round(scanVolume),
        consensus_strength: Math.round(consensus),
      };
    });

  return NextResponse.json(result);
}
