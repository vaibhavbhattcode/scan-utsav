import { NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "./auth";

export type Role = "super_admin" | "host" | "guest";

export interface AuthResult {
  user: TokenPayload | null;
  error?: string;
  response?: NextResponse;
}

export function requireAuth(req: Request, allowedRoles: Role[]): AuthResult {
  let token: string | undefined;

  // 1. Check cookies from header
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/scanutsav_token=([^;]+)/);
  if (match) {
    token = match[1];
  }

  // 2. Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return {
      user: null,
      error: "Authentication token missing",
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return {
      user: null,
      error: "Invalid or expired token",
      response: NextResponse.json({ error: "Invalid or expired session" }, { status: 401 }),
    };
  }

  if (!allowedRoles.includes(payload.role)) {
    return {
      user: payload,
      error: "Insufficient permissions",
      response: NextResponse.json(
        { error: `Access denied. Role '${payload.role}' is not authorized.` },
        { status: 403 }
      ),
    };
  }

  return { user: payload };
}
