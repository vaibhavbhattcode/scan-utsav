import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { getUploadPresignedUrl } from "@/lib/storage";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Presign upload is disabled in production. Please use Cloudinary upload signed endpoint." },
      { status: 404 }
    );
  }

  try {
    await connectDB().catch(() => null);
    const { eventCode, fileName, contentType, fileSize } = await req.json();

    if (!eventCode || !fileName || !contentType) {
      return NextResponse.json({ error: "eventCode, fileName, and contentType are required" }, { status: 400 });
    }

    let event = null;
    if (mongoose.connection.readyState === 1) {
      event = await Event.findOne({ code: eventCode }).catch(() => null);
    }
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventId = event._id.toString();

    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 });
    }

    const maxPhotoSize = 25 * 1024 * 1024;
    const maxVideoSize = 200 * 1024 * 1024;
    if (isImage && fileSize > maxPhotoSize) {
      return NextResponse.json({ error: "Photo size exceeds maximum 25MB limit" }, { status: 400 });
    }
    if (isVideo && fileSize > maxVideoSize) {
      return NextResponse.json({ error: "Video size exceeds maximum 200MB limit" }, { status: 400 });
    }

    const s3Res = await getUploadPresignedUrl(fileName, contentType, eventCode);
    return NextResponse.json({
      success: true,
      presignedUrl: s3Res.presignedUrl,
      cdnUrl: s3Res.cdnUrl,
      key: s3Res.key,
      eventId,
    });
  } catch (error: any) {
    console.error("Presign Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Presign upload failed. Cloudinary upload should be used instead." },
      { status: 500 }
    );
  }
}
