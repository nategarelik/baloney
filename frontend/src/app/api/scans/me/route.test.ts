import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createScanRecord } from "@/__tests__/helpers/factories";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
  isAuthError: (r: unknown) => r instanceof Response,
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { GET } from "./route";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function makeReq(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/scans/me");
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return new NextRequest(url, {
    method: "GET",
  });
}

function createMockSupabaseChain(data: unknown[], count: number) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data, count }),
  };
  return chain;
}

describe("GET /api/scans/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const req = makeReq();

    // Act
    const response = await GET(req);

    // Assert
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Authentication required");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("should return user scans with defaults", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockScans = [
      createScanRecord({
        id: "scan-1",
        content_type: "text",
        verdict: "human",
        confidence: 0.85,
      }),
      createScanRecord({
        id: "scan-2",
        content_type: "image",
        verdict: "ai_generated",
        confidence: 0.92,
      }),
    ];

    // Map to DB format (created_at instead of timestamp)
    const dbScans = mockScans.map((scan) => ({
      ...scan,
      created_at: scan.timestamp,
    }));

    const mockChain = createMockSupabaseChain(dbScans, 2);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq();

    // Act
    const response = await GET(req);

    // Assert
    expect(response.status).toBe(200);
    expect(supabase.from).toHaveBeenCalledWith("scans");
    expect(mockChain.select).toHaveBeenCalledWith(
      expect.stringContaining("id, created_at, content_type"),
      { count: "exact" },
    );
    expect(mockChain.eq).toHaveBeenCalledWith("user_id", "test-user-001");
    expect(mockChain.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(mockChain.range).toHaveBeenCalledWith(0, 49); // default limit 50

    const data = await response.json();
    expect(data.scans).toHaveLength(2);
    expect(data.total).toBe(2);
    expect(data.limit).toBe(50);
    expect(data.offset).toBe(0);
    expect(data.scans[0].timestamp).toBeDefined();
  });

  it("should respect limit and offset query params", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockScans = [
      createScanRecord({ id: "scan-3" }),
      createScanRecord({ id: "scan-4" }),
      createScanRecord({ id: "scan-5" }),
    ];

    const dbScans = mockScans.map((scan) => ({
      ...scan,
      created_at: scan.timestamp,
    }));

    const mockChain = createMockSupabaseChain(dbScans, 100);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ limit: "10", offset: "20" });

    // Act
    const response = await GET(req);

    // Assert
    expect(response.status).toBe(200);
    expect(mockChain.range).toHaveBeenCalledWith(20, 29); // offset=20, limit=10 → range [20, 29]

    const data = await response.json();
    expect(data.limit).toBe(10);
    expect(data.offset).toBe(20);
    expect(data.total).toBe(100);
  });

  it("should clamp limit to minimum value", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain([], 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ limit: "0" });

    // Act
    const response = await GET(req);

    // Assert
    const data = await response.json();
    expect(data.limit).toBe(1); // clamped to minimum
  });

  it("should clamp limit to maximum value", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain([], 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ limit: "500" });

    // Act
    const response = await GET(req);

    // Assert
    const data = await response.json();
    expect(data.limit).toBe(200); // clamped to maximum
  });

  it("should handle invalid limit gracefully", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain([], 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ limit: "invalid" });

    // Act
    const response = await GET(req);

    // Assert
    const data = await response.json();
    expect(data.limit).toBe(50); // falls back to default
  });

  it("should handle invalid offset gracefully", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain([], 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ offset: "abc" });

    // Act
    const response = await GET(req);

    // Assert
    const data = await response.json();
    expect(data.offset).toBe(0); // falls back to default
  });

  it("should handle empty result set", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain([], 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq();

    // Act
    const response = await GET(req);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.scans).toEqual([]);
    expect(data.total).toBe(0);
  });

  it("should handle null data from database", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain(null as any, 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq();

    // Act
    const response = await GET(req);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.scans).toEqual([]);
    expect(data.total).toBe(0);
  });

  it("should filter scans by user_id", async () => {
    // Arrange
    const userId = "user-123-abc";
    vi.mocked(requireAuth).mockResolvedValue({
      userId,
      email: "user123@example.com",
    });

    const mockChain = createMockSupabaseChain([], 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq();

    // Act
    await GET(req);

    // Assert
    expect(mockChain.eq).toHaveBeenCalledWith("user_id", userId);
  });

  it("should map created_at to timestamp in response", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const createdAt = "2026-02-22T10:30:00Z";
    const mockScans = [
      {
        id: "scan-1",
        created_at: createdAt,
        content_type: "text",
        platform: "x",
        verdict: "human",
        confidence: 0.85,
        model_used: "test-model",
        source_domain: "x.com",
        content_category: "text_post",
        trust_score: 0.85,
        edit_magnitude: 0.05,
        scan_duration_ms: 250,
      },
    ];

    const mockChain = createMockSupabaseChain(mockScans, 1);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq();

    // Act
    const response = await GET(req);

    // Assert
    const data = await response.json();
    expect(data.scans[0].timestamp).toBe(createdAt);
    expect(data.scans[0].created_at).toBe(createdAt);
  });

  it("should clamp offset to maximum value", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain([], 0);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ offset: "50000" });

    // Act
    const response = await GET(req);

    // Assert
    const data = await response.json();
    expect(data.offset).toBe(10000); // clamped to maximum
  });
});
