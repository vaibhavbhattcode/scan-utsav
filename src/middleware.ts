import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/edge-auth";

const CSRF_COOKIE = "scanutsav_csrf";
const CSRF_HEADER = "x-csrf-token";

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function ensureCsrfCookie(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(CSRF_COOKIE)?.value;
  if (existing && existing.length >= 32) return existing;

  const token = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  });
  return token;
}

/** Public mutating endpoints that do not require CSRF (still rate-limited). */
const CSRF_EXEMPT = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/google",
  "/api/payments/razorpay/webhook",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  // Rate limit (In-memory token bucket; see src/lib/security.ts)
  const now = Date.now();
  const windowMs = 60 * 1000;
  const ipData = ipRequestCounts.get(clientIp) || { count: 0, resetAt: now + windowMs };
  if (now > ipData.resetAt) {
    ipData.count = 1;
    ipData.resetAt = now + windowMs;
  } else {
    ipData.count += 1;
  }
  ipRequestCounts.set(clientIp, ipData);
  if (ipData.count > 200) {
    return NextResponse.json({ error: "Too many requests. Rate limit exceeded." }, { status: 429 });
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  ensureCsrfCookie(request, response);

  // Real double-submit CSRF for mutating API routes
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && path.startsWith("/api/")) {
    const isExempt = CSRF_EXEMPT.some((p) => path === p || path.startsWith(p + "/"));
    if (!isExempt) {
      const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
      const headerToken = request.headers.get(CSRF_HEADER);
      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return NextResponse.json({ error: "CSRF token missing or invalid" }, { status: 403 });
      }
    }
  }

  const token = request.cookies.get("scanutsav_token")?.value;
  const user = token ? await verifyAccessTokenEdge(token) : null;

  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!user || user.role !== "super_admin") {
      const redirectUrl = new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (path.startsWith("/dashboard")) {
    if (!user || !["host", "super_admin"].includes(user.role)) {
      const redirectUrl = new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|icon\\.svg|icon\\.png|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)"],
};
