import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAccessToken, TokenPayload } from "./auth";

export type Role = "super_admin" | "host" | "guest";

export interface AuthResult {
  user: TokenPayload | null;
  error?: string;
  response?: NextResponse;
}

function extractToken(req: Request): string | undefined {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)scanutsav_token=([^;]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return undefined;
}

export function requireAuth(req: Request, allowedRoles: Role[]): AuthResult {
  const token = extractToken(req);

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

/** Re-check user still exists, is not blocked, and role matches DB. */
export async function requireAuthFresh(req: Request, allowedRoles: Role[]): Promise<AuthResult> {
  const base = requireAuth(req, allowedRoles);
  if (base.response || !base.user) return base;

  try {
    await connectDB();
    const dbUser = await User.findById(base.user.userId).select("role isBlocked email name").lean();
    if (!dbUser) {
      return {
        user: null,
        error: "User not found",
        response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
      };
    }
    if ((dbUser as any).isBlocked) {
      return {
        user: null,
        error: "Account blocked",
        response: NextResponse.json({ error: "This account has been blocked" }, { status: 403 }),
      };
    }
    const role = (dbUser as any).role as Role;
    if (!allowedRoles.includes(role)) {
      return {
        user: { ...base.user, role },
        error: "Insufficient permissions",
        response: NextResponse.json({ error: "Access denied" }, { status: 403 }),
      };
    }
    return {
      user: {
        userId: base.user.userId,
        email: (dbUser as any).email,
        role,
        name: (dbUser as any).name || base.user.name,
      },
    };
  } catch {
    return {
      user: null,
      error: "Auth verification failed",
      response: NextResponse.json({ error: "Authentication unavailable" }, { status: 503 }),
    };
  }
}
