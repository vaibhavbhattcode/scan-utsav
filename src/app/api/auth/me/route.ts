import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const token = cookies().get("scanutsav_token")?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    await connectDB();
    const dbUser = await User.findById(payload.userId).select("subscriptionPlan").lean();
    const userPlan = (dbUser as any)?.subscriptionPlan || "trial";

    return NextResponse.json({ authenticated: true, user: { ...payload, userPlan } });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
