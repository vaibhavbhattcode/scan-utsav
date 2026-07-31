import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { requireAuth } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status") || "approved";

    let filter: any = {};
    if (eventId) filter.eventId = eventId;
    if (status !== "all") filter.status = status;

    const mediaList = await Media.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, media: mediaList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch media" }, { status: 500 });
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
    await connectDB();
    const body = await req.json();

    const { eventId, mediaUrl, mediaType, uploaderName, wishMessage } = body;
    if (!eventId || !mediaUrl) {
      return NextResponse.json({ error: "eventId and mediaUrl are required" }, { status: 400 });
    }

    const newMedia = await Media.create({
      eventId,
      mediaUrl,
      mediaType: mediaType || "image",
      uploaderName: uploaderName || "Guest",
      wishMessage: wishMessage || "",
      status: "approved",
    });

    return NextResponse.json({ success: true, media: newMedia }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload media" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // Enforce Host or Super Admin authorization for moderation actions
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { mediaId, status } = await req.json();

    if (!mediaId || !status) {
      return NextResponse.json({ error: "mediaId and status required" }, { status: 400 });
    }

    const updated = await Media.findByIdAndUpdate(mediaId, { status }, { new: true });
    return NextResponse.json({ success: true, media: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to moderate media" }, { status: 500 });
  }
}
