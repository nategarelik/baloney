import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return errorResponse("user_id required", 400);
  }

  const [statsRes, platformRes, contentTypeRes, verdictRes] = await Promise.all([
    supabase.from("v_personal_stats").select("*").eq("user_id", userId).single(),
    supabase.from("v_personal_by_platform").select("*").eq("user_id", userId),
    supabase.from("v_personal_by_content_type").select("*").eq("user_id", userId),
    supabase.from("v_personal_by_verdict").select("*").eq("user_id", userId),
  ]);

  const stats = statsRes.data;

  return NextResponse.json({
    total_scans: stats?.total_scans ?? 0,
    ai_exposure_rate: stats?.ai_exposure_rate ?? 0,
    by_platform: platformRes.data ?? [],
    by_content_type: contentTypeRes.data ?? [],
    by_verdict: verdictRes.data ?? [],
  });
}
