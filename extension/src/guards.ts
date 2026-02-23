// extension/src/guards.ts — Gating checks for scanning eligibility

import { settings, MIN_IMAGE_SIZE } from "./config";

export function isEnabled(): boolean {
  return settings.extensionEnabled === true;
}

export function isSiteAllowed(): boolean {
  const hostname = window.location.hostname;
  return settings.allowedSites.some(
    (site) => hostname === site || hostname.endsWith("." + site),
  );
}

export function canScanImages(): boolean {
  return isEnabled() && isSiteAllowed() && settings.autoScanImages;
}

export function canScanVideos(): boolean {
  return isEnabled() && isSiteAllowed() && settings.autoScanVideos;
}

export function canAutoScanText(): boolean {
  return isEnabled() && isSiteAllowed() && settings.autoScanText;
}

export function canManualScanText(): boolean {
  return isEnabled() && isSiteAllowed();
}

export function isTargetImage(img: HTMLImageElement): boolean {
  const src = img.src || img.currentSrc || "";
  if (!src) return false;

  if (src.startsWith("data:")) return src.length > 10000;

  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (!w || !h) {
    const style = window.getComputedStyle(img);
    w = parseInt(style.width, 10) || 0;
    h = parseInt(style.height, 10) || 0;
  }
  if (w < MIN_IMAGE_SIZE || h < MIN_IMAGE_SIZE) return false;

  try {
    const pathSegments = new URL(src).pathname.split("/");
    const skipSegments = [
      "icon",
      "icons",
      "logo",
      "logos",
      "avatar",
      "avatars",
      "emoji",
      "emojis",
      "favicon",
    ];
    if (pathSegments.some((seg) => skipSegments.includes(seg.toLowerCase())))
      return false;
  } catch {
    // Invalid URL -- allow through
  }

  return true;
}
