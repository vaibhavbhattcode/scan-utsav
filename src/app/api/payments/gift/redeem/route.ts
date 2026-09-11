import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GiftCode from "@/models/GiftCode";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { requireAuthFresh } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/security";
import { PLAN_BY_ID, PLAN_CATALOG, calculateGSTInvoiceBreakdown } from "@/lib/razorpay";

export async function POST(req: Request) {
  const auth = await requireAuthFresh(req, ["host", "super_admin"]);
  if (auth.response) return auth.response;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(ip, "gift_redeem", 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many redemption attempts. Please wait." }, { status: 429 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();

    if (!code || !code.startsWith("GIFT-")) {
      return NextResponse.json({ error: "Invalid gift code format" }, { status: 400 });
    }

    const gift = await GiftCode.findOne({ code });
    if (!gift) {
      return NextResponse.json({ error: "Gift code not found or invalid" }, { status: 404 });
    }

    if (gift.status === "redeemed") {
      return NextResponse.json({ error: "Gift code has already been redeemed" }, { status: 400 });
    }

    if (gift.status === "expired") {
      return NextResponse.json({ error: "Gift code has expired" }, { status: 400 });
    }

    // Map planKey to plan catalog entry
    const planKeyToId: Record<string, string> = {
      royal: "royal",
      grand: "enterprise",
    };
    const targetPlanId = planKeyToId[gift.planKey] || "royal";
    const catalogPlan = PLAN_BY_ID[targetPlanId] || PLAN_CATALOG["Royal Utsav"];

    const userId = auth.user!.userId;
    const gstInvoice = calculateGSTInvoiceBreakdown(gift.amountINR);
    const invoiceNumber = `INV-REDEEM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    await User.findByIdAndUpdate(userId, { subscriptionPlan: targetPlanId });

    await Subscription.updateMany(
      { userId, status: "active" },
      { $set: { status: "canceled" } }
    );

    await Subscription.create({
      userId,
      planId: targetPlanId,
      status: "active",
      amountPaidINR: gift.amountINR,
      maxStorageGB: catalogPlan?.maxStorageGB || 50,
      startDate: new Date(),
      endDate: oneYearFromNow,
      razorpayOrderId: gift.razorpayOrderId || "gift_redeem",
      razorpayPaymentId: gift.razorpayPaymentId || `gift_${gift.code}`,
      invoiceNumber,
      gstBaseINR: gstInvoice.baseAmountINR,
      gstCgstINR: gstInvoice.cgstINR,
      gstSgstINR: gstInvoice.sgstINR,
    });

    gift.status = "redeemed";
    gift.redeemedByUserId = userId;
    gift.redeemedAt = new Date();
    await gift.save();

    return NextResponse.json({
      success: true,
      message: `Gift pass redeemed successfully! Upgraded to ${gift.planName}.`,
      plan: targetPlanId,
    });
  } catch (error: any) {
    console.error("Gift Redeem Error:", error);
    return NextResponse.json({ error: error.message || "Failed to redeem gift code" }, { status: 500 });
  }
}
