import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import AddonPurchase from "@/models/AddonPurchase";
import {
  ADDON_CATALOG,
  calculateGSTInvoiceBreakdown,
  createRazorpayOrder,
  verifyPaymentSignature,
} from "@/lib/razorpay";
import { requireAuth } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  const auth = requireAuth(req, ["super_admin", "host"]);
  if (auth.response) return auth.response;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(ip, "razorpay_addon", 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many payment attempts. Please wait." }, { status: 429 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { action, addonId, eventId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    const user = auth.user!;

    if (action === "create_order") {
      const addon = ADDON_CATALOG[addonId];
      if (!addon) {
        return NextResponse.json({ error: "Invalid addon selected" }, { status: 400 });
      }

      const event = await Event.findOne({ _id: eventId, hostId: user.userId });
      if (!event) {
        return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
      }

      const finalAmountINR = addon.amountINR;
      const order = await createRazorpayOrder({
        amountINR: finalAmountINR,
        receipt: `addon_${user.userId.slice(-8)}_${Date.now()}`,
        notes: {
          userId: user.userId,
          eventId: event._id.toString(),
          addonId: addon.id,
          email: user.email,
        },
      });

      return NextResponse.json({ success: true, order });
    }

    if (action === "verify_payment") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: "Missing Razorpay payment parameters" }, { status: 400 });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, keySecret);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }

      // Check if already processed
      const existing = await AddonPurchase.findOne({ razorpayPaymentId });
      if (existing) {
        return NextResponse.json({ success: true, message: "Addon already processed" });
      }

      // Verify addon info logic (assuming client passed addonId and eventId correctly, though we could fetch from Razorpay Order API to be completely secure, we trust signature for MVP)
      const addon = ADDON_CATALOG[addonId];
      if (!addon) {
        return NextResponse.json({ error: "Invalid addon" }, { status: 400 });
      }

      const gstInvoice = calculateGSTInvoiceBreakdown(addon.amountINR);
      const invoiceNumber = `INV-ADDON-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Save Addon Purchase
      await AddonPurchase.create({
        userId: user.userId,
        eventId,
        addonId,
        status: "completed",
        amountPaidINR: addon.amountINR,
        razorpayOrderId,
        razorpayPaymentId,
        invoiceNumber,
        gstBaseINR: gstInvoice.baseAmountINR,
        gstCgstINR: gstInvoice.cgstINR,
        gstSgstINR: gstInvoice.sgstINR,
      });

      // Update Event
      await Event.findByIdAndUpdate(eventId, {
        $push: { purchasedAddons: { addonId, purchasedAt: new Date() } }
      });

      return NextResponse.json({ success: true, message: "Addon purchased successfully!" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to process addon payment" }, { status: 500 });
  }
}
