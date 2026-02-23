import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
  isAuthError: (r: unknown) => r instanceof Response,
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock real-detectors
vi.mock("@/lib/real-detectors", () => ({
  realTextDetection: vi.fn().mockResolvedValue({
    verdict: "human",
    confidence: 0.85,
    ai_probability: 0.15,
    model_used: "test-model",
    trust_score: 0.85,
    classification: "human",
    edit_magnitude: 0.05,
    text_stats: {
      word_count: 50,
      sentence_count: 3,
      avg_word_length: 5.2,
      avg_sentence_length: 16.7,
      lexical_diversity: 0.8,
    },
    caveat: null,
    feature_vector: {
      burstiness: 0.3,
      type_token_ratio: 0.8,
      perplexity: 45.0,
      repetition_score: 0.1,
    },
    sentence_scores: [],
  }),
}));

import { POST } from "./route";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { realTextDetection } from "@/lib/real-detectors";
import { API_LIMITS } from "@/lib/constants";

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/detect/text", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/detect/text", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-mock supabase.rpc after clearing
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null, count: null, status: 200, statusText: "OK" } as never);
    // Re-mock realTextDetection with default success response
    vi.mocked(realTextDetection).mockResolvedValue({
      verdict: "human",
      confidence: 0.85,
      ai_probability: 0.15,
      model_used: "test-model",
      trust_score: 0.85,
      classification: "human",
      edit_magnitude: 0.05,
      text_stats: {
        word_count: 50,
        sentence_count: 3,
        avg_word_length: 5.2,
        avg_sentence_length: 16.7,
        lexical_diversity: 0.8,
      },
      caveat: null,
      feature_vector: {
        burstiness: 0.3,
        type_token_ratio: 0.8,
        perplexity: 45.0,
        repetition_score: 0.1,
      },
      sentence_scores: [],
    });
  });

  it("should return 401 without authentication", async () => {
    // Arrange
    const mockAuthResponse = new Response(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.mocked(requireAuth).mockResolvedValue(mockAuthResponse);

    const req = makeReq({ text: "Hello world" });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Authentication required");
    expect(realTextDetection).not.toHaveBeenCalled();
  });

  it("should return 400 when text is missing", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const req = makeReq({});

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("No text provided");
    expect(realTextDetection).not.toHaveBeenCalled();
  });

  it("should return 400 when text is not a string", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const req = makeReq({ text: 123 });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("No text provided");
    expect(realTextDetection).not.toHaveBeenCalled();
  });

  it("should return 400 when text is too long", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const longText = "a".repeat(API_LIMITS.TEXT_MAX_LENGTH + 1);
    const req = makeReq({ text: longText });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Text too long");
    // details only included in dev mode, not in test env
    expect(realTextDetection).not.toHaveBeenCalled();
  });

  it("should detect text and return result", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const testText = "This is a test message that should be detected.";
    const req = makeReq({ text: testText, platform: "x" });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);
    expect(realTextDetection).toHaveBeenCalledWith(testText);

    const data = await response.json();
    expect(data.verdict).toBe("human");
    expect(data.confidence).toBe(0.85);
    expect(data.model_used).toBe("test-model");
    expect(data.trust_score).toBe(0.85);
    expect(data.scan_id).toBeDefined();
    expect(typeof data.scan_id).toBe("string");

    // Verify scan was recorded
    expect(supabase.rpc).toHaveBeenCalledWith(
      "record_scan_with_provenance",
      expect.objectContaining({
        p_user_id: "test-user-001",
        p_content_type: "text",
        p_platform: "x",
        p_verdict: "human",
        p_confidence: 0.85,
        p_model_used: "test-model",
        p_trust_score: 0.85,
        p_classification: "human",
        p_edit_magnitude: 0.05,
      }),
    );
  });

  it("should use default platform when not provided", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const testText = "Test message without platform.";
    const req = makeReq({ text: testText });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);

    // Verify scan was recorded with default platform
    expect(supabase.rpc).toHaveBeenCalledWith(
      "record_scan_with_provenance",
      expect.objectContaining({
        p_platform: "manual_upload",
      }),
    );
  });

  it("should handle detection errors gracefully", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });
    vi.mocked(realTextDetection).mockRejectedValue(new Error("Detection service unavailable"));

    const req = makeReq({ text: "Test text" });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Detection failed");
  });

  it("should handle database errors gracefully", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });
    vi.mocked(supabase.rpc).mockRejectedValue(new Error("Database connection failed"));

    const req = makeReq({ text: "Test text" });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Detection failed");
  });

  it("should include content hash in scan record", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const testText = "Unique text for hash verification";
    const req = makeReq({ text: testText });

    // Act
    await POST(req);

    // Assert
    expect(supabase.rpc).toHaveBeenCalledWith(
      "record_scan_with_provenance",
      expect.objectContaining({
        p_content_hash: expect.any(String),
      }),
    );

    const rpcCall = vi.mocked(supabase.rpc).mock.calls[0];
    const params = rpcCall[1] as Record<string, unknown>;
    expect(params.p_content_hash).toHaveLength(64); // SHA-256 hex string
  });

  it("should record scan duration", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const req = makeReq({ text: "Test" });

    // Act
    await POST(req);

    // Assert
    expect(supabase.rpc).toHaveBeenCalledWith(
      "record_scan_with_provenance",
      expect.objectContaining({
        p_scan_duration_ms: expect.any(Number),
      }),
    );

    const rpcCall = vi.mocked(supabase.rpc).mock.calls[0];
    const params = rpcCall[1] as Record<string, unknown>;
    expect(params.p_scan_duration_ms).toBeGreaterThanOrEqual(0);
  });
});
