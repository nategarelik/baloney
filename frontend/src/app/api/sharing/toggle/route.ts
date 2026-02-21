import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, enabled } = body;

  if (!user_id) {
    return errorResponse("user_id required", 400);
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user_id, sharing_enabled: !!enabled, updated_at: new Date().toISOString() }, { onConflict: "id" });

  if (error) {
    return errorResponse("Sharing update failed", 500, error.message);
  }

  return NextResponse.json({
    user_id,
    sharing_enabled: !!enabled,
    message: `Community sharing ${enabled ? "enabled" : "disabled"}`,
  });
}
