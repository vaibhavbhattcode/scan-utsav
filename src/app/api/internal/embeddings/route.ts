import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";

// This is an internal API for the Python AI service to fetch all embeddings and rebuild FAISS indices on startup.
// In a real production system, this should be protected by an internal API key or firewall.
export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    
    await connectDB();
    
    // If eventId is provided, sync only that event. Otherwise, sync all events.
    const query = eventId ? { eventId, faceCount: { $gt: 0 } } : { faceCount: { $gt: 0 } };
    
    // Fetch only the necessary fields to keep payload size small
    const mediaItems = await Media.find(query).select("_id eventId faces").lean();
    
    const embeddingsData = mediaItems.map((item: any) => ({
      mediaId: item._id.toString(),
      eventId: item.eventId,
      embeddings: item.faces.map((f: any) => f.embedding)
    }));
    
    // Group by eventId for easier syncing
    const groupedByEvent: Record<string, any[]> = {};
    for (const item of embeddingsData) {
      if (!groupedByEvent[item.eventId]) {
        groupedByEvent[item.eventId] = [];
      }
      groupedByEvent[item.eventId].push({
        mediaId: item.mediaId,
        embeddings: item.embeddings
      });
    }
    
    return NextResponse.json({ success: true, data: groupedByEvent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
