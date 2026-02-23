import { describe, it, expect } from "vitest";
import { validatePlatform, clampInt } from "./api-utils";

describe("validatePlatform", () => {
  it("should accept valid platforms", () => {
    expect(validatePlatform("instagram")).toBe("instagram");
    expect(validatePlatform("x")).toBe("x");
    expect(validatePlatform("reddit")).toBe("reddit");
    expect(validatePlatform("manual_upload")).toBe("manual_upload");
  });

  it("should default to manual_upload for invalid platforms", () => {
    expect(validatePlatform("invalid")).toBe("manual_upload");
    expect(validatePlatform(123)).toBe("manual_upload");
    expect(validatePlatform(null)).toBe("manual_upload");
    expect(validatePlatform(undefined)).toBe("manual_upload");
  });
});

describe("clampInt", () => {
  it("should parse and clamp valid integers", () => {
    expect(clampInt("50", 10, 1, 100)).toBe(50);
  });

  it("should clamp to minimum", () => {
    expect(clampInt("0", 10, 1, 100)).toBe(1);
    expect(clampInt("-5", 10, 1, 100)).toBe(1);
  });

  it("should clamp to maximum", () => {
    expect(clampInt("999", 10, 1, 100)).toBe(100);
  });

  it("should use fallback for non-numeric input", () => {
    expect(clampInt(null, 10, 1, 100)).toBe(10);
    expect(clampInt("abc", 10, 1, 100)).toBe(10);
    expect(clampInt("", 10, 1, 100)).toBe(10);
  });
});
