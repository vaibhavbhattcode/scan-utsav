import mongoose, { Schema, Document } from "mongoose";

export interface IAddonPurchase extends Document {
  userId: string;
  eventId: string;
  addonId: string;
  status: "pending" | "completed" | "failed";
  amountPaidINR: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
  gstBaseINR?: number;
  gstCgstINR?: number;
  gstSgstINR?: number;
  createdAt: Date;
}

const AddonPurchaseSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  eventId: { type: String, required: true, index: true },
  addonId: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending", index: true },
  amountPaidINR: { type: Number, required: true },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  invoiceNumber: { type: String },
  gstBaseINR: { type: Number },
  gstCgstINR: { type: Number },
  gstSgstINR: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

AddonPurchaseSchema.index({ userId: 1, eventId: 1, createdAt: -1 });

export default mongoose.models.AddonPurchase || mongoose.model<IAddonPurchase>("AddonPurchase", AddonPurchaseSchema);
