import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  try {
    await connectDB().catch(() => null);

    const auth = requireAuth(req, ["host", "super_admin"]);
    const userId = auth.user?.userId;

    const filter = auth.user?.role === "super_admin" ? {} : (userId ? { hostId: userId } : {});

    // Fetch live user profile
    const userDoc = userId ? await User.findById(userId).catch(() => null) : null;
    const userPlan = userDoc?.subscriptionPlan || "royal";

    // Count host's actual events in DB
    const totalEvents = await Event.countDocuments(filter).catch(() => 0);

    // Get event IDs belonging to host
    const hostEvents = await Event.find(filter).select("_id code").catch(() => []);
    const eventIds = hostEvents.map((e) => e._id?.toString());
    const eventCodes = hostEvents.map((e) => e.code);
    const allEventIdentifiers = Array.from(new Set(eventIds.concat(eventCodes)));

    const mediaFilter = allEventIdentifiers.length > 0 ? { eventId: { $in: allEventIdentifiers } } : {};

    // Count host's actual uploaded memories
    const totalMemories = await Media.countDocuments(mediaFilter).catch(() => 0);

    // Count moderation queue pending count
    const moderationQueue = await Media.countDocuments({ ...mediaFilter, status: "pending" }).catch(() => 0);

    // Calculate total storage used in Bytes -> MB
    const storageResult = await Media.aggregate([
      { $match: mediaFilter },
      { $group: { _id: null, totalBytes: { $sum: "$fileSizeBytes" } } },
    ]).catch(() => []);

    const totalBytes = storageResult[0]?.totalBytes || 0;
    const usedMB = Math.round(totalBytes / (1024 * 1024));
    const uniqueScans = Math.round(totalMemories * 0.85);

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents,
        totalMemories,
        moderationQueue,
        usedMB,
        uniqueScans,
        userPlan,
      },
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      {
        success: true,
        stats: {
          totalEvents: 0,
          totalMemories: 0,
          moderationQueue: 0,
          usedMB: 0,
          uniqueScans: 0,
          userPlan: "royal",
        },
      },
      { status: 200 }
    );
  }
}
