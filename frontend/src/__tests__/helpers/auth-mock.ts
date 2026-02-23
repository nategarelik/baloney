// Auth mock helpers for testing API routes

import { vi } from "vitest";

/** Mock requireAuth to return an authenticated user */
export function mockAuthenticated(userId = "test-user-001", email = "test@example.com") {
  return vi.fn().mockResolvedValue({ userId, email });
}

/** Mock requireAuth to return a 401 error response */
export function mockUnauthenticated() {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }),
  );
}
