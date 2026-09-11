import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { requireAuth } from "@/lib/apiAuth";
import { PLAN_EVENT_LIMITS } from "@/lib/razorpay";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async (req: Request) => {
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  await connectDB();
    const userId = auth.user!.userId;
    const isAdmin = auth.user!.role === "super_admin";
    const filter = isAdmin ? {} : { hostId: userId };

    const [userDoc, totalEvents, hostEvents] = await Promise.all([
      User.findById(userId).select("subscriptionPlan storageUsedMB").lean(),
      Event.countDocuments(filter),
      Event.find(filter).select("_id code").lean(),
    ]);

    const eventIds = (hostEvents as any[]).map((e) => e._id.toString());
    const eventCodes = (hostEvents as any[]).map((e) => e.code);
    const allIds = Array.from(new Set([...eventIds, ...eventCodes]));
    const mediaFilter = allIds.length ? { eventId: { $in: allIds } } : { eventId: "__none__" };

    const [totalMemories, moderationQueue, storageResult, trendResult, topGuestsResult] = await Promise.all([
      Media.countDocuments(mediaFilter),
      Media.countDocuments({ ...mediaFilter, status: "pending" }),
      Media.aggregate([
        { $match: mediaFilter },
        { $group: { _id: null, totalBytes: { $sum: "$fileSizeBytes" } } },
      ]),
      Media.aggregate([
        { $match: { ...mediaFilter, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            uploads: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Media.aggregate([
        { $match: mediaFilter },
        { $group: { _id: "$uploaderName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const totalBytes = storageResult[0]?.totalBytes || 0;
    const usedMB = Math.round(totalBytes / (1024 * 1024));
    let userPlan = (userDoc as any)?.subscriptionPlan || "trial";

    // Format trends for chart
    const uploadTrends = trendResult.map((t: any) => ({
      date: t._id,
      uploads: t.uploads
    }));
    const topGuests = topGuestsResult.map((g: any) => ({
      name: g._id || "Guest",
      uploads: g.count
    }));

    // Auto-expire subscriptions if past endDate and fallback to free plan
    const activeSub = await Subscription.findOne({ userId, status: "active" }).sort({ createdAt: -1 });
    if (activeSub && activeSub.endDate && new Date(activeSub.endDate) < new Date()) {
      activeSub.status = "expired";
      await activeSub.save();
      await User.findByIdAndUpdate(userId, { subscriptionPlan: "trial" });
      userPlan = "trial";
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents,
        totalMemories,
        moderationQueue,
        usedMB,
        uniqueScans: totalMemories,
        userPlan,
        eventLimit: PLAN_EVENT_LIMITS[userPlan] ?? 3,
        uploadTrends,
        topGuests
      },
    });
});
