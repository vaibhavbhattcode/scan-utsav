import crypto from "crypto";
import Razorpay from "razorpay";

export const OVERAGE_PRICE_PER_GB_INR = 50;

export const PLAN_CATALOG: Record<
  string,
  { planId: "trial" | "lite" | "standard" | "premium" | "ultimate" | "creator" | "studio" | "enterprise"; amountINR: number; maxStorageGB: number; maxEvents: number; maxPhotos: number; maxVideos: number; maxGuests: number; label: string; billingCycle?: "event" | "monthly" }
> = {
  "Trial": { planId: "trial", amountINR: 0, maxStorageGB: 5, maxEvents: 1, maxPhotos: 1500, maxVideos: 50, maxGuests: 30, label: "Free Trial", billingCycle: "event" },
  "Celebration Lite": { planId: "lite", amountINR: 399, maxStorageGB: 10, maxEvents: 1, maxPhotos: 3000, maxVideos: 100, maxGuests: 100, label: "Celebration Lite", billingCycle: "event" },
  "Celebration Standard": { planId: "standard", amountINR: 899, maxStorageGB: 50, maxEvents: 1, maxPhotos: 15000, maxVideos: 350, maxGuests: 500, label: "Celebration Standard ⭐", billingCycle: "event" },
  "Celebration Premium": { planId: "premium", amountINR: 1499, maxStorageGB: 100, maxEvents: 1, maxPhotos: 30000, maxVideos: 1000, maxGuests: 999999, label: "Celebration Premium", billingCycle: "event" },
  "Celebration Ultimate": { planId: "ultimate", amountINR: 2499, maxStorageGB: 250, maxEvents: 1, maxPhotos: 999999, maxVideos: 999999, maxGuests: 999999, label: "Celebration Ultimate", billingCycle: "event" },
  
  "Creator Agency": { planId: "creator", amountINR: 999, maxStorageGB: 100, maxEvents: 5, maxPhotos: 999999, maxVideos: 999999, maxGuests: 999999, label: "Creator Monthly", billingCycle: "monthly" },
  "Studio Agency": { planId: "studio", amountINR: 2499, maxStorageGB: 500, maxEvents: 999, maxPhotos: 999999, maxVideos: 999999, maxGuests: 999999, label: "Studio Monthly", billingCycle: "monthly" },
  "Enterprise Agency": { planId: "enterprise", amountINR: 6999, maxStorageGB: 1000, maxEvents: 999, maxPhotos: 999999, maxVideos: 999999, maxGuests: 999999, label: "Enterprise Custom", billingCycle: "monthly" },
};

export const PLAN_BY_ID = Object.fromEntries(
  Object.entries(PLAN_CATALOG).map(([name, p]) => [p.planId, { ...p, planName: name }])
) as Record<string, (typeof PLAN_CATALOG)[string] & { planName: string }>;

export const ADDON_CATALOG: Record<string, { id: string; name: string; amountINR: number; desc: string }> = {
  "ai_face": { id: "ai_face", name: "AI Face Recognition", amountINR: 499, desc: "Let guests find all their photos instantly" },
  "extended_retention": { id: "extended_retention", name: "Extended Retention", amountINR: 299, desc: "Keep memories alive for 6 extra months" },
  "premium_support": { id: "premium_support", name: "Premium Support", amountINR: 299, desc: "Dedicated 24/7 WhatsApp assistance" },
};

export const PLAN_EVENT_LIMITS: Record<string, number> = {
  trial: 1,
  lite: 1,
  standard: 1,
  premium: 1,
  ultimate: 1,
  creator: 5,
  studio: 999,
  enterprise: 999,
};

export const PLAN_STORAGE_GB: Record<string, number> = {
  trial: 5,
  lite: 10,
  standard: 50,
  premium: 100,
  ultimate: 250,
  creator: 100,
  studio: 500,
  enterprise: 1000,
};

export const PLAN_VALIDITY_DAYS: Record<string, number> = {
  trial: 14,
  lite: 30,
  standard: 90,
  premium: 180,
  ultimate: 365,
  creator: 30,
  studio: 30,
  enterprise: 30,
};

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
  }
  return new Razorpay({ key_id, key_secret });
}

export function calculateGSTInvoiceBreakdown(amountINR: number) {
  // Catalog prices are GST-inclusive
  const baseAmount = +(amountINR / 1.18).toFixed(2);
  const gstAmount = +(amountINR - baseAmount).toFixed(2);
  const cgstAmount = +(gstAmount / 2).toFixed(2);
  const sgstAmount = +(gstAmount / 2).toFixed(2);

  return {
    totalINR: amountINR,
    baseAmountINR: baseAmount,
    totalGSTINR: gstAmount,
    cgstINR: cgstAmount,
    sgstINR: sgstAmount,
    gstRate: "18% GST included",
    gstInclusive: true,
  };
}

export function generateRazorpaySignature(orderId: string, paymentId: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateRazorpaySignature(orderId, paymentId, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function createRazorpayOrder(input: {
  amountINR: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount: Math.round(input.amountINR * 100),
    currency: "INR",
    receipt: input.receipt.slice(0, 40),
    notes: input.notes,
  });
}

export async function fetchRazorpayOrder(orderId: string) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.fetch(orderId);
}

export async function fetchRazorpayPayment(paymentId: string) {
  const razorpay = getRazorpayClient();
  return razorpay.payments.fetch(paymentId);
}

/** Resolve plan strictly from Razorpay order notes + amount (never trust client planName). */
export function resolvePlanFromOrder(order: any) {
  const notes = order?.notes || {};
  const planId = String(notes.planId || "");
  const planName = String(notes.planName || "");
  const fromId = PLAN_BY_ID[planId];
  const fromName = PLAN_CATALOG[planName];
  const plan = fromId || (fromName ? { ...fromName, planName } : null);
  if (!plan) return null;

  const couponCode = String(notes.couponCode || "").toUpperCase();
  let expectedAmountINR = plan.amountINR;
  if (couponCode === "UTSAV20") expectedAmountINR = Math.round(plan.amountINR * 0.8);
  else if (couponCode === "SCAN50") expectedAmountINR = Math.round(plan.amountINR * 0.5);
  else if (couponCode === "WELCOME10") expectedAmountINR = Math.round(plan.amountINR * 0.9);

  const orderAmountPaise = Number(order.amount);
  const expectedPaise = Math.round(expectedAmountINR * 100);
  if (orderAmountPaise !== expectedPaise) return null;

  return {
    planId: plan.planId,
    planName: ("planName" in plan ? plan.planName : planName) || plan.label,
    amountINR: plan.amountINR,
    maxStorageGB: plan.maxStorageGB,
    userId: String(notes.userId || ""),
  };
}

