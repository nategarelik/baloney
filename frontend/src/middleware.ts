import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getCorsHeaders } from "@/lib/cors";
import { checkRateLimit } from "@/lib/rate-limit";

// Routes that don't require authentication
const PUBLIC_API_ROUTES = new Set([
  "/api/health",
  "/api/detect/preview",
]);

// Page routes that should redirect to login if not authenticated
const PROTECTED_PAGE_ROUTES: string[] = [];

function addSecurityHeaders(
  response: NextResponse,
  origin: string | null,
) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api-inference.huggingface.co https://api.pangram.com https://api.sightengine.com; frame-ancestors 'none';",
  );

  // Apply CORS headers to all responses
  const corsHeaders = getCorsHeaders(origin);
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

function getRateLimitPrefix(pathname: string): string {
  if (pathname.startsWith("/api/detect")) return "detect";
  if (pathname.startsWith("/api/analytics")) return "analytics";
  if (pathname.startsWith("/api/seed")) return "seed";
  return "default";
}

export async function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  const { pathname } = req.nextUrl;

  // Handle CORS preflight for API routes
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const corsHeaders = getCorsHeaders(origin);
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
    const prefix = getRateLimitPrefix(pathname);
    const result = checkRateLimit(ip, prefix);

    if (result.limited) {
      const corsHeaders = getCorsHeaders(origin);
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.retryAfter ?? 60),
          ...corsHeaders,
        },
      });
    }
  }

  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
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
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh auth session (important: must call getUser to refresh tokens)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users away from login/signup
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return addSecurityHeaders(NextResponse.redirect(url), origin);
  }

  // Redirect unauthenticated users from protected pages to login
  if (
    !user &&
    PROTECTED_PAGE_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return addSecurityHeaders(NextResponse.redirect(url), origin);
  }

  // API route auth is handled in individual route handlers via requireAuth()
  // Public API routes are explicitly allowlisted

  return addSecurityHeaders(response, origin);
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
