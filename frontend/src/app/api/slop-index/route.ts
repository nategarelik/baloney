import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { data } = await supabase
    .from("v_slop_index_latest")
    .select("*");

  return NextResponse.json(data ?? []);
}
