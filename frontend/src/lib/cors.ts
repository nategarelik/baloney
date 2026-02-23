// frontend/src/lib/cors.ts — CORS origin allowlist and header utilities

const ALLOWED_ORIGINS = [
  "https://trustlens-nu.vercel.app",
  "http://localhost:3000",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("chrome-extension://")) return true;
  return false;
}

export function getCorsHeaders(
  origin: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin!;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}
