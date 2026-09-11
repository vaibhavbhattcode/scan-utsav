import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set("scanutsav_token", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
    expires: new Date(0),
  });
  res.cookies.set("scanutsav_guest", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
    expires: new Date(0),
  });
  return res;
}
