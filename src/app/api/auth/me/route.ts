import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

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

    return NextResponse.json({ authenticated: true, user: payload });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
