// Auth helpers for API routes
// Supports both cookie-based auth (webapp) and Bearer token auth (extension)

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { errorResponse } from "./api-utils";

interface AuthResult {
  userId: string;
  email: string | undefined;
}

function createRouteClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
        },
      },
    },
  );
}

/** Try Bearer token auth (used by Chrome extension) */
async function tryBearerAuth(req: NextRequest): Promise<AuthResult | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  return { userId: user.id, email: user.email };
}

/** Require authenticated user — returns 401 if no valid session */
export async function requireAuth(
  req: NextRequest,
): Promise<AuthResult | Response> {
  // 1. Try cookie-based auth (webapp)
  const supabase = createRouteClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { userId: user.id, email: user.email };
  }

  // 2. Try Bearer token auth (extension)
  const bearerResult = await tryBearerAuth(req);
  if (bearerResult) return bearerResult;

  return errorResponse("Authentication required", 401);
}

/** Optional auth — returns user if authenticated, null otherwise */
export async function optionalAuth(
  req: NextRequest,
): Promise<AuthResult | null> {
  const supabase = createRouteClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return { userId: user.id, email: user.email };

  // Try Bearer token as fallback
  return tryBearerAuth(req);
}

/** Type guard to check if requireAuth returned an error response */
export function isAuthError(
  result: AuthResult | Response,
): result is Response {
  return result instanceof Response;
}
