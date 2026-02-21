import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return errorResponse("user_id is required", 400);
  }

  try {
    const { data, error } = await supabase
      .from("information_diet_scores")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({
        user_id: userId,
        score: 0,
        letter_grade: "C",
        ai_content_ratio: 0,
        source_diversity: 0,
        trend_direction: 0,
        awareness_actions: 0,
        computed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Information diet score error:", err);
    return errorResponse("Failed to fetch information diet score", 500);
  }
}
