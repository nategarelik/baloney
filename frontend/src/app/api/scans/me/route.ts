import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clampInt } from "@/lib/api-utils";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthError(auth)) return auth;

  const userId = auth.userId;
  const limit = clampInt(req.nextUrl.searchParams.get("limit"), 50, 1, 200);
  const offset = clampInt(req.nextUrl.searchParams.get("offset"), 0, 0, 10_000);

  const { data, count } = await supabase
    .from("scans")
    .select(
      "id, created_at, content_type, platform, verdict, confidence, model_used, source_domain, content_category, trust_score, edit_magnitude, scan_duration_ms",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const scans = (data ?? []).map((s) => ({
    ...s,
    timestamp: s.created_at,
  }));

  return NextResponse.json({
    scans,
    total: count ?? 0,
    limit,
    offset,
  });
}
