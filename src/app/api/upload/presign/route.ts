import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { getUploadPresignedUrl } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { eventCode, fileName, contentType, fileSize } = await req.json();

    if (!eventCode || !fileName || !contentType) {
      return NextResponse.json({ error: "eventCode, fileName, and contentType are required" }, { status: 400 });
    }

    // 1. Verify Event exists
    const event = await Event.findOne({ code: eventCode });
    if (!event) {
      return NextResponse.json({ error: "Invalid event code" }, { status: 404 });
    }

    // 2. Validate Content-Type
    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 });
    }

    // 3. Size Limits (25MB photo, 200MB video)
    const maxPhotoSize = 25 * 1024 * 1024;
    const maxVideoSize = 200 * 1024 * 1024;
    if (isImage && fileSize > maxPhotoSize) {
      return NextResponse.json({ error: "Photo size exceeds maximum 25MB limit" }, { status: 400 });
    }
    if (isVideo && fileSize > maxVideoSize) {
      return NextResponse.json({ error: "Video size exceeds maximum 200MB limit" }, { status: 400 });
    }

    // 4. Generate Presigned URL
    const { presignedUrl, cdnUrl, key } = await getUploadPresignedUrl(fileName, contentType, eventCode);

    return NextResponse.json({
      success: true,
      presignedUrl,
      cdnUrl,
      key,
      eventId: event._id.toString(),
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate presigned upload URL" }, { status: 500 });
  }
}
