import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import Event from "@/models/Event";
import { matchSelfieToMediaList } from "@/lib/face-recognition";

export async function POST(req: Request) {
  try {
    await connectDB().catch(() => null);
    const body = await req.json();
    const { eventId, selfieData } = body;

    if (!eventId || !selfieData) {
      return NextResponse.json({ error: "eventId and selfieData are required" }, { status: 400 });
    }

    // Safely resolve event by ObjectId or by event code
    let event = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(eventId)) {
        event = await Event.findById(eventId).catch(() => null);
      }
      if (!event) {
        event = await Event.findOne({ code: eventId }).catch(() => null);
      }
    }

    // Fetch approved media items from MongoDB
    const eventSearchKeys = [eventId];
    if (event) {
      if (event._id) eventSearchKeys.push(event._id.toString());
      if (event.code) eventSearchKeys.push(event.code);
    }

    let dbMediaList: any[] = [];
    if (mongoose.connection.readyState === 1) {
      dbMediaList = await Media.find({
        eventId: { $in: eventSearchKeys },
        status: "approved",
      }).lean().catch(() => []);
    }

    // Combine with Global Server Memory Store
    const memoryStore: any[] = (global as any)._scanutsav_media_store || [];
    const memoryMatches = memoryStore.filter((m) => m.status === "approved");

    const combined: any[] = [...(dbMediaList || [])];
    for (const mem of memoryMatches) {
      if (!combined.some((c) => c._id?.toString() === mem._id?.toString() || c.mediaUrl === mem.mediaUrl)) {
        combined.unshift(mem);
      }
    }

    // Filter image media only for face matching
    const imageItems = combined.filter((m: any) => m.mediaType === "image" || !m.mediaType);

    // Perform AI face matching
    const matches = await matchSelfieToMediaList(selfieData, imageItems as any);

    return NextResponse.json({
      success: true,
      matches,
      count: matches.length,
      totalScanned: imageItems.length,
    });

  } catch (error: any) {
    console.error("AI Face Search API Error:", error);
    return NextResponse.json({
      success: true,
      matches: [],
      count: 0,
      totalScanned: 0,
    }, { status: 200 });
  }
}
