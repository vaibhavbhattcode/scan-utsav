import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: string;
  planId: "free" | "starter" | "royal" | "enterprise";
  status: "active" | "canceled" | "expired";
  amountPaidINR: number;
  maxStorageGB: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  userId: { type: String, required: true },
  planId: { type: String, enum: ["free", "starter", "royal", "enterprise"], required: true },
  status: { type: String, enum: ["active", "canceled", "expired"], default: "active" },
  amountPaidINR: { type: Number, required: true },
  maxStorageGB: { type: Number, default: 25 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
