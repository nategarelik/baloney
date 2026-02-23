// frontend/src/lib/detection/pro-loader.ts — Plugin interface for @baloney/pro-detectors
//
// This file is the ONLY place in the public repo that references the private
// @baloney/pro-detectors package. All imports are dynamic and wrapped in try/catch,
// so the public repo compiles and runs without the private package installed.

// ────────────────────────────────────────────
// Interfaces (duplicated so public repo compiles standalone)
// ────────────────────────────────────────────

interface PangramWindow {
  text: string;
  label: string;
  ai_assistance_score: number;
  confidence: "High" | "Medium" | "Low";
}

export interface PangramResult {
  score: number;
  classification: string;
  windows: PangramWindow[];
}

export interface ProTextMethods {
  methodP_pangram(text: string): Promise<PangramResult | null>;
  methodSynthID_text(
    text: string,
  ): Promise<"watermarked" | "not_watermarked" | "uncertain" | null>;
}

export interface ProImageMethods {
  methodS_sightEngine(
    imageBytes: Buffer,
    mimeType?: string,
  ): Promise<number | null>;
  methodSynthID_image(
    imageBytes: Buffer,
  ): Promise<"Detected" | "Not Detected" | "Possibly Detected" | null>;
}

export interface ProVideoMethods {
  methodS_sightEngineVideo(videoBlob: Blob): Promise<{
    ai_generated_score: number;
    frames: Array<{ timestamp: number; ai_score: number }>;
  } | null>;
}

// ────────────────────────────────────────────
// Cached loaders — try once, cache result
// ────────────────────────────────────────────

let _textMethods: ProTextMethods | null | undefined;
let _imageMethods: ProImageMethods | null | undefined;
let _videoMethods: ProVideoMethods | null | undefined;

export async function getProTextMethods(): Promise<ProTextMethods | null> {
  if (_textMethods !== undefined) return _textMethods;
  try {
    // @ts-expect-error — optional private package, not installed in public repo
    const mod = await import("@baloney/pro-detectors/text");
    _textMethods = {
      methodP_pangram: mod.methodP_pangram,
      methodSynthID_text: mod.methodSynthID_text,
    };
    return _textMethods;
  } catch {
    _textMethods = null;
    return null;
  }
}

export async function getProImageMethods(): Promise<ProImageMethods | null> {
  if (_imageMethods !== undefined) return _imageMethods;
  try {
    // @ts-expect-error — optional private package, not installed in public repo
    const mod = await import("@baloney/pro-detectors/image");
    _imageMethods = {
      methodS_sightEngine: mod.methodS_sightEngine,
      methodSynthID_image: mod.methodSynthID_image,
    };
    return _imageMethods;
  } catch {
    _imageMethods = null;
    return null;
  }
}

export async function getProVideoMethods(): Promise<ProVideoMethods | null> {
  if (_videoMethods !== undefined) return _videoMethods;
  try {
    // @ts-expect-error — optional private package, not installed in public repo
    const mod = await import("@baloney/pro-detectors/video");
    _videoMethods = {
      methodS_sightEngineVideo: mod.methodS_sightEngineVideo,
    };
    return _videoMethods;
  } catch {
    _videoMethods = null;
    return null;
  }
}

export function isProInstalled(): boolean {
  try {
    require.resolve("@baloney/pro-detectors");
    return true;
  } catch {
    return false;
  }
}
