import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: scans } = await supabase
    .from("scans")
    .select("content_type, platform, verdict");

  if (!scans || scans.length === 0) {
    return NextResponse.json({ nodes: [], links: [] });
  }

  // Count flows: content_type → platform → verdict
  const ctToPlatform: Record<string, number> = {};
  const platformToVerdict: Record<string, number> = {};

  const contentTypes = new Set<string>();
  const platforms = new Set<string>();
  const verdicts = new Set<string>();

  for (const s of scans) {
    const ct = s.content_type ?? "unknown";
    const p = s.platform ?? "unknown";
    const v = s.verdict ?? "unknown";

    contentTypes.add(ct);
    platforms.add(p);
    verdicts.add(v);

    const key1 = `${ct}→${p}`;
    ctToPlatform[key1] = (ctToPlatform[key1] ?? 0) + 1;

    const key2 = `${p}→${v}`;
    platformToVerdict[key2] = (platformToVerdict[key2] ?? 0) + 1;
  }

  // Build node list: [content_types..., platforms..., verdicts...]
  const ctArr = Array.from(contentTypes);
  const pArr = Array.from(platforms).filter((p) => p !== "demo_feed");
  const vArr = Array.from(verdicts);

  const nodes = [
    ...ctArr.map((name) => ({ name: name.charAt(0).toUpperCase() + name.slice(1) })),
    ...pArr.map((name) => ({
      name: name === "x" ? "X" : name === "manual_upload" ? "Upload" : name.charAt(0).toUpperCase() + name.slice(1),
    })),
    ...vArr.map((name) => ({
      name: name === "ai_generated" ? "AI" : name === "light_edit" ? "Light Edit" : name === "heavy_edit" ? "Heavy Edit" : "Human",
    })),
  ];

  // Build links with node indices
  const links = [];

  for (const [key, value] of Object.entries(ctToPlatform)) {
    const [ct, p] = key.split("→");
    if (p === "demo_feed") continue;
    const sourceIdx = ctArr.indexOf(ct);
    const targetIdx = ctArr.length + pArr.indexOf(p);
    if (sourceIdx >= 0 && targetIdx >= ctArr.length) {
      links.push({ source: sourceIdx, target: targetIdx, value });
    }
  }

  for (const [key, value] of Object.entries(platformToVerdict)) {
    const [p, v] = key.split("→");
    if (p === "demo_feed") continue;
    const sourceIdx = ctArr.length + pArr.indexOf(p);
    const targetIdx = ctArr.length + pArr.length + vArr.indexOf(v);
    if (sourceIdx >= ctArr.length && targetIdx >= ctArr.length + pArr.length) {
      links.push({ source: sourceIdx, target: targetIdx, value });
    }
  }

  return NextResponse.json({ nodes, links });
}
