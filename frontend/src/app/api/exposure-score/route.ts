import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthError(auth)) return auth;

  const userId = auth.userId;

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
