import crypto from "crypto";

export interface RazorpayOrderInput {
  amountINR: number;
  planName: string;
  userEmail: string;
}

export function calculateGSTInvoiceBreakdown(amountINR: number) {
  // Amount includes 18% GST in India
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
    gstRate: "18% IGST / (9% CGST + 9% SGST)",
  };
}

export function generateRazorpaySignature(orderId: string, paymentId: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const generatedSignature = generateRazorpaySignature(orderId, paymentId, secret);
  return generatedSignature === signature;
}
