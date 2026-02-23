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
    from: vi.fn(),
  },
}));

import { POST } from "./route";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/sharing/toggle", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function createMockSupabaseChain(error: { message: string } | null = null) {
  const chain = {
    upsert: vi.fn().mockResolvedValue({ error }),
  };
  return chain;
}

describe("POST /api/sharing/toggle", () => {
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

    const req = makeReq({ enabled: true });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Authentication required");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("should toggle sharing on", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: true });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-user-001",
        sharing_enabled: true,
        updated_at: expect.any(String),
      }),
      { onConflict: "id" },
    );

    const data = await response.json();
    expect(data.user_id).toBe("test-user-001");
    expect(data.sharing_enabled).toBe(true);
    expect(data.message).toBe("Community sharing enabled");
  });

  it("should toggle sharing off", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: false });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-user-001",
        sharing_enabled: false,
        updated_at: expect.any(String),
      }),
      { onConflict: "id" },
    );

    const data = await response.json();
    expect(data.user_id).toBe("test-user-001");
    expect(data.sharing_enabled).toBe(false);
    expect(data.message).toBe("Community sharing disabled");
  });

  it("should handle database error", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain({ message: "Connection timeout" });
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: true });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Sharing update failed");
    // details only included in dev mode, not in test env
  });

  it("should coerce enabled to boolean (truthy value)", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: "yes" });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        sharing_enabled: true,
      }),
      { onConflict: "id" },
    );

    const data = await response.json();
    expect(data.sharing_enabled).toBe(true);
  });

  it("should coerce enabled to boolean (falsy value)", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: 0 });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        sharing_enabled: false,
      }),
      { onConflict: "id" },
    );

    const data = await response.json();
    expect(data.sharing_enabled).toBe(false);
  });

  it("should handle undefined enabled value", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({});

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        sharing_enabled: false, // !!undefined = false
      }),
      { onConflict: "id" },
    );

    const data = await response.json();
    expect(data.sharing_enabled).toBe(false);
    expect(data.message).toBe("Community sharing disabled");
  });

  it("should include updated_at timestamp", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const beforeTime = new Date().toISOString();
    const req = makeReq({ enabled: true });

    // Act
    await POST(req);

    // Assert
    const upsertCall = vi.mocked(mockChain.upsert).mock.calls[0];
    const upsertData = upsertCall[0] as Record<string, unknown>;

    expect(upsertData.updated_at).toBeDefined();
    expect(typeof upsertData.updated_at).toBe("string");

    const updatedAt = new Date(upsertData.updated_at as string);
    const beforeDate = new Date(beforeTime);

    expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
  });

  it("should use onConflict strategy for upsert", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: true });

    // Act
    await POST(req);

    // Assert
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.any(Object),
      { onConflict: "id" },
    );
  });

  it("should handle different user IDs correctly", async () => {
    // Arrange
    const userId = "user-xyz-789";
    vi.mocked(requireAuth).mockResolvedValue({
      userId,
      email: "userxyz@example.com",
    });

    const mockChain = createMockSupabaseChain();
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: true });

    // Act
    const response = await POST(req);

    // Assert
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: userId,
      }),
      { onConflict: "id" },
    );

    const data = await response.json();
    expect(data.user_id).toBe(userId);
  });

  it("should handle null error correctly", async () => {
    // Arrange
    vi.mocked(requireAuth).mockResolvedValue({
      userId: "test-user-001",
      email: "test@example.com",
    });

    const mockChain = createMockSupabaseChain(null);
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    const req = makeReq({ enabled: true });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(200);
  });
});
