import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { generateGuestEventToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(ip, "event_password_verify", 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many password verification attempts. Please wait." }, { status: 429 });
  }

  try {
    await connectDB();
    const { eventCode, password } = await req.json();

    if (!eventCode || typeof eventCode !== "string") {
      return NextResponse.json({ error: "eventCode is required" }, { status: 400 });
    }

    const cleanCode = eventCode.trim().toLowerCase();
    const event = await Event.findOne({ code: cleanCode });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isPasswordProtected) {
      const token = generateGuestEventToken(cleanCode);
      const res = NextResponse.json({ success: true, message: "Event is public" });
      res.cookies.set(`scanutsav_guest_pass_${cleanCode}`, token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      });
      return res;
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required for this protected event" }, { status: 400 });
    }

    const isValid = await event.compareEventPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect event password. Access denied." }, { status: 401 });
    }

    const token = generateGuestEventToken(cleanCode);
    const res = NextResponse.json({ success: true, message: "Password verified successfully" });
    res.cookies.set(`scanutsav_guest_pass_${cleanCode}`, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Password verification failed" }, { status: 500 });
  }
}
