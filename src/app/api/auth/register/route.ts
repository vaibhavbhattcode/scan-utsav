import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, generateTokens } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/security";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting (5 requests/min per IP)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const rateLimit = checkRateLimit(ip, "auth_register", 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again in a minute." }, { status: 429 });
    }

    await connectDB();
    const body = await req.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email address is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: "host",
      subscriptionPlan: "free",
    });

    const payload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };

    const tokens = generateTokens(payload);

    // Send welcome email (non-blocking — don't await to keep response fast)
    sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    const res = NextResponse.json({
      success: true,
      user: payload,
      accessToken: tokens.accessToken,
    }, { status: 201 });

    res.cookies.set("scanutsav_token", tokens.accessToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
