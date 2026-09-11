import mongoose, { Schema, Document } from "mongoose";

export interface IGiftCode extends Document {
  code: string;
  planKey: string;
  planName: string;
  amountINR: number;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
  status: "active" | "redeemed" | "expired";
  redeemedByUserId?: string;
  redeemedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GiftCodeSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    planKey: { type: String, required: true },
    planName: { type: String, required: true },
    amountINR: { type: Number, required: true },
    recipientName: { type: String, default: "" },
    recipientEmail: { type: String, default: "" },
    message: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    invoiceNumber: { type: String, default: "" },
    status: { type: String, enum: ["active", "redeemed", "expired"], default: "active", index: true },
    redeemedByUserId: { type: String, default: null },
    redeemedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.GiftCode || mongoose.model<IGiftCode>("GiftCode", GiftCodeSchema);
