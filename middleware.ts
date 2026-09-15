import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory sliding-window rate limiter. Fine for a single instance /
 * dev; for multi-instance production deployments, point this at
 * REDIS_URL instead (see docs/security.md — the interface below is
 * intentionally swappable).
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const ADMIN_LOGIN_MAX_REQUESTS = 10;

const buckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}

export function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin/login")) {
    if (isRateLimited(`admin-login:${ip}`, ADMIN_LOGIN_MAX_REQUESTS)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
  } else if (pathname.startsWith("/api/")) {
    if (isRateLimited(`api:${ip}`, MAX_REQUESTS_PER_WINDOW)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please slow down." }, { status: 429 });
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"]
};
