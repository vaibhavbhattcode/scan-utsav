import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
  discountValue: { type: Number, required: true },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
