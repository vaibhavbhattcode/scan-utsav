import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { requireAuth } from "@/lib/apiAuth";
import { ADDON_CATALOG } from "@/lib/razorpay";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const auth = requireAuth(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { eventId, addonId } = await req.json();

    if (!eventId || !addonId) {
      return NextResponse.json({ error: "eventId and addonId are required" }, { status: 400 });
    }

    const addon = ADDON_CATALOG[addonId];
    if (!addon) {
      return NextResponse.json({ error: "Invalid addonId" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isPurchased = event.purchasedAddons?.some((a: any) => a.addonId === addonId);
    if (isPurchased) {
      return NextResponse.json({ error: "Add-on already granted to this event" }, { status: 400 });
    }

    await Event.findByIdAndUpdate(eventId, {
      $push: { purchasedAddons: { addonId, purchasedAt: new Date() } }
    });

    writeAuditLog({
      action: "admin_granted_addon",
      userEmail: auth.user!.email,
      role: auth.user!.role,
      status: 200,
      details: `Admin granted Add-on ${addonId} to Event ${eventId}`,
    });

    return NextResponse.json({ success: true, message: `Add-on ${addon.name} granted successfully!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to grant add-on" }, { status: 500 });
  }
}
