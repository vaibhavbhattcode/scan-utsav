import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import Event from "@/models/Event";
import User from "@/models/User";
import { matchSelfieToMediaList } from "@/lib/face-recognition";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { eventId, selfieData } = body;

    if (!eventId || !selfieData) {
      return NextResponse.json({ error: "eventId and selfieData are required" }, { status: 400 });
    }

    // Verify Event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Import User to determine Host's subscription plan
    const hostUser = await User.findById(event.hostId);
    const hostPlan = hostUser?.subscriptionPlan || "starter"; // Default active events to starter/royal

    if (hostPlan === "free") {
      return NextResponse.json(
        {
          error: "AI Face Recognition is a premium feature available on Royal & Enterprise plans. Ask the host to upgrade to unlock AI photo searching!",
          isUpgradeRequired: true,
          planType: hostPlan,
        },
        { status: 403 }
      );
    }

    // Fetch approved media items for this event
    const mediaItems = await Media.find({ eventId, status: "approved" }).lean();
    if (!mediaItems || mediaItems.length === 0) {
      return NextResponse.json({ success: true, matches: [], count: 0 });
    }

    // Filter image media only for face matching
    const imageItems = mediaItems.filter((m: any) => m.mediaType === "image");

    // Perform AI face matching
    const matches = await matchSelfieToMediaList(selfieData, imageItems as any);

    return NextResponse.json({
      success: true,
      matches,
      count: matches.length,
      totalScanned: imageItems.length,
      planType: hostPlan,
    });

  } catch (error: any) {
    console.error("AI Face Search API Error:", error);
    return NextResponse.json({ error: error.message || "Face search failed" }, { status: 500 });
  }
}
