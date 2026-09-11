import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import Event from "@/models/Event";
import User from "@/models/User";
import { logger } from "@/lib/logger";
import { canAccessFeature } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    await connectDB().catch(() => null);
    const body = await req.json();
    const { eventId, selfieData } = body;

    if (!eventId || !selfieData) {
      return NextResponse.json({ error: "eventId and selfieData are required" }, { status: 400 });
    }

    // Safely resolve event by ObjectId or by event code
    let event = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(eventId)) {
        event = await Event.findById(eventId).lean().catch(() => null) as any;
      }
      if (!event) {
        event = await Event.findOne({ code: eventId }).lean().catch(() => null) as any;
      }
    }
    
    const resolvedEventId = event ? (event as any)._id.toString() : eventId;

    if (event) {
      const hostUser = await User.findById(event.hostId).select("subscriptionPlan").lean();
      const hostPlan = (hostUser as any)?.subscriptionPlan || "trial";
      if (!canAccessFeature(hostPlan, "face-search")) {
        return NextResponse.json({ success: false, error: "Upgrade to Premium to unlock AI Face Search!" }, { status: 403 });
      }
    }
    // Call Python FastAPI FAISS service
    const pythonAiUrl = process.env.PYTHON_FACE_AI_URL || "http://localhost:5000";
    
    const pythonRes = await fetch(`${pythonAiUrl}/search-faces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: resolvedEventId,
        selfie: selfieData
      })
    });

    if (!pythonRes.ok) {
      const errText = await pythonRes.text();
      throw new Error(`Python AI Error: ${errText}`);
    }

    const aiData = await pythonRes.json();
    
    if (!aiData.success) {
       return NextResponse.json({ success: false, error: aiData.error || "No matching faces found." });
    }
    
    if (!aiData.matches || aiData.matches.length === 0) {
       return NextResponse.json({ success: true, matches: [], count: 0 });
    }

    // Match mediaIds from python to full MongoDB media objects
    const matchedMediaIds = aiData.matches.map((m: any) => m.mediaId);
    
    let dbMediaList: any[] = [];
    if (matchedMediaIds.length > 0 && mongoose.connection.readyState === 1) {
      dbMediaList = await Media.find({
        _id: { $in: matchedMediaIds },
        status: "approved",
      }).lean().catch(() => []);
    }

    // Map AI results to the format expected by the frontend
    const matches = aiData.matches.map((match: any) => {
      const item = dbMediaList.find((m) => m._id.toString() === match.mediaId);
      if (!item) return null;
      return {
        mediaId: match.mediaId,
        mediaUrl: item.mediaUrl,
        uploaderName: item.uploaderName || "Guest",
        wishMessage: item.wishMessage,
        confidenceScore: match.confidence,
        isMatched: true,
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      matches,
      count: matches.length,
      diagnostic_logs: aiData.diagnostic_logs || null,
      totalScanned: aiData.totalScanned || 0,
    });

  } catch (error: any) {
    logger.error("AI Face Search API Error:", error.message);
    return NextResponse.json({
      success: false,
      error: "Face search failed. Please try again."
    }, { status: 500 });
  }
}
