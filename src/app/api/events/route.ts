import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (code) {
      let event = await Event.findOne({ code }).select("-password");
      if (!event) {
        const defaultTitles: Record<string, string> = {
          "rohan-birthday-30": "Rohan's 30th Birthday Bash",
          "ananya-vikram-2026": "Ananya & Vikram's Wedding",
          "ganesh-utsav-2026": "Maha Ganesh Chaturthi Pandal",
        };
        const title = defaultTitles[code] || `${code.replace(/-/g, " ")} Celebration`;
        try {
          event = await Event.create({
            title,
            code,
            eventType: code.includes("birthday") ? "birthday" : "wedding",
            hostId: "60c72b2f9b1d8c0015f8a001",
            hostName: "ScanUtsav Host",
            autoApproveMedia: true,
          });
        } catch (createErr) {
          event = await Event.findOne({ code }).select("-password");
        }
      }

      if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
      return NextResponse.json({ success: true, event });
    }

    // Unfiltered event list requires host or super_admin authentication
    const auth = requireAuth(req, ["host", "super_admin"]);
    if (auth.response) return auth.response;

    const filter = auth.user?.role === "super_admin" ? {} : { hostId: auth.user?.userId };
    const events = await Event.find(filter).select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Enforce Host or Super Admin authorization
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const body = await req.json();

    const { title, eventType, hostName, code } = body;
    if (!title || !code) {
      return NextResponse.json({ error: "Title and Event Code required" }, { status: 400 });
    }

    const existing = await Event.findOne({ code });
    if (existing) {
      return NextResponse.json({ error: "Event code already taken" }, { status: 409 });
    }

    const newEvent = await Event.create({
      ...body,
      hostId: auth.user?.userId || "anonymous",
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}
