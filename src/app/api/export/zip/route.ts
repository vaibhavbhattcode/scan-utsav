import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventIdParam = searchParams.get("eventId") || searchParams.get("id") || searchParams.get("code");

    await connectDB();

    if (!eventIdParam) {
      return NextResponse.json({ error: "eventId or code parameter required" }, { status: 400 });
    }

    let event: any = await Event.findOne({ code: eventIdParam }).lean();
    if (!event && eventIdParam.length === 24) {
      event = await Event.findById(eventIdParam).lean();
    }

    const eventCode = event?.code || eventIdParam;
    const eventObjId = event?._id?.toString() || eventIdParam;

    const mediaList = await Media.find({
      eventId: { $in: [eventIdParam, eventCode, eventObjId] },
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      eventTitle: event?.title || "ScanUtsav Event",
      totalCount: mediaList.length,
      media: mediaList.map((m) => ({
        id: m._id,
        url: m.mediaUrl,
        type: m.mediaType || "image",
        uploaderName: m.uploaderName || "Guest",
        wishMessage: m.wishMessage || "",
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch event media package" }, { status: 500 });
  }
}
