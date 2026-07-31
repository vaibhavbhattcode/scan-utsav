import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/edge-auth";

// In-memory IP rate limiter for production edge protection
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // Rate Limiter Enforcement (150 requests per minute per IP)
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

  if (ipData.count > 150) {
    return NextResponse.json({ error: "Too many requests. Rate limit exceeded." }, { status: 429 });
  }

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // CSRF Protection Check for Mutating API requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && path.startsWith("/api/")) {
    const publicEndpoints = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/google",
      "/api/media",
      "/api/contact",
      "/api/upload/presign",
      "/api/events/verify-password",
      "/api/payments/razorpay",
      "/api/payments/gift",
      "/api/coupons",
    ];
    const isPublic = publicEndpoints.some(p => path === p || path.startsWith(p));

    if (!isPublic) {
      const csrfHeader =
        request.headers.get("x-csrf-token") ||
        request.headers.get("x-scanutsav-request") ||
        request.headers.get("authorization") ||
        request.headers.get("content-type")?.includes("application/json");

      if (!csrfHeader) {
        return NextResponse.json({ error: "CSRF token missing or invalid" }, { status: 403 });
      }
    }
  }

  // Edge-compatible Token Verification using jose
  const token = request.cookies.get("scanutsav_token")?.value;
  const user = token ? await verifyAccessTokenEdge(token) : null;

  // 1. Guard /admin routes (Super Admin only)
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!user || user.role !== "super_admin") {
      const redirectUrl = new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Guard /dashboard routes (Host & Super Admin only)
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
