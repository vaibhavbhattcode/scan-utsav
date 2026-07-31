import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  // Enforce Super Admin authorization
  const auth = requireAuth(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    let filter: any = {};

    if (category && category !== "all") {
      filter.eventType = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { hostName: { $regex: search, $options: "i" } },
      ];
    }

    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / limit) || 1;

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      events,
      page,
      limit,
      totalPages,
      totalEvents,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch admin events" }, { status: 500 });
  }
}
