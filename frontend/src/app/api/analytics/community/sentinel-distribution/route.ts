import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: scores } = await supabase
    .from("exposure_scores")
    .select("score, level, total_ai_caught");

  if (!scores || scores.length === 0) {
    return NextResponse.json([]);
  }

  // Group by level, compute count and average AI caught
  const levels: Record<string, { count: number; total_ai_caught: number }> = {};

  for (const s of scores) {
    const level = s.level ?? "Novice";
    if (!levels[level]) levels[level] = { count: 0, total_ai_caught: 0 };
    levels[level].count++;
    levels[level].total_ai_caught += s.total_ai_caught ?? 0;
  }

  // Ensure consistent ordering
  const ORDER = ["Novice", "Aware", "Vigilant", "Guardian", "Sentinel"];

  const result = ORDER.filter((l) => levels[l]).map((level) => ({
    level,
    count: levels[level].count,
    avg_ai_caught: Math.round(
      levels[level].total_ai_caught / levels[level].count,
    ),
  }));

  return NextResponse.json(result);
}
