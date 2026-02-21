import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clampInt } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const days = clampInt(req.nextUrl.searchParams.get("days"), 30, 1, 365);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("v_community_trends")
    .select("*")
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: true });

  return NextResponse.json({ days, trends: data ?? [] });
}
