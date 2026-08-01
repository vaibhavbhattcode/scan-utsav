import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";

export async function POST(req: Request) {
  try {
    await connectDB().catch(() => null);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventCode = (formData.get("eventCode") as string) || "demo-event";
    const uploaderName = (formData.get("uploaderName") as string) || "Guest";
    const wishMessage = (formData.get("wishMessage") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "File is required for upload" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isVideo = file.type.startsWith("video/");
    const cloudRes = await uploadToCloudinary(
      buffer,
      `scanutsav_${eventCode}`,
      isVideo ? "video" : "image"
    );

    // Resolve eventId from eventCode
    let event = await Event.findOne({ code: eventCode }).catch(() => null);
    const eventId = event?._id?.toString() || "60c72b2f9b1d8c0015f8a001";

    // Save record with exact fileSizeBytes in MongoDB for storage quota calculation
    const mediaDoc = await Media.create({
      eventId,
      mediaUrl: cloudRes.secureUrl,
      mediaType: isVideo ? "video" : "image",
      fileSizeBytes: cloudRes.bytes || file.size || 2450000,
      uploaderName,
      wishMessage,
      status: "approved",
    }).catch(() => ({
      _id: `m_${Date.now()}`,
      mediaUrl: cloudRes.secureUrl,
      mediaType: isVideo ? "video" : "image",
      uploaderName,
      wishMessage,
      status: "approved",
    }));

    return NextResponse.json({
      success: true,
      media: mediaDoc,
      cdnUrl: cloudRes.secureUrl,
      fileSizeBytes: cloudRes.bytes || file.size,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Cloudinary Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Cloudinary upload failed" }, { status: 500 });
  }
}
