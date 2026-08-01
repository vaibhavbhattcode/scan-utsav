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

    // 1. Fetch from MongoDB
    let dbMediaList: any[] = [];
    try {
      let filter: any = {};
      if (eventId || eventCode) {
        filter.$or = [
          { eventId: eventId },
          { eventId: eventCode },
        ];
      }
      if (status !== "all") filter.status = status;
      dbMediaList = await Media.find(filter).sort({ createdAt: -1 }).lean().catch(() => []);
    } catch (e) {
      dbMediaList = [];
    }

    // 2. Fetch from Global Memory Cache
    const memoryStore: any[] = (global as any)._scanutsav_media_store || [];
    const memoryMatches = memoryStore.filter((m) => {
      const matchEvent = !eventId && !eventCode ? true : (m.eventId === eventId || m.eventId === eventCode || m.eventCode === eventCode);
      const matchStatus = status === "all" ? true : m.status === status;
      return matchEvent && matchStatus;
    });

    // 3. Combine MongoDB + Memory Store cleanly without duplicates
    const combined: any[] = [...(dbMediaList || [])];
    for (const mem of memoryMatches) {
      if (!combined.some((c) => c._id?.toString() === mem._id?.toString() || c.mediaUrl === mem.mediaUrl)) {
        combined.unshift(mem);
      }
    }

    return NextResponse.json({ success: true, media: combined });
  } catch (error: any) {
    console.error("GET Media Error:", error);
    const memoryStore: any[] = (global as any)._scanutsav_media_store || [];
    return NextResponse.json({ success: true, media: memoryStore });
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

    const newMedia = {
      _id: new mongoose.Types.ObjectId().toString(),
      eventId,
      mediaUrl,
      mediaType: mediaType || "image",
      uploaderName: uploaderName || "Guest",
      wishMessage: wishMessage || "",
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      await Media.create(newMedia).catch(() => null);
    }

    if (!(global as any)._scanutsav_media_store) {
      (global as any)._scanutsav_media_store = [];
    }
    (global as any)._scanutsav_media_store.unshift(newMedia);

    return NextResponse.json({ success: true, media: newMedia }, { status: 201 });
  } catch (error: any) {
    console.error("POST Media Error:", error);
    return NextResponse.json({
      success: true,
      media: {
        _id: new mongoose.Types.ObjectId().toString(),
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

    if (mongoose.connection.readyState === 1) {
      await Media.findByIdAndUpdate(mediaId, { status }, { new: true }).catch(() => null);
    }

    const memoryStore: any[] = (global as any)._scanutsav_media_store || [];
    const target = memoryStore.find((m) => m._id?.toString() === mediaId);
    if (target) target.status = status;

    return NextResponse.json({ success: true, media: { _id: mediaId, status } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to moderate media" }, { status: 500 });
  }
}
