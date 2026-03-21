// Real video detection pipeline.
// Uses SightEngine native video endpoint only (60s max, full server-side analysis).
// The multi-frame per-image fallback is commented out in the original source and not restored here.

import { DETECTION_CONFIG } from "../detection-config";

// ──────────────────────────────────────────────
// METHOD S: SightEngine native video endpoint
// ──────────────────────────────────────────────

export async function methodS_sightEngineVideo(videoBlob: Blob): Promise<{
  ai_generated_score: number;
  frames: Array<{ timestamp: number; ai_score: number }>;
} | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  const formData = new FormData();
  formData.append("media", videoBlob);
  formData.append("models", "genai");
  formData.append("api_user", apiUser);
  formData.append("api_secret", apiSecret);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DETECTION_CONFIG.timeouts.sightEngineVideo,
  );

  try {
    const response = await fetch(
      "https://api.sightengine.com/1.0/video/check-sync.json",
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 429 || response.status === 400) {
        console.warn(
          `[Baloney] SightEngine Video unavailable (${response.status})`,
        );
        return null;
      }
      throw new Error(`SightEngine Video ${response.status}`);
    }
    const data = await response.json();

    const rawFrames = data.data?.frames || [];
    const frames = rawFrames.map(
      (f: {
        time?: number;
        info?: { position?: number };
        type?: { ai_generated?: number };
      }) => ({
        timestamp: f.time ?? f.info?.position ?? 0,
        ai_score: f.type?.ai_generated ?? 0,
      }),
    );

    const avgScore =
      frames.length > 0
        ? frames.reduce(
            (s: number, f: { ai_score: number }) => s + f.ai_score,
            0,
          ) / frames.length
        : null;

    return avgScore !== null ? { ai_generated_score: avgScore, frames } : null;
  } catch (err) {
    console.error("[Baloney] SightEngine Video error:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
