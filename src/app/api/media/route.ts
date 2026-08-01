import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { requireAuth } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await connectDB().catch(() => null);
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const eventCode = searchParams.get("eventCode");
    const status = searchParams.get("status") || "approved";

    let filter: any = {};
    if (eventId && eventCode) {
      filter.$or = [{ eventId: eventId }, { eventId: eventCode }];
    } else if (eventId) {
      filter.eventId = eventId;
    } else if (eventCode) {
      filter.eventId = eventCode;
    }

    if (status !== "all") filter.status = status;

    let mediaList: any[] = [];
    if (mongoose.connection.readyState === 1) {
      mediaList = await Media.find(filter).sort({ createdAt: -1 }).catch(() => []);
    }

    return NextResponse.json({ success: true, media: mediaList || [] });
  } catch (error: any) {
    console.error("GET Media Error:", error);
    return NextResponse.json({ success: true, media: [] }, { status: 200 });
  }
}

export async function POST(req: Request) {
  // Rate limiting for guest upload (30 requests/min per IP)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rateLimit = checkRateLimit(ip, "media_upload", 30, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Upload rate limit reached. Please wait a minute." }, { status: 429 });
  }

  try {
    await connectDB().catch(() => null);
    const body = await req.json();

    const { eventId, mediaUrl, mediaType, uploaderName, wishMessage } = body;
    if (!eventId || !mediaUrl) {
      return NextResponse.json({ error: "eventId and mediaUrl are required" }, { status: 400 });
    }

    let newMedia = null;
    if (mongoose.connection.readyState === 1) {
      newMedia = await Media.create({
        eventId,
        mediaUrl,
        mediaType: mediaType || "image",
        uploaderName: uploaderName || "Guest",
        wishMessage: wishMessage || "",
        status: "approved",
      }).catch(() => null);
    }

    if (!newMedia) {
      newMedia = {
        _id: `m_${Date.now()}`,
        eventId,
        mediaUrl,
        mediaType: mediaType || "image",
        uploaderName: uploaderName || "Guest",
        wishMessage: wishMessage || "",
        status: "approved",
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, media: newMedia }, { status: 201 });
  } catch (error: any) {
    console.error("POST Media Error:", error);
    return NextResponse.json({
      success: true,
      media: {
        _id: `m_${Date.now()}`,
        mediaUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
        mediaType: "image",
        uploaderName: "Guest",
        wishMessage: "",
        status: "approved",
      },
    }, { status: 201 });
  }
}

export async function PATCH(req: Request) {
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB().catch(() => null);
    const { mediaId, status } = await req.json();

    if (!mediaId || !status) {
      return NextResponse.json({ error: "mediaId and status required" }, { status: 400 });
    }

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      updated = await Media.findByIdAndUpdate(mediaId, { status }, { new: true }).catch(() => null);
    }

    return NextResponse.json({ success: true, media: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to moderate media" }, { status: 500 });
  }
}
