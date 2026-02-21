import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return errorResponse("user_id required", 400);
  }

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
