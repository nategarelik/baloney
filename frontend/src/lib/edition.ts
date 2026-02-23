// Edition system — controls feature availability for open-core model
// Set BALONEY_EDITION on Vercel dashboard: "pro" for production, "community" for open-source
// When unset, auto-detects based on available API keys

import { isProInstalled } from "./detection/pro-loader";

export type Edition = "community" | "pro";

/** Server-side edition detection */
export function getEdition(): Edition {
  const explicit = process.env.BALONEY_EDITION;
  if (explicit === "pro" || explicit === "community") return explicit;

  // Auto-detect: if any premium API key is present, it's pro
  const hasPremiumKeys =
    !!process.env.PANGRAM_API_KEY ||
    !!process.env.SIGHTENGINE_API_USER ||
    !!process.env.GOOGLE_CLOUD_PROJECT_ID;

  return hasPremiumKeys || isProInstalled() ? "pro" : "community";
}

/** Report which detection methods are available (for health/status endpoints) */
export function getAvailableMethods() {
  return {
    edition: getEdition(),
    text: {
      pangram: !!process.env.PANGRAM_API_KEY,
      synthid_text: !!process.env.RAILWAY_BACKEND_URL,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      statistical: true, // always available — no external dependency
    },
    image: {
      sightengine:
        !!process.env.SIGHTENGINE_API_USER &&
        !!process.env.SIGHTENGINE_API_SECRET,
      synthid_image:
        !!process.env.GOOGLE_CLOUD_PROJECT_ID &&
        !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      frequency: true, // always available — local FFT
      metadata: true, // always available — local EXIF/C2PA
    },
    video: {
      sightengine_video:
        !!process.env.SIGHTENGINE_API_USER &&
        !!process.env.SIGHTENGINE_API_SECRET,
    },
    services: {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      reality_defender: !!process.env.REALITY_DEFENDER_API_KEY,
    },
  };
}

/** Feature flags derived from edition */
export function getFeatureFlags() {
  const edition = getEdition();
  return {
    edition,
    videoDetection: edition === "pro",
    communityAnalytics: edition === "pro",
    aiSlopIndex: edition === "pro",
    advancedInsights: edition === "pro",
    apiAccess: edition === "pro",
  };
}
