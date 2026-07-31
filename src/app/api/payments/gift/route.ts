import { NextResponse } from "next/server";
import { sendGiftPassEmail } from "@/lib/email";

const PLAN_PRICES: Record<string, { name: string; amountINR: number; amountPaise: number }> = {
  royal: { name: "Royal Utsav Pass", amountINR: 2499, amountPaise: 249900 },
  grand: { name: "Grand Enterprise Pass", amountINR: 6999, amountPaise: 699900 },
};

// POST /api/payments/gift
// Public endpoint — no auth required (gift purchase by anyone)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, planKey, recipientName, recipientEmail, message, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // ── Action 1: Create Razorpay Order ──────────────────────────────
    if (action === "create_order") {
      const plan = PLAN_PRICES[planKey];
      if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // If real Razorpay keys exist, create real order
      if (keyId && keySecret && !keyId.includes("REPLACE")) {
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const order = await razorpay.orders.create({
          amount: plan.amountPaise,
          currency: "INR",
          receipt: `gift_${Date.now()}`,
          notes: { planKey, recipientName, recipientEmail },
        });

        return NextResponse.json({
          success: true,
          orderId: order.id,
          amountINR: plan.amountINR,
          planName: plan.name,
          currency: "INR",
          key: keyId,
        });
      }

      // Fallback: Mock order for development/testing
      const mockOrderId = `order_mock_${Date.now()}`;
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amountINR: plan.amountINR,
        planName: plan.name,
        currency: "INR",
        key: keyId || "rzp_test_mock",
        isMock: true,
      });
    }

    // ── Action 2: Verify Payment & Send Gift Email ────────────────────
    if (action === "verify_payment") {
      const plan = PLAN_PRICES[planKey];
      if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Verify signature if real key exists
      if (keySecret && !keySecret.includes("REPLACE") && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
        const crypto = await import("crypto");
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest("hex");

        if (expectedSignature !== razorpaySignature) {
          return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
        }
      }

      // Generate invoice & gift code
      const invoiceNumber = `INV-GIFT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const giftCode = `GIFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Send gift pass email via centralized email service
      let emailSent = false;
      if (recipientEmail) {
        const emailResult = await sendGiftPassEmail({
          recipientName: recipientName || "Friend",
          recipientEmail,
          planName: plan.name,
          amountINR: plan.amountINR,
          giftCode,
          invoiceNumber,
          message: message || "",
        });
        emailSent = emailResult.success;
      }

      return NextResponse.json({
        success: true,
        message: "Gift pass created successfully!",
        giftCode,
        invoiceNumber,
        planName: plan.name,
        amountINR: plan.amountINR,
        recipientName,
        recipientEmail,
        emailSent,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Gift Payment API Error:", error);
    return NextResponse.json({ error: error.message || "Payment processing failed" }, { status: 500 });
  }
}
