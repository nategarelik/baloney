import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Get all scans with timestamps from last 30 days
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: scans } = await supabase
    .from("scans")
    .select("created_at, verdict")
    .gte("created_at", since.toISOString());

  if (!scans || scans.length === 0) {
    return NextResponse.json([]);
  }

  // Build 7x24 grid: day-of-week x hour-of-day
  const grid: Record<string, { total: number; ai_count: number }> = {};

  for (const s of scans) {
    const d = new Date(s.created_at);
    const day = d.getUTCDay(); // 0=Sun, 6=Sat
    const hour = d.getUTCHours();
    const key = `${day}-${hour}`;
    if (!grid[key]) grid[key] = { total: 0, ai_count: 0 };
    grid[key].total++;
    if (s.verdict === "ai_generated" || s.verdict === "heavy_edit") {
      grid[key].ai_count++;
    }
  }

  // Emit all 168 cells (7 days * 24 hours)
  const cells = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const cell = grid[key] ?? { total: 0, ai_count: 0 };
      cells.push({
        day,
        hour,
        ai_rate: cell.total > 0 ? Math.round((cell.ai_count / cell.total) * 100) : 0,
        total: cell.total,
      });
    }
  }

  return NextResponse.json(cells);
}
