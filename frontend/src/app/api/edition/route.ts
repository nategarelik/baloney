import { NextResponse } from "next/server";
import { getFeatureFlags, getAvailableMethods } from "@/lib/edition";

/** Public endpoint — returns edition and feature flags (no secrets exposed) */
export async function GET() {
  return NextResponse.json({
    ...getFeatureFlags(),
    methodAvailability: summarizeMethods(getAvailableMethods()),
  });
}

/** Only reports boolean availability, never actual key values */
function summarizeMethods(methods: ReturnType<typeof getAvailableMethods>) {
  const textMethods = Object.entries(methods.text).filter(([, v]) => v).map(([k]) => k);
  const imageMethods = Object.entries(methods.image).filter(([, v]) => v).map(([k]) => k);
  return {
    text: textMethods,
    image: imageMethods,
    videoAvailable: methods.video.sightengine_video,
  };
}
