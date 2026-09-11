import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(ip, "cloudinary_upload", 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Upload rate limit reached. Please wait a minute." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventCodeRaw = (formData.get("eventCode") as string) || "";
    const eventCode = eventCodeRaw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const uploaderName = sanitizeInput(((formData.get("uploaderName") as string) || "Guest").slice(0, 80));
    const wishMessage = sanitizeInput(((formData.get("wishMessage") as string) || "").slice(0, 500));

    if (!file) {
      console.error("❌ [Cloudinary Upload Error]: No file provided in request");
      return NextResponse.json({ error: "File is required for upload" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      console.error(`❌ [Cloudinary Upload Error]: Invalid file type ${file.type}`);
      return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 });
    }

    if (isImage && file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Photo exceeds 25MB limit" }, { status: 400 });
    }
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Video exceeds 200MB limit" }, { status: 400 });
    }

    if (!eventCode || eventCode.length < 2) {
      return NextResponse.json({ error: "Valid eventCode is required" }, { status: 400 });
    }

    await connectDB();
    let event = await Event.findOne({ code: eventCode });
    if (!event) {
      return NextResponse.json({ error: `Event with code "${eventCode}" not found.` }, { status: 404 });
    }

    if (event && event.isPasswordProtected) {
      const { verifyGuestEventToken } = await import("@/lib/auth");
      const cookieHeader = req.headers.get("cookie") || "";
      const cookieName = `scanutsav_guest_pass_${event.code.toLowerCase()}`;
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
      const guestToken = match ? decodeURIComponent(match[1]) : req.headers.get("x-guest-event-token");

      if (!guestToken || !verifyGuestEventToken(guestToken, event.code)) {
        return NextResponse.json({ error: "Passcode verification required to upload to this event." }, { status: 401 });
      }
    }

    if (event) {
      const User = (await import("@/models/User")).default;
      const { PLAN_STORAGE_GB } = await import("@/lib/razorpay");
      const hostUser = await User.findById(event.hostId).select("subscriptionPlan").lean();
      const planKey = (hostUser as any)?.subscriptionPlan || "trial";
      const quotaGB = PLAN_STORAGE_GB[planKey] || 1;
      const maxBytes = quotaGB * 1024 * 1024 * 1024;

      const hostEvents = await Event.find({ hostId: event.hostId }).select("_id code").lean();
      const allHostEventIds = (hostEvents as any[]).flatMap((e) => [e._id.toString(), e.code]);

      const storageUsage = await Media.aggregate([
        { $match: { eventId: { $in: allHostEventIds } } },
        { $group: { _id: null, totalBytes: { $sum: "$fileSizeBytes" } } },
      ]);

      const currentBytes = storageUsage[0]?.totalBytes || 0;
      if (currentBytes + file.size > maxBytes) {
        return NextResponse.json(
          { error: `Host storage quota (${quotaGB} GB) exceeded. Please ask event host to upgrade.` },
          { status: 403 }
        );
      }
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    // Cloudinary upload starting for event

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // AI Explicit Content / Nudity Filter Check
    if (isImage) {
      const { checkExplicitContent } = await import("@/lib/explicit-content-moderation");
      const moderation = await checkExplicitContent(buffer);
      if (moderation.isExplicit) {
        console.warn(`🚫 [Explicit Moderation Blocked] File "${file.name}" rejected due to explicit skin exposure (${moderation.skinPercentage}%).`);
        return NextResponse.json(
          { success: false, error: moderation.reason || "Upload restricted: Image contains explicit or policy-violating content." },
          { status: 400 }
        );
      }
    }

    // Upload file directly to Cloudinary Account
    const cloudRes = await uploadToCloudinary(
      buffer,
      `scanutsav/${eventCode}`,
      isVideo ? "video" : "image"
    );

    // Cloudinary CDN upload success

    let record: any = null;

    try {
      await connectDB();
      let event = await Event.findOne({ code: eventCode });
      if (!event) {
        return NextResponse.json({ error: `Event "${eventCode}" not found during media save.` }, { status: 404 });
      }

      const eventId = event._id.toString();
      const status = event.autoApproveMedia ? "approved" : "pending";

      const mediaDoc = await Media.create({
        eventId,
        mediaUrl: cloudRes.secureUrl,
        mediaType: isVideo ? "video" : "image",
        fileSizeBytes: cloudRes.bytes || file.size,
        uploaderName,
        wishMessage,
        status,
      });

      record = {
        _id: mediaDoc._id.toString(),
        eventId,
        eventCode,
        mediaUrl: cloudRes.secureUrl,
        mediaType: isVideo ? "video" : "image",
        fileSizeBytes: cloudRes.bytes || file.size,
        uploaderName,
        wishMessage,
        status,
        createdAt: mediaDoc.createdAt?.toISOString?.() || new Date().toISOString(),
      };
    } catch (dbErr: any) {
      console.error("❌ [DB Connection Error]: Failed to persist uploaded media record:", dbErr.message);
      return NextResponse.json(
        { success: false, error: "Cloudinary upload succeeded, but persistent database record creation failed. Please retry." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, media: record, cdnUrl: cloudRes.secureUrl }, { status: 201 });
  } catch (error: any) {
    console.error("❌ [Cloudinary Upload API Exception]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file to Cloudinary" },
      { status: 500 }
    );
  }
}
