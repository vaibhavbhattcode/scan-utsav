import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, generateTokens } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit";
export async function POST(req: Request) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  try {
    const rateLimit = checkRateLimit(ip, "auth_login", 5, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = validation.data;
    await connectDB();
    const targetUser: any = await User.findOne({ email });

    if (!targetUser?.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isAuthenticated = await comparePassword(password, targetUser.passwordHash);
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (targetUser.isBlocked) {
      return NextResponse.json({ error: "This account has been blocked. Contact support." }, { status: 403 });
    }

    // 2FA Enforcement Check for Agencies/Admins
    const userRole = targetUser.role || "host";
    if (userRole === "agency" || userRole === "super_admin") {
      try {
        const GlobalSettings = require("@/models/GlobalSettings").default;
        const settings = await GlobalSettings.findOne().lean();
        if (settings?.enforce2FA) {
          // If the user actually had 2FA configured, we would verify here.
          // Since 2FA UI flow isn't fully built yet, we can either block them
          // or flag them as needing to complete 2FA on the frontend.
          // We will return a specific payload to the frontend.
          return NextResponse.json({ 
            success: false, 
            requires2FA: true, 
            message: "2FA is enforced by the Super Admin. Please complete 2FA verification.",
            tempUserId: targetUser._id ? targetUser._id.toString() : targetUser.id 
          }, { status: 401 });
        }
      } catch (e) {
        // Ignore DB issues for settings
      }
    }

    const payload = {
      userId: targetUser._id ? targetUser._id.toString() : targetUser.id,
      email: targetUser.email,
      role: targetUser.role || "host",
      name: targetUser.name || "User",
    };

    const tokens = generateTokens(payload);

    try {
      writeAuditLog({
        action: "login_success",
        userEmail: targetUser.email,
        role: targetUser.role,
        status: 200,
        responseTimeMs: Date.now() - startTime,
        details: "User logged in successfully",
        req,
      });
    } catch {
      /* non-blocking */
    }

    const res = NextResponse.json({
      success: true,
      user: payload,
      accessToken: tokens.accessToken,
    });

    res.cookies.set("scanutsav_token", tokens.accessToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 2,
    });

    return res;
  } catch (error: any) {
    console.error("Login Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
