import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import Event from "@/models/Event";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";
import { checkRateLimit, sanitizeInput } from "@/lib/security";
import { isTrustedCloudinaryUrl } from "@/lib/cloudinary";
import { verifyGuestEventToken } from "@/lib/auth";
import { PLAN_STORAGE_GB, PLAN_BY_ID } from "@/lib/razorpay";

async function isEventAuthorized(req: Request, event: any): Promise<boolean> {
  if (!event.isPasswordProtected) return true;

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieName = `scanutsav_guest_pass_${event.code.toLowerCase()}`;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  const guestToken = match ? decodeURIComponent(match[1]) : req.headers.get("x-guest-event-token");

  if (guestToken && verifyGuestEventToken(guestToken, event.code)) {
    return true;
  }

  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.user && (auth.user.role === "super_admin" || auth.user.userId === String(event.hostId))) {
    return true;
  }

  return false;
}

import { withErrorHandling } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { imageProcessingQueue } from "@/lib/queue";

export const GET = withErrorHandling(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const eventIdParam = searchParams.get("eventId");
    const eventCode = searchParams.get("eventCode");
    const status = searchParams.get("status") || "approved";

    try {
      await connectDB();
      const filter: Record<string, unknown> = {};

      if (!eventIdParam && !eventCode) {
        const auth = requireAuth(req, ["host", "super_admin"]);
        if (auth.response) return auth.response;

        if (auth.user!.role !== "super_admin") {
          const hostEvents = await Event.find({ hostId: auth.user!.userId }).select("_id code").lean();
          const ids = (hostEvents as any[]).flatMap((e) => [e._id.toString(), e.code]);
          if (!ids.length) {
            return NextResponse.json({ success: true, media: [] });
          }
          filter.eventId = { $in: ids };
        }
      } else {
        let event = null;
        if (eventCode) {
          event = await Event.findOne({ code: eventCode });
        }
        if (!event && eventIdParam && mongoose.isValidObjectId(eventIdParam)) {
          event = await Event.findById(eventIdParam);
        }

        if (event) {
          const authorized = await isEventAuthorized(req, event);
          if (!authorized) {
            return NextResponse.json(
              { success: false, error: "Password verification required to view media", isPasswordRequired: true },
              { status: 401 }
            );
          }
        }

        const eventIdStr = event?._id?.toString();
        const eventIds = new Set<string>();
        if (eventIdStr) eventIds.add(eventIdStr);
        if (eventCode) eventIds.add(eventCode);
        if (eventIdParam) eventIds.add(eventIdParam);

        if (eventIds.size === 0) {
          return NextResponse.json({ success: true, media: [] });
        }
        filter.eventId = { $in: Array.from(eventIds) };
      }

      const cursor = searchParams.get("cursor");
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

      if (cursor && mongoose.isValidObjectId(cursor)) {
        filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
      }

      if (status !== "all") filter.status = status;

      const media = (await Media.find(filter)
        .select("eventId uploaderName wishMessage mediaUrl mediaType status fileSizeBytes createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()) as Array<Record<string, any>>;

      const nextCursor = media.length === limit ? media[media.length - 1]._id?.toString() : null;

      return NextResponse.json({
        success: true,
        media: media.map((m) => ({
          ...m,
          _id: m._id?.toString(),
        })),
        nextCursor,
      });
    } catch (dbErr: any) {
      logger.error("DB offline, failed to fetch media from database", dbErr);
      return NextResponse.json({ success: false, error: "Database offline. Unable to fetch media." }, { status: 500 });
    }
  } catch (error: any) {
    logger.error("Media GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch media" }, { status: 500 });
  }
});

export const POST = withErrorHandling(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimit = checkRateLimit(ip, "media_upload", 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Upload rate limit reached. Please wait a minute." }, { status: 429 });
  }

  try {
    const body = await req.json();

    const eventCode = typeof body.eventCode === "string" ? body.eventCode.trim().toLowerCase() : "";
    const mediaUrl = typeof body.mediaUrl === "string" ? body.mediaUrl.trim() : "";
    const mediaType = body.mediaType === "video" ? "video" : "image";
    const uploaderName = sanitizeInput(String(body.uploaderName || "Guest").slice(0, 80));
    const wishMessage = sanitizeInput(String(body.wishMessage || "").slice(0, 500));
    const fileSizeBytes = Number(body.fileSizeBytes || 0);

    if (!mediaUrl) {
      return NextResponse.json({ error: "mediaUrl is required" }, { status: 400 });
    }

    const isLocalUpload = mediaUrl.startsWith("/uploads/") || mediaUrl.startsWith("/images/") || mediaUrl.startsWith("data:");
    if (!isLocalUpload && !isTrustedCloudinaryUrl(mediaUrl)) {
      return NextResponse.json({ error: "Only trusted upload URLs are accepted" }, { status: 400 });
    }

    // AI Explicit Content / Nudity Moderation Check on Direct Uploads
    if (mediaType === "image" && mediaUrl.startsWith("http")) {
      try {
        const imageRes = await fetch(mediaUrl, { signal: AbortSignal.timeout(6000) });
        if (imageRes.ok) {
          const arrayBuf = await imageRes.arrayBuffer();
          const imgBuffer = Buffer.from(arrayBuf);
          const { checkExplicitContent } = await import("@/lib/explicit-content-moderation");
          const moderation = await checkExplicitContent(imgBuffer);
          if (moderation.isExplicit) {
            logger.warn(`[Explicit Content Blocked in POST /api/media] URL: ${mediaUrl}, Skin Exposure: ${moderation.skinPercentage}%`);
            return NextResponse.json(
              { success: false, error: moderation.reason || "Upload rejected: Image contains explicit body exposure." },
              { status: 400 }
            );
          }
        }
      } catch (modErr) {
        logger.warn("NSFW moderation fetch warning (proceeding with upload)", modErr);
      }
    }

    try {
      await connectDB();
      // Import User model if not imported
      const User = mongoose.models.User || mongoose.model("User");
      
      let event = null;
      if (eventCode) {
        event = await Event.findOne({ code: eventCode });
      }
      if (!event && body.eventId && mongoose.isValidObjectId(body.eventId)) {
        event = await Event.findById(body.eventId);
      }

      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event not found. A valid event code is required to upload media." },
          { status: 404 }
        );
      }

      if (event.isUploadDisabled) {
        return NextResponse.json(
          { success: false, error: "Uploads have been paused for this event by the host." },
          { status: 403 }
        );
      }

      const hostUser = await User.findById(event.hostId).lean();
      const hostPlan = (hostUser as any)?.subscriptionPlan || "trial";
      const planConfig = PLAN_BY_ID[hostPlan];

      if (planConfig) {
        // Enforce guest limit
        const uniqueGuests = await Media.distinct("uploaderName", { eventId: event._id.toString() });
        if (uniqueGuests.length >= planConfig.maxGuests && !uniqueGuests.includes(uploaderName)) {
          return NextResponse.json(
            { success: false, error: `This event has reached the maximum limit of ${planConfig.maxGuests} guests for the ${planConfig.label} plan.` },
            { status: 403 }
          );
        }

        // Enforce photo/video limits
        const mediaCount = await Media.countDocuments({ eventId: event._id.toString(), mediaType });
        const maxAllowed = mediaType === "video" ? planConfig.maxVideos : planConfig.maxPhotos;
        if (mediaCount >= maxAllowed) {
          return NextResponse.json(
            { success: false, error: `This event has reached the maximum limit of ${maxAllowed} ${mediaType}s for the ${planConfig.label} plan.` },
            { status: 403 }
          );
        }
      }

      const status = event.autoApproveMedia ? "approved" : "pending";

      // Duplicate upload guard: prevent saving identical media URL for the same event
      const existingMedia = await Media.findOne({
        eventId: event._id.toString(),
        mediaUrl,
      }).lean();

      if (existingMedia) {
        return NextResponse.json({
          success: true,
          message: "Photo already uploaded to event album",
          media: {
            ...existingMedia,
            _id: (existingMedia as any)._id.toString(),
          },
        });
      }

      const mediaDoc = await Media.create({
        eventId: event._id.toString(),
        mediaUrl,
        mediaType,
        uploaderName,
        wishMessage,
        fileSizeBytes: fileSizeBytes || 0,
        status,
        aiProcessingStatus: mediaType === "image" ? "pending" : "completed",
      });

      if (mediaType === "image") {
        await imageProcessingQueue.add('process-image', {
          mediaId: mediaDoc._id.toString(),
          eventId: event._id.toString(),
          mediaUrl
        });
        logger.info(`Enqueued image ${mediaDoc._id} for processing`);
      }

      return NextResponse.json(
        {
          success: true,
          media: {
            _id: mediaDoc._id.toString(),
            eventId: event._id.toString(),
            eventCode: event.code || eventCode,
            mediaUrl,
            mediaType,
            uploaderName,
            wishMessage,
            fileSizeBytes: mediaDoc.fileSizeBytes,
            status,
            createdAt: mediaDoc.createdAt?.toISOString?.() || new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      logger.error("Failed to persist media to database", dbErr);
      return NextResponse.json({ error: "Failed to save upload to persistent database. Please try again." }, { status: 500 });
    }
  } catch (error: any) {
    logger.error("Media POST error:", error);
    return NextResponse.json({ error: "Upload processing failed" }, { status: 500 });
  }
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const { requireAuthFresh } = await import("@/lib/apiAuth");
  const auth = await requireAuthFresh(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { mediaId, status } = await req.json();

    if (!mediaId || !status) {
      return NextResponse.json({ error: "mediaId and status required" }, { status: 400 });
    }
    if (!["approved", "pending", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = (await Media.findById(mediaId).lean()) as {
      _id: mongoose.Types.ObjectId;
      eventId: string;
      status: string;
    } | null;
    if (!updated) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // IDOR Protection: Verify that authenticated host owns the event this media belongs to
    if (auth.user!.role !== "super_admin") {
      let event = await Event.findById(updated.eventId).lean();
      if (!event) {
        event = await Event.findOne({ code: updated.eventId }).lean();
      }
      if (!event || String((event as any).hostId) !== String(auth.user!.userId)) {
        return NextResponse.json({ error: "Access denied. You do not own the event for this media." }, { status: 403 });
      }
    }

    await Media.findByIdAndUpdate(mediaId, { status });

    return NextResponse.json({
      success: true,
      media: { _id: updated._id.toString(), status },
    });
  } catch (error: any) {
    logger.error("Media PATCH error:", error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const { requireAuthFresh } = await import("@/lib/apiAuth");
  const auth = await requireAuthFresh(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId") || searchParams.get("id");

    if (!mediaId || !mongoose.isValidObjectId(mediaId)) {
      return NextResponse.json({ error: "Valid mediaId is required" }, { status: 400 });
    }

    const media = await Media.findById(mediaId).lean();
    if (!media) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    // IDOR Protection: Verify that authenticated host owns the event this media belongs to
    if (auth.user!.role !== "super_admin") {
      const eventIdVal = (media as any).eventId;
      let event = await Event.findById(eventIdVal).lean();
      if (!event) {
        event = await Event.findOne({ code: eventIdVal }).lean();
      }
      if (!event || String((event as any).hostId) !== String(auth.user!.userId)) {
        return NextResponse.json({ error: "Access denied. You do not own the event for this media." }, { status: 403 });
      }
    }

    await Media.deleteOne({ _id: mediaId });

    return NextResponse.json({
      success: true,
      deletedMediaId: mediaId,
    });
  } catch (error: any) {
    logger.error("Media DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
});
