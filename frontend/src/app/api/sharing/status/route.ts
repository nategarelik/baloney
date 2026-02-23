import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthError(auth)) return auth;

  const userId = auth.userId;

  const { data } = await supabase
    .from("profiles")
    .select("id, sharing_enabled")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    user_id: userId,
    sharing_enabled: data?.sharing_enabled ?? false,
    exists: !!data,
  });
}
