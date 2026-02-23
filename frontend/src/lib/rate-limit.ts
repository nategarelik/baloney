// frontend/src/lib/rate-limit.ts — In-memory sliding window rate limiter

interface RateLimitConfig {
  /** Max requests allowed within the interval */
  limit: number;
  /** Time window in milliseconds */
  interval: number;
}

interface RateLimitResult {
  limited: boolean;
  retryAfter?: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  detect: { limit: 30, interval: 60_000 },
  seed: { limit: 1, interval: 3_600_000 },
  analytics: { limit: 60, interval: 60_000 },
  default: { limit: 120, interval: 60_000 },
};

const requestLog = new Map<string, number[]>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupStaleEntries(now: number) {
  const maxWindow = 3_600_000; // longest window (seed = 1 hour)
  for (const [key, timestamps] of requestLog) {
    const filtered = timestamps.filter((t) => now - t < maxWindow);
    if (filtered.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, filtered);
    }
  }
  lastCleanup = now;
}

export function checkRateLimit(ip: string, prefix: string): RateLimitResult {
  const config = RATE_LIMITS[prefix] ?? RATE_LIMITS.default;
  const now = Date.now();

  // Periodic cleanup to prevent memory leaks
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanupStaleEntries(now);
  }

  const key = `${prefix}:${ip}`;
  const timestamps = requestLog.get(key) ?? [];

  // Remove timestamps outside the current window
  const windowStart = now - config.interval;
  const recent = timestamps.filter((t) => t > windowStart);

  if (recent.length >= config.limit) {
    const oldestInWindow = recent[0];
    const retryAfter = Math.ceil(
      (oldestInWindow + config.interval - now) / 1000,
    );
    requestLog.set(key, recent);
    return { limited: true, retryAfter };
  }

  recent.push(now);
  requestLog.set(key, recent);
  return { limited: false };
}
