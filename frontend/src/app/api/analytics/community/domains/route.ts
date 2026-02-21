import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clampInt } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const limit = clampInt(req.nextUrl.searchParams.get("limit"), 20, 1, 200);

  const { data } = await supabase
    .from("v_domain_leaderboard")
    .select("*")
    .order("ai_rate", { ascending: false })
    .limit(limit);

  return NextResponse.json({ domains: data ?? [] });
}
