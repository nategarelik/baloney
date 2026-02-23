import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clampInt } from "@/lib/api-utils";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthError(auth)) return auth;

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
