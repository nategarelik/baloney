import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

const SEED_SECRET = process.env.SEED_SECRET || "trustlens-hackathon-2026";

const PLATFORMS: Record<string, { weight: number; ai_rate: number }> = {
  instagram: { weight: 0.45, ai_rate: 0.35 },
  x: { weight: 0.30, ai_rate: 0.25 },
  manual_upload: { weight: 0.15, ai_rate: 0.50 },
  demo_feed: { weight: 0.10, ai_rate: 0.40 },
};

const DOMAINS: Record<string, { weight: number; ai_rate: number }> = {
  "cdninstagram.com": { weight: 0.35, ai_rate: 0.35 },
  "pbs.twimg.com": { weight: 0.25, ai_rate: 0.25 },
  "i.redd.it": { weight: 0.10, ai_rate: 0.45 },
  "pbs.medium.com": { weight: 0.08, ai_rate: 0.20 },
  "images.unsplash.com": { weight: 0.07, ai_rate: 0.05 },
  "cdn.deviantart.net": { weight: 0.05, ai_rate: 0.60 },
  "artstation.com": { weight: 0.05, ai_rate: 0.55 },
  "upload.wikimedia.org": { weight: 0.05, ai_rate: 0.03 },
};

const CONTENT_TYPES: Record<string, number> = {
  image: 0.70,
  text: 0.25,
  video: 0.05,
};

const MODELS: Record<string, string> = {
  image: "Organika/sdxl-detector",
  text: "Hello-SimpleAI/chatgpt-detector-roberta",
  video: "per-frame:Organika/sdxl-detector",
};

function weightedChoice<T extends Record<string, { weight: number } | number>>(options: T): string {
  const keys = Object.keys(options);
  const weights = keys.map((k) => {
    const v = options[k];
    return typeof v === "number" ? v : (v as { weight: number }).weight;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < keys.length; i++) {
    r -= weights[i];
    if (r <= 0) return keys[i];
  }
  return keys[keys.length - 1];
}

interface ScanRow {
  user_id: string;
  created_at: string;
  content_type: string;
  platform: string;
  verdict: string;
  confidence: number;
  model_used: string;
  source_domain: string | null;
  content_category: string;
  content_hash: string | null;
  scan_duration_ms: number;
}

function generateScan(userId: string, daysAgo: number): ScanRow {
  const contentType = weightedChoice(CONTENT_TYPES);
  const platform = weightedChoice(PLATFORMS);

  const timeBoost = Math.max(0, (30 - daysAgo) / 30) * 0.10;
  const aiRate = (PLATFORMS[platform]?.ai_rate ?? 0.3) + timeBoost;
  const isAi = Math.random() < aiRate;

  let verdict: string;
  let confidence: number;

  if (isAi) {
    verdict = "ai_generated";
    confidence = parseFloat((Math.random() * 0.29 + 0.70).toFixed(4));
  } else {
    const roll = Math.random();
    if (roll < 0.85) {
      verdict = "likely_human";
      confidence = parseFloat((Math.random() * 0.23 + 0.75).toFixed(4));
    } else {
      verdict = "inconclusive";
      confidence = parseFloat((Math.random() * 0.25 + 0.40).toFixed(4));
    }
  }

  let domain: string | null = null;
  if (contentType === "image") domain = weightedChoice(DOMAINS);
  else if (contentType === "text") domain = platform + ".com";

  let category: string;
  if (contentType === "image") {
    category = ["photo", "art", "meme", "screenshot"][Math.floor(Math.random() * 4)];
  } else if (contentType === "text") {
    category = "text_post";
  } else {
    category = "video";
  }

  const now = new Date();
  const scanTime = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 86400000);

  // Generate content hashes — reuse some hashes to create sightings
  let contentHash: string | null = null;
  if (contentType === "image") {
    // Use a pool of ~80 unique hashes so some get multiple sightings
    const hashSeed = Math.floor(Math.random() * 80);
    contentHash = crypto.createHash("sha256").update(`content-${hashSeed}`).digest("hex");
  }

  return {
    user_id: userId,
    created_at: scanTime.toISOString(),
    content_type: contentType,
    platform,
    verdict,
    confidence,
    model_used: MODELS[contentType],
    source_domain: domain,
    content_category: category,
    content_hash: contentHash,
    scan_duration_ms: Math.floor(Math.random() * 500 + 200),
  };
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("x-seed-secret");
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Clear all data in dependency order
  await supabase.from("content_sightings").delete().neq("content_hash", "");
  await supabase.from("exposure_scores").delete().neq("user_id", "");
  await supabase.from("platform_slop_index").delete().neq("platform", "");
  await supabase.from("scans").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("profiles").delete().neq("id", "");

  // Create 50 users
  const users: { id: string; sharing_enabled: boolean }[] = [];
  users.push({ id: "demo-user-001", sharing_enabled: true });
  for (let i = 0; i < 49; i++) {
    users.push({
      id: crypto.randomUUID(),
      sharing_enabled: Math.random() < 0.60,
    });
  }

  const { error: profileError } = await supabase.from("profiles").insert(
    users.map((u) => ({ id: u.id, sharing_enabled: u.sharing_enabled }))
  );
  if (profileError) {
    return NextResponse.json({ error: "Profile insert failed: " + profileError.message }, { status: 500 });
  }

  // Generate all scans
  const allScans: ScanRow[] = [];
  for (let i = 0; i < 500; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    allScans.push(generateScan(user.id, Math.random() * 30));
  }
  // 35 dedicated demo-user scans at ~38% AI rate
  for (let i = 0; i < 35; i++) {
    const scan = generateScan("demo-user-001", Math.random() * 30);
    if (Math.random() < 0.38) {
      scan.verdict = "ai_generated";
      scan.confidence = parseFloat((Math.random() * 0.29 + 0.70).toFixed(4));
    }
    allScans.push(scan);
  }

  // Insert scans in batches of 100 (direct insert, much faster than RPC)
  let scanSuccess = 0;
  for (let i = 0; i < allScans.length; i += 100) {
    const batch = allScans.slice(i, i + 100);
    const { error } = await supabase.from("scans").insert(batch);
    if (!error) scanSuccess += batch.length;
  }

  // Build content_sightings from scan data
  // Group by content_hash
  const hashMap = new Map<string, { ai: number; human: number; inc: number; conf: number[]; platforms: Set<string>; first: string; last: string }>();
  for (const scan of allScans) {
    if (!scan.content_hash) continue;
    const existing = hashMap.get(scan.content_hash);
    if (existing) {
      if (scan.verdict === "ai_generated") existing.ai++;
      else if (scan.verdict === "likely_human") existing.human++;
      else existing.inc++;
      existing.conf.push(scan.confidence);
      existing.platforms.add(scan.platform);
      if (scan.created_at < existing.first) existing.first = scan.created_at;
      if (scan.created_at > existing.last) existing.last = scan.created_at;
    } else {
      hashMap.set(scan.content_hash, {
        ai: scan.verdict === "ai_generated" ? 1 : 0,
        human: scan.verdict === "likely_human" ? 1 : 0,
        inc: scan.verdict === "inconclusive" ? 1 : 0,
        conf: [scan.confidence],
        platforms: new Set([scan.platform]),
        first: scan.created_at,
        last: scan.created_at,
      });
    }
  }

  const sightingRows = Array.from(hashMap.entries()).map(([hash, data]) => {
    const total = data.ai + data.human + data.inc;
    const compoundScore = total > 0 ? parseFloat(((data.ai / total) * 100).toFixed(2)) : 0;
    const compoundVerdict = compoundScore >= 60 ? "ai_generated" : compoundScore <= 30 ? "likely_human" : "inconclusive";
    return {
      content_hash: hash,
      first_seen: data.first,
      last_seen: data.last,
      sighting_count: total,
      ai_votes: data.ai,
      human_votes: data.human,
      inconclusive_votes: data.inc,
      avg_confidence: parseFloat((data.conf.reduce((a, b) => a + b, 0) / data.conf.length).toFixed(4)),
      compound_score: compoundScore,
      compound_verdict: compoundVerdict,
      platforms: Array.from(data.platforms),
    };
  });

  if (sightingRows.length > 0) {
    await supabase.from("content_sightings").insert(sightingRows);
  }

  // Compute slop index
  await supabase.rpc("compute_slop_index");

  // Compute exposure scores sequentially (5 at a time)
  for (let i = 0; i < users.length; i += 5) {
    const batch = users.slice(i, i + 5);
    await Promise.allSettled(
      batch.map((u) => supabase.rpc("compute_exposure_score", { p_user_id: u.id }))
    );
  }

  return NextResponse.json({
    message: "Seed complete",
    users: users.length,
    scans_attempted: allScans.length,
    scans_succeeded: scanSuccess,
    content_sightings: sightingRows.length,
  });
}
