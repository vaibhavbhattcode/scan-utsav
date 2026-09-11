import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import {
  PLAN_CATALOG,
  PLAN_BY_ID,
  PLAN_VALIDITY_DAYS,
  calculateGSTInvoiceBreakdown,
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchRazorpayOrder,
  resolvePlanFromOrder,
} from "@/lib/razorpay";
import { requireAuth } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/security";

export async function GET(req: Request) {
  const auth = requireAuth(req, ["super_admin", "host"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const user = await User.findById(auth.user!.userId).select("subscriptionPlan email name").lean();
    const subscriptions = await Subscription.find({ userId: auth.user!.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      plan: (user as any)?.subscriptionPlan || "starter",
      invoices: subscriptions.map((s: any) => ({
        id: s.invoiceNumber || s._id.toString(),
        date: (s.createdAt || s.startDate)?.toISOString?.()?.slice(0, 10) || "",
        plan: s.planId,
        amountPaidINR: s.amountPaidINR,
        status: s.status,
        paymentId: s.razorpayPaymentId || "",
        orderId: s.razorpayOrderId || "",
        baseAmountINR: s.gstBaseINR,
        cgstINR: s.gstCgstINR,
        sgstINR: s.gstSgstINR,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load billing" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = requireAuth(req, ["super_admin", "host"]);
  if (auth.response) return auth.response;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(ip, "razorpay_pay", 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many payment attempts. Please wait." }, { status: 429 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { action, planName, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    const user = auth.user!;

    if (action === "create_order") {
      const { couponCode } = body;
      const plan = PLAN_CATALOG[planName];
      if (!plan) {
        return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
      }

      let finalAmountINR = plan.amountINR;
      let discountAppliedPercent = 0;

      if (couponCode) {
        const codeUpper = String(couponCode).toUpperCase().trim();
        if (codeUpper === "UTSAV20") {
          discountAppliedPercent = 20;
          finalAmountINR = Math.round(plan.amountINR * 0.8);
        } else if (codeUpper === "SCAN50") {
          discountAppliedPercent = 50;
          finalAmountINR = Math.round(plan.amountINR * 0.5);
        } else if (codeUpper === "WELCOME10") {
          discountAppliedPercent = 10;
          finalAmountINR = Math.round(plan.amountINR * 0.9);
        }
      }

      const gstInvoice = calculateGSTInvoiceBreakdown(finalAmountINR);
      const order = await createRazorpayOrder({
        amountINR: finalAmountINR,
        receipt: `sub_${user.userId.slice(-8)}_${Date.now()}`,
        notes: {
          userId: user.userId,
          planName,
          planId: plan.planId,
          email: user.email,
          couponCode: couponCode || "",
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amountINR: finalAmountINR,
        originalAmountINR: plan.amountINR,
        discountAppliedPercent,
        currency: "INR",
        planName,
        planId: plan.planId,
        gstInvoice,
        key: process.env.RAZORPAY_KEY_ID,
        prefill: { name: user.name, email: user.email },
      });
    }

    if (action === "verify_payment") {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return NextResponse.json({ error: "Payment verification is not configured" }, { status: 500 });
      }

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
      }

      const isValid = verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        keySecret
      );
      if (!isValid) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }

      // Server-side validation against Razorpay Order API to prevent client planName forgery
      const razorpayOrder = await fetchRazorpayOrder(razorpayOrderId).catch(() => null);
      if (!razorpayOrder) {
        return NextResponse.json({ error: "Razorpay order not found" }, { status: 404 });
      }

      const resolvedPlan = resolvePlanFromOrder(razorpayOrder);
      if (!resolvedPlan) {
        return NextResponse.json({ error: "Payment amount or plan mismatch" }, { status: 400 });
      }

      if (resolvedPlan.userId && resolvedPlan.userId !== user.userId) {
        return NextResponse.json({ error: "Order does not belong to authenticated user" }, { status: 403 });
      }

      const plan = PLAN_CATALOG[resolvedPlan.planName] || PLAN_BY_ID[resolvedPlan.planId];
      if (!plan) {
        return NextResponse.json({ error: "Invalid plan catalog record" }, { status: 400 });
      }

      // Prevent duplicate processing of same payment
      const existing = await Subscription.findOne({ razorpayPaymentId });
      if (existing) {
        return NextResponse.json({
          success: true,
          message: "Payment already processed",
          plan: existing.planId,
          invoice: {
            invoiceNumber: existing.invoiceNumber,
            paymentId: existing.razorpayPaymentId,
          },
        });
      }

      const gstInvoice = calculateGSTInvoiceBreakdown(plan.amountINR);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const validityDays = PLAN_VALIDITY_DAYS[plan.planId] || 30;
      const endDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

      await User.findByIdAndUpdate(user.userId, { subscriptionPlan: plan.planId });

      await Subscription.updateMany(
        { userId: user.userId, status: "active" },
        { $set: { status: "canceled" } }
      );

      const sub = await Subscription.create({
        userId: user.userId,
        planId: plan.planId,
        status: "active",
        amountPaidINR: plan.amountINR,
        maxStorageGB: plan.maxStorageGB,
        startDate: new Date(),
        endDate,
        razorpayOrderId,
        razorpayPaymentId,
        invoiceNumber,
        gstBaseINR: gstInvoice.baseAmountINR,
        gstCgstINR: gstInvoice.cgstINR,
        gstSgstINR: gstInvoice.sgstINR,
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        plan: plan.planId,
        invoice: {
          invoiceNumber,
          date: new Date().toISOString(),
          customerEmail: user.email,
          planName,
          paymentId: razorpayPaymentId,
          gstInvoice,
          vendor: "ScanUtsav EventTech Solutions Private Limited",
        },
        subscriptionId: sub._id.toString(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Razorpay Payment API Error:", error);
    return NextResponse.json({ error: error.message || "Payment processing failed" }, { status: 500 });
  }
}
