import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { HealthResponse } from "@/lib/types";

export async function GET() {
  let status: HealthResponse["status"] = "ok";

  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) status = "degraded";
  } catch {
    status = "degraded";
  }

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  };

  return NextResponse.json(response);
}
