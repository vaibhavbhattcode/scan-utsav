import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, generateTokens } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  try {
    const rateLimit = checkRateLimit(ip, "auth_login", 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = validation.data;
    let user: any = null;

    // Attempt MongoDB authentication
    try {
      await connectDB();
      user = await User.findOne({ email });
    } catch (dbErr) {
      console.warn("Database lookup unavailable:", dbErr);
    }

    // Direct password comparison if user found in DB
    let isAuthenticated = false;
    if (user && user.passwordHash) {
      isAuthenticated = await comparePassword(password, user.passwordHash);
    }

    if (!isAuthenticated || !user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || "host",
      name: user.name || "User",
    };

    const tokens = generateTokens(payload);
    const responseTimeMs = Date.now() - startTime;

    // Safely write audit log if DB connected
    try {
      writeAuditLog({
        action: "login_success",
        userEmail: user.email,
        role: user.role,
        status: 200,
        responseTimeMs,
        details: "User logged in successfully",
        req,
      });
    } catch (e) {}

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
    });

    return res;

  } catch (error: any) {
    console.error("Login Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
