import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAvailableMethods, getEdition } from "@/lib/edition";
import type { HealthResponse } from "@/lib/types";

export async function GET() {
  let status: HealthResponse["status"] = "ok";

  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) status = "degraded";
  } catch {
    status = "degraded";
  }

  const methods = getAvailableMethods();

  const response: HealthResponse & {
    edition: string;
    methods: ReturnType<typeof getAvailableMethods>;
  } = {
    status,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    edition: getEdition(),
    methods,
  };

  return NextResponse.json(response);
}
