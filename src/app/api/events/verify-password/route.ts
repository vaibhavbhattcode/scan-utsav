import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { eventCode, password } = await req.json();

    if (!eventCode || !password) {
      return NextResponse.json({ error: "eventCode and password are required" }, { status: 400 });
    }

    const event = await Event.findOne({ code: eventCode });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isPasswordProtected) {
      return NextResponse.json({ success: true, message: "Event is public" });
    }

    const isValid = await event.compareEventPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect event password. Access denied." }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: "Password verified" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Password verification failed" }, { status: 500 });
  }
}
