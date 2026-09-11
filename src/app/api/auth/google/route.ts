import { NextResponse } from "next/server";
import { authenticateGoogleUser } from "@/lib/google-auth";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Google token is required" }, { status: 400 });
    }

    const { user, tokens } = await authenticateGoogleUser(token, ip);

    const res = NextResponse.json({
      success: true,
      user,
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
    console.error("Google Auth Route Error:", error);
    return NextResponse.json({ error: error.message || "Google authentication failed" }, { status: 400 });
  }
}
