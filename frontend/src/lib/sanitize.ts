// frontend/src/lib/sanitize.ts — Input validation and sanitization utilities

/** Strip null bytes and control characters (keep newlines, tabs, carriage returns) */
export function sanitizeText(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/** Validate a base64-encoded image (data URI or raw base64) */
export function validateBase64Image(
  data: string,
): { valid: boolean; error?: string } {
  const validPrefixes = [
    "data:image/jpeg;base64,",
    "data:image/png;base64,",
    "data:image/gif;base64,",
    "data:image/webp;base64,",
    "data:image/svg+xml;base64,",
  ];

  const hasValidPrefix = validPrefixes.some((p) => data.startsWith(p));
  if (!hasValidPrefix && !/^[A-Za-z0-9+/]+=*$/.test(data)) {
    return { valid: false, error: "Invalid image data format" };
  }

  // Rough size estimate: base64 is ~4/3 of original bytes
  const sizeEstimate = Math.ceil(data.length * 0.75);
  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
  if (sizeEstimate > MAX_BYTES) {
    return { valid: false, error: "Image exceeds maximum size of 10MB" };
  }

  return { valid: true };
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}
