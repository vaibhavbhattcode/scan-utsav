import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { withErrorHandling, ApiError } from "@/lib/api-handler";
import mongoose from "mongoose";
import { sanitizeInput } from "@/lib/security";

export const POST = withErrorHandling(async (req: Request) => {
  await connectDB();
  const body = await req.json();
  const { mediaId, author, text } = body;

  if (!mediaId || !text) {
    throw new ApiError("mediaId and text are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    throw new ApiError("Invalid media ID", 400);
  }

  const safeAuthor = sanitizeInput(String(author || "Guest").slice(0, 50));
  const safeText = sanitizeInput(String(text).slice(0, 500));

  const newComment = {
    id: new mongoose.Types.ObjectId().toString(),
    author: safeAuthor,
    text: safeText,
    createdAt: new Date(),
  };

  const updated = await Media.findByIdAndUpdate(
    mediaId,
    { $push: { comments: newComment } },
    { new: true }
  ).lean();

  if (!updated) {
    throw new ApiError("Media not found", 404);
  }

  return NextResponse.json({
    success: true,
    comment: newComment,
  });
});
