import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { requireAuthFresh } from "@/lib/apiAuth";
import QRCode from "qrcode";

export async function GET(req: Request, { params }: { params: { eventId: string } }) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const event = await Event.findById(params.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const host = req.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const eventUrl = `${protocol}://${host}/e/${event.code}`;

    // Generate high quality QR code data URI
    const qrDataUrl = await QRCode.toDataURL(eventUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    return NextResponse.json({ success: true, qrDataUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
