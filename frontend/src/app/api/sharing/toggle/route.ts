import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-utils";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { enabled } = body;
  const userId = auth.userId;

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, sharing_enabled: !!enabled, updated_at: new Date().toISOString() }, { onConflict: "id" });

  if (error) {
    return errorResponse("Sharing update failed", 500, error.message);
  }

  return NextResponse.json({
    user_id: userId,
    sharing_enabled: !!enabled,
    message: `Community sharing ${enabled ? "enabled" : "disabled"}`,
  });
}
