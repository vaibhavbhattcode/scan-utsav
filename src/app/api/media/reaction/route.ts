import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { withErrorHandling, ApiError } from "@/lib/api-handler";
import mongoose from "mongoose";

export const POST = withErrorHandling(async (req: Request) => {
  await connectDB();
  const body = await req.json();
  const { mediaId, type } = body;

  if (!mediaId || !type) {
    throw new ApiError("mediaId and type are required", 400);
  }

  const validTypes = ["love", "fire", "party", "clap"];
  if (!validTypes.includes(type)) {
    throw new ApiError("Invalid reaction type", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    throw new ApiError("Invalid media ID", 400);
  }

  // Increment the specific reaction count
  const updated = await Media.findByIdAndUpdate(
    mediaId,
    { $inc: { [`reactions.${type}`]: 1 } },
    { new: true }
  ).lean();

  if (!updated) {
    throw new ApiError("Media not found", 404);
  }

  return NextResponse.json({
    success: true,
    reactions: (updated as any).reactions,
  });
});
