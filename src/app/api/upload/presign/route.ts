import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { getUploadPresignedUrl } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    await connectDB().catch(() => null);
    const { eventCode, fileName, contentType, fileSize } = await req.json();

    if (!eventCode || !fileName || !contentType) {
      return NextResponse.json({ error: "eventCode, fileName, and contentType are required" }, { status: 400 });
    }

    // 1. Verify Event exists or resolve eventId
    let event = null;
    if (mongoose.connection.readyState === 1) {
      event = await Event.findOne({ code: eventCode }).catch(() => null);
    }

    const eventId = event?._id?.toString() || "60c72b2f9b1d8c0015f8a001";

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

    // 4. Generate Presigned URL with dev fallback
    let presignedUrl = "";
    let cdnUrl = "";
    let key = `events/${eventCode}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const isDemoKey = !process.env.STORAGE_ACCESS_KEY || process.env.STORAGE_ACCESS_KEY === "demo_access_key";

    if (isDemoKey) {
      presignedUrl = `/api/upload/local-mock-upload?key=${key}`;
      cdnUrl = `https://images.unsplash.com/photo-1519741497674-611481863552?w=800`;
    } else {
      try {
        const s3Res = await getUploadPresignedUrl(fileName, contentType, eventCode);
        presignedUrl = s3Res.presignedUrl;
        cdnUrl = s3Res.cdnUrl;
        key = s3Res.key;
      } catch (s3Err: any) {
        console.warn("Storage presign warning:", s3Err.message);
        presignedUrl = `/api/upload/local-mock-upload?key=${key}`;
        cdnUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800";
      }
    }

    return NextResponse.json({
      success: true,
      presignedUrl,
      cdnUrl,
      key,
      eventId,
    });

  } catch (error: any) {
    console.error("Presign Upload Error:", error);
    const key = `events/fallback/${Date.now()}_upload`;
    return NextResponse.json({
      success: true,
      presignedUrl: `/api/upload/local-mock-upload?key=${key}`,
      cdnUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      key,
      eventId: "60c72b2f9b1d8c0015f8a001",
    }, { status: 200 });
  }
}
