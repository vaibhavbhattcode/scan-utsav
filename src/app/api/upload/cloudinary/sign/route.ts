import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import Media from "@/models/Media";
import { getSignedUploadParams } from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/security";
import { verifyGuestEventToken } from "@/lib/auth";
import { requireAuth } from "@/lib/apiAuth";
import { PLAN_STORAGE_GB, PLAN_VALIDITY_DAYS } from "@/lib/razorpay";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(ip, "cloudinary_sign", 40, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many upload requests. Please wait a minute." }, { status: 429 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const eventCode = String(body.eventCode || "").trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const resourceType = body.resourceType === "video" ? "video" : "image";
    const fileSize = Number(body.fileSize || 0);

    if (!eventCode || eventCode.length < 2) {
      return NextResponse.json({ error: "Valid eventCode is required" }, { status: 400 });
    }

    if (resourceType === "image" && fileSize > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Photo exceeds 25MB limit" }, { status: 400 });
    }
    if (resourceType === "video" && fileSize > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Video exceeds 200MB limit" }, { status: 400 });
    }

    // 1. Verify Event exists and uploads are active
    const event = await Event.findOne({ code: eventCode });
    if (!event) {
      return NextResponse.json({ error: "Event not found. Valid event code required." }, { status: 404 });
    }
    if (event.isUploadDisabled) {
      return NextResponse.json({ error: "Uploads have been paused by the host for this event." }, { status: 403 });
    }

    // 2. Check Password Protection (C4)
    if (event.isPasswordProtected) {
      const cookieHeader = req.headers.get("cookie") || "";
      const cookieName = `scanutsav_guest_pass_${eventCode}`;
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
      const guestToken = match ? decodeURIComponent(match[1]) : req.headers.get("x-guest-event-token");

      let isAuthorized = false;
      if (guestToken && verifyGuestEventToken(guestToken, eventCode)) {
        isAuthorized = true;
      } else {
        const hostAuth = requireAuth(req, ["host", "super_admin"]);
        if (hostAuth.user && (hostAuth.user.role === "super_admin" || hostAuth.user.userId === String(event.hostId))) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Event is password protected. Verification required." },
          { status: 401 }
        );
      }
    }

    // 3. Check Event Plan Expiry / Storage Retention Validity
    const hostUser = await User.findById(event.hostId).select("subscriptionPlan").lean();
    const planKey = (hostUser as any)?.subscriptionPlan || "trial";
    const validityDays = PLAN_VALIDITY_DAYS[planKey] || 7;
    const eventAgeDays = (Date.now() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (eventAgeDays > validityDays) {
      return NextResponse.json(
        { error: `Event storage validity period (${validityDays} days) has expired for the ${planKey} plan. Upgrade plan to resume uploads.` },
        { status: 403 }
      );
    }

    // 4. Check Host Storage Quota (H6)
    const quotaGB = PLAN_STORAGE_GB[planKey] || 1;
    const maxBytes = quotaGB * 1024 * 1024 * 1024;

    const hostEvents = await Event.find({ hostId: event.hostId }).select("_id code").lean();
    const allHostEventIds = (hostEvents as any[]).flatMap((e) => [e._id.toString(), e.code]);

    const storageUsage = await Media.aggregate([
      { $match: { eventId: { $in: allHostEventIds } } },
      { $group: { _id: null, totalBytes: { $sum: "$fileSizeBytes" } } },
    ]);

    const currentBytes = storageUsage[0]?.totalBytes || 0;
    if (currentBytes + fileSize > maxBytes) {
      return NextResponse.json(
        { error: `Host storage quota (${quotaGB} GB) exceeded. Please ask event host to upgrade.` },
        { status: 403 }
      );
    }

    const folder = `scanutsav/${eventCode}`;
    const signed = getSignedUploadParams(folder, resourceType);

    return NextResponse.json({
      success: true,
      ...signed,
      uploadUrl: `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
    });
  } catch (error: any) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to prepare Cloudinary upload" },
      { status: 500 }
    );
  }
}
