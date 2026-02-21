import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return errorResponse("user_id required", 400);
  }

  const { data } = await supabase
    .from("exposure_scores")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) {
    return NextResponse.json({
      user_id: userId,
      score: 0,
      level: "Novice",
      scan_frequency: 0,
      platform_diversity: 0,
      streak_days: 0,
      total_ai_caught: 0,
      total_scans: 0,
    });
  }

  return NextResponse.json(data);
}
