import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import {
  verifyWebhookSignature,
  resolvePlanFromOrder,
  calculateGSTInvoiceBreakdown,
} from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers.get("x-razorpay-signature");

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: "Webhook signature or secret missing" }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ received: true });
      }

      await connectDB();

      const existing = await Subscription.findOne({ razorpayPaymentId });
      if (existing) {
        return NextResponse.json({ received: true, status: "already_processed" });
      }

      const notes = paymentEntity?.notes || orderEntity?.notes || {};
      const userId = notes.userId;

      if (!userId) {
        return NextResponse.json({ received: true, status: "ignored_no_user" });
      }

      const resolvedPlan = resolvePlanFromOrder({
        amount: paymentEntity?.amount || orderEntity?.amount,
        notes,
      });

      if (!resolvedPlan) {
        return NextResponse.json({ received: true, status: "plan_mismatch" });
      }

      const gstInvoice = calculateGSTInvoiceBreakdown(resolvedPlan.amountINR);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      await User.findByIdAndUpdate(userId, { subscriptionPlan: resolvedPlan.planId });

      await Subscription.updateMany(
        { userId, status: "active" },
        { $set: { status: "canceled" } }
      );

      await Subscription.create({
        userId,
        planId: resolvedPlan.planId,
        status: "active",
        amountPaidINR: resolvedPlan.amountINR,
        maxStorageGB: resolvedPlan.maxStorageGB,
        startDate: new Date(),
        endDate: oneYearFromNow,
        razorpayOrderId,
        razorpayPaymentId,
        invoiceNumber,
        gstBaseINR: gstInvoice.baseAmountINR,
        gstCgstINR: gstInvoice.cgstINR,
        gstSgstINR: gstInvoice.sgstINR,
      });

      return NextResponse.json({ received: true, status: "subscription_activated" });
    }

    return NextResponse.json({ received: true, event });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
