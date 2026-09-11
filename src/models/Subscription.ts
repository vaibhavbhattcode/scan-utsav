import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: string;
  planId: "trial" | "lite" | "standard" | "premium" | "ultimate" | "creator" | "studio" | "enterprise";
  status: "active" | "canceled" | "expired";
  amountPaidINR: number;
  maxStorageGB: number;
  startDate: Date;
  endDate: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
  gstBaseINR?: number;
  gstCgstINR?: number;
  gstSgstINR?: number;
  createdAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  planId: { type: String, enum: ["trial", "lite", "standard", "premium", "ultimate", "creator", "studio", "enterprise"], required: true },
  status: { type: String, enum: ["active", "canceled", "expired"], default: "active", index: true },
  amountPaidINR: { type: Number, required: true },
  maxStorageGB: { type: Number, default: 25 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  invoiceNumber: { type: String },
  gstBaseINR: { type: Number },
  gstCgstINR: { type: Number },
  gstSgstINR: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

SubscriptionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
