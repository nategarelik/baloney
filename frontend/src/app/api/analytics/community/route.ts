import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const [statsRes, platformRes, contentTypeRes] = await Promise.all([
    supabase.from("v_community_stats").select("*").single(),
    supabase.from("v_community_by_platform").select("*"),
    supabase.from("v_community_by_content_type").select("*"),
  ]);

  const stats = statsRes.data;

  return NextResponse.json({
    total_scans: stats?.total_scans ?? 0,
    total_users: stats?.total_users ?? 0,
    ai_rate: stats?.ai_rate ?? 0,
    by_platform: platformRes.data ?? [],
    by_content_type: contentTypeRes.data ?? [],
  });
}
