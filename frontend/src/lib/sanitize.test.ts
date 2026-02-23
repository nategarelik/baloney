import { describe, it, expect } from "vitest";
import { sanitizeText, validateBase64Image, isValidUUID } from "./sanitize";

describe("sanitizeText", () => {
  it("should strip null bytes", () => {
    expect(sanitizeText("hello\x00world")).toBe("helloworld");
  });

  it("should strip control characters", () => {
    expect(sanitizeText("hello\x01\x02\x03world")).toBe("helloworld");
  });

  it("should preserve newlines and tabs", () => {
    expect(sanitizeText("hello\nworld\ttab")).toBe("hello\nworld\ttab");
  });

  it("should preserve carriage returns", () => {
    expect(sanitizeText("hello\r\nworld")).toBe("hello\r\nworld");
  });

  it("should handle empty string", () => {
    expect(sanitizeText("")).toBe("");
  });

  it("should handle normal text unchanged", () => {
    const text = "This is a normal sentence with punctuation! And numbers 123.";
    expect(sanitizeText(text)).toBe(text);
  });
});

describe("validateBase64Image", () => {
  it("should accept valid JPEG data URI", () => {
    const result = validateBase64Image("data:image/jpeg;base64,/9j/4AAQ");
    expect(result.valid).toBe(true);
  });

  it("should accept valid PNG data URI", () => {
    const result = validateBase64Image("data:image/png;base64,iVBOR");
    expect(result.valid).toBe(true);
  });

  it("should accept raw base64 data", () => {
    const result = validateBase64Image("iVBORw0KGgo=");
    expect(result.valid).toBe(true);
  });

  it("should reject invalid format", () => {
    const result = validateBase64Image("not-valid-data!!!");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should reject oversized images", () => {
    const huge = "data:image/jpeg;base64," + "A".repeat(15_000_000);
    const result = validateBase64Image(huge);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10MB");
  });
});

describe("isValidUUID", () => {
  it("should accept valid UUID v4", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("should accept uppercase UUID", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("should reject invalid UUID", () => {
    expect(isValidUUID("not-a-uuid")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(isValidUUID("")).toBe(false);
  });

  it("should reject partial UUID", () => {
    expect(isValidUUID("550e8400-e29b-41d4")).toBe(false);
  });
});
