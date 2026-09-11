import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GiftCode from "@/models/GiftCode";
import {
  calculateGSTInvoiceBreakdown,
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchRazorpayOrder,
} from "@/lib/razorpay";
import { sendGiftPassEmail } from "@/lib/email";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

const PLAN_PRICES: Record<string, { name: string; amountINR: number; planId: string }> = {
  royal: { name: "Royal Utsav Pass", amountINR: 2499, planId: "royal" },
  grand: { name: "Grand Enterprise Pass", amountINR: 6999, planId: "enterprise" },
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(ip, "gift_pay", 15, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many gift payment attempts." }, { status: 429 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { action, planKey } = body;
    const recipientName = sanitizeInput(String(body.recipientName || "Friend").slice(0, 80));
    const recipientEmail = String(body.recipientEmail || "").trim().toLowerCase();
    const message = sanitizeInput(String(body.message || "").slice(0, 500));

    if (action === "create_order") {
      const plan = PLAN_PRICES[planKey];
      if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      if (!recipientEmail || !recipientEmail.includes("@")) {
        return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 });
      }

      const order = await createRazorpayOrder({
        amountINR: plan.amountINR,
        receipt: `gift_${Date.now()}`.slice(0, 40),
        notes: { planKey, recipientName, recipientEmail },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amountINR: plan.amountINR,
        planName: plan.name,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
        gstInvoice: calculateGSTInvoiceBreakdown(plan.amountINR),
      });
    }

    if (action === "verify_payment") {
      const plan = PLAN_PRICES[planKey];
      if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return NextResponse.json({ error: "Payment verification is not configured" }, { status: 500 });
      }
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
      }

      const valid = verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        keySecret
      );
      if (!valid) {
        return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
      }

      // Check order details from Razorpay API
      const razorpayOrder = await fetchRazorpayOrder(razorpayOrderId).catch(() => null);
      if (!razorpayOrder) {
        return NextResponse.json({ error: "Razorpay gift order not found" }, { status: 404 });
      }

      const orderAmountPaise = Number(razorpayOrder.amount);
      if (orderAmountPaise !== Math.round(plan.amountINR * 100)) {
        return NextResponse.json({ error: "Gift order amount mismatch" }, { status: 400 });
      }

      // Replay attack check
      const existing = await GiftCode.findOne({ razorpayPaymentId });
      if (existing) {
        return NextResponse.json({
          success: true,
          message: "Gift pass already generated!",
          giftCode: existing.code,
          invoiceNumber: existing.invoiceNumber,
          planName: existing.planName,
          amountINR: existing.amountINR,
          recipientName: existing.recipientName,
          recipientEmail: existing.recipientEmail,
          paymentId: existing.razorpayPaymentId,
        });
      }

      const invoiceNumber = `INV-GIFT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const giftCodeStr = `GIFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const giftDoc = await GiftCode.create({
        code: giftCodeStr,
        planKey,
        planName: plan.name,
        amountINR: plan.amountINR,
        recipientName,
        recipientEmail,
        message,
        razorpayOrderId,
        razorpayPaymentId,
        invoiceNumber,
        status: "active",
      });

      let emailSent = false;
      if (recipientEmail) {
        const emailResult = await sendGiftPassEmail({
          recipientName,
          recipientEmail,
          planName: plan.name,
          amountINR: plan.amountINR,
          giftCode: giftCodeStr,
          invoiceNumber,
          message,
        });
        emailSent = emailResult.success;
      }

      return NextResponse.json({
        success: true,
        message: "Gift pass created successfully!",
        giftCode: giftDoc.code,
        invoiceNumber,
        planName: plan.name,
        amountINR: plan.amountINR,
        recipientName,
        recipientEmail,
        emailSent,
        paymentId: razorpayPaymentId,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Gift Payment API Error:", error);
    return NextResponse.json({ error: error.message || "Payment processing failed" }, { status: 500 });
  }
}
