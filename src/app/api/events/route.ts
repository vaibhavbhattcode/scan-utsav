import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";
import { PLAN_EVENT_LIMITS } from "@/lib/razorpay";
import { sanitizeInput } from "@/lib/security";

async function attachMediaCounts(events: any[]) {
  if (!events.length) return [];
  const ids = events.flatMap((e) => [e._id.toString(), e.code].filter(Boolean));
  const counts = await Media.aggregate([
    { $match: { eventId: { $in: ids } } },
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map<string, number>();
  for (const row of counts) {
    countMap.set(String(row._id), row.count);
  }
  return events.map((e) => {
    const id = e._id.toString();
    return {
      ...e,
      _id: id,
      mediaCount: (countMap.get(id) || 0) + (countMap.get(e.code) || 0),
    };
  });
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toLowerCase();

    // Public guest lookup by event code
    if (code) {
      const event: any = await Event.findOne({ code }).select("-password").lean();
      if (!event) {
        return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
      }

      // Fetch the host's active subscription plan
      const hostUser = await User.findById(event.hostId).select("subscriptionPlan").lean();
      const hostPlan = (hostUser as any)?.subscriptionPlan || "trial";

      return NextResponse.json({
        success: true,
        event: { ...event, _id: (event as any)._id.toString(), hostPlan },
      });
    }

    // Host / admin event list
    const auth = requireAuth(req, ["host", "super_admin"]);
    if (auth.response) return auth.response;

    const hostIdFilter = searchParams.get("hostId");
    
    let filter: any = {};
    if (auth.user!.role === "super_admin") {
      if (hostIdFilter) {
        filter.hostId = hostIdFilter;
      }
    } else {
      filter.hostId = auth.user!.userId;
    }

    const events = await Event.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const withCounts = await attachMediaCounts(events as any[]);
    return NextResponse.json({ success: true, events: withCounts });
  } catch (error: any) {
    console.error("GET Events Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const body = await req.json();
    const title = sanitizeInput(String(body.title || "").trim().slice(0, 120));
    const normalizedCode = String(body.code || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 64);
    const eventType = String(body.eventType || "wedding").slice(0, 40);
    const hostName = sanitizeInput(String(body.hostName || auth.user!.name || "ScanUtsav Host").slice(0, 80));
    const isPasswordProtected = Boolean(body.isPasswordProtected);
    const password = isPasswordProtected ? String(body.password || "") : undefined;
    const autoApproveMedia = body.autoApproveMedia !== false;

    if (!title || !normalizedCode) {
      return NextResponse.json({ error: "Title and Event Code required" }, { status: 400 });
    }
    if (isPasswordProtected && (!password || password.length < 4)) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const user = await User.findById(auth.user!.userId).select("subscriptionPlan").lean();
    const plan = (user as any)?.subscriptionPlan || "starter";
    const limit = PLAN_EVENT_LIMITS[plan] ?? 3;

    if (auth.user!.role !== "super_admin") {
      const ownedCount = await Event.countDocuments({ hostId: auth.user!.userId });
      if (ownedCount >= limit) {
        return NextResponse.json(
          {
            error: `Your ${plan} plan allows up to ${limit} events. Upgrade to create more.`,
            code: "EVENT_LIMIT",
            limit,
          },
          { status: 403 }
        );
      }
    }

    const existing = await Event.findOne({ code: normalizedCode }).select("_id").lean();
    if (existing) {
      return NextResponse.json({ error: "Event code already taken" }, { status: 409 });
    }

    const newEvent = await Event.create({
      title,
      code: normalizedCode,
      eventType,
      hostId: auth.user!.userId,
      hostName,
      isPasswordProtected,
      password,
      autoApproveMedia,
      coverImage: body.coverImage || "",
      welcomeMessage: sanitizeInput(String(body.welcomeMessage || "Scan to share your photos and wishes!").slice(0, 300)),
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      venueName: body.venueName ? sanitizeInput(String(body.venueName).slice(0, 120)) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        event: {
          ...newEvent.toObject(),
          _id: newEvent._id.toString(),
          password: undefined,
          mediaCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Events Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const body = await req.json();
    const eventId = body.eventId || body.id;
    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return NextResponse.json({ error: "Valid eventId required" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (auth.user!.role !== "super_admin" && event.hostId !== auth.user!.userId) {
      return NextResponse.json({ error: "You do not own this event" }, { status: 403 });
    }

    const allowed = ["title", "welcomeMessage", "autoApproveMedia", "isPasswordProtected", "venueName", "themeColor", "coverImage", "eventDate", "isUploadDisabled"] as const;
    for (const key of allowed) {
      if (body[key] !== undefined) {
        (event as any)[key] = key === "title" || key === "welcomeMessage" || key === "venueName"
          ? sanitizeInput(String(body[key]).slice(0, 300))
          : body[key];
      }
    }

    if (body.code && body.code !== event.code) {
      const newCode = String(body.code).trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
      if (newCode && newCode !== event.code) {
        const existing = await Event.findOne({ code: newCode, _id: { $ne: event._id } });
        if (existing) {
          return NextResponse.json({ error: "Event code already taken by another event" }, { status: 409 });
        }
        event.code = newCode;
      }
    }

    if (body.password && event.isPasswordProtected) {
      event.password = String(body.password);
    }

    await event.save();
    const obj = event.toObject();
    delete (obj as any).password;
    return NextResponse.json({ success: true, event: { ...obj, _id: event._id.toString() } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || searchParams.get("id");
    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return NextResponse.json({ error: "Valid eventId required" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (auth.user!.role !== "super_admin" && event.hostId !== auth.user!.userId) {
      return NextResponse.json({ error: "You do not own this event" }, { status: 403 });
    }

    await Media.deleteMany({ eventId: { $in: [eventId, event.code] } });
    await Event.deleteOne({ _id: eventId });

    return NextResponse.json({ success: true, deleted: eventId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete event" }, { status: 500 });
  }
}
