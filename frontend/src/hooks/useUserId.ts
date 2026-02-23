"use client";

import { useAuth } from "@/components/AuthProvider";
import { DEMO_USER_ID } from "@/lib/constants";

/**
 * Returns the authenticated user's ID, or DEMO_USER_ID for unauthenticated visitors.
 * This replaces the old localStorage-based approach with Supabase auth.
 */
export function useUserId(): string {
  const { user } = useAuth();
  return user?.id ?? DEMO_USER_ID;
}
