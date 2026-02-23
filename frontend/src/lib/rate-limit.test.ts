import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Reset module state between tests
    vi.useFakeTimers();
  });

  it("should allow requests under the limit", () => {
    const result = checkRateLimit("192.168.1.1", "analytics");
    expect(result.limited).toBe(false);
  });

  it("should rate limit after exceeding detect limit (30/min)", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip, "detect");
    }
    const result = checkRateLimit(ip, "detect");
    expect(result.limited).toBe(true);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("should not cross-contaminate different IPs", () => {
    for (let i = 0; i < 30; i++) {
      checkRateLimit("ip-a", "detect");
    }
    const resultA = checkRateLimit("ip-a", "detect");
    const resultB = checkRateLimit("ip-b", "detect");

    expect(resultA.limited).toBe(true);
    expect(resultB.limited).toBe(false);
  });

  it("should reset after the time window passes", () => {
    const ip = "10.0.0.2";
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip, "detect");
    }
    expect(checkRateLimit(ip, "detect").limited).toBe(true);

    // Advance time past the 1-minute window
    vi.advanceTimersByTime(61_000);

    expect(checkRateLimit(ip, "detect").limited).toBe(false);
  });
});
