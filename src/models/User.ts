import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: "super_admin" | "host" | "guest";
  avatar?: string;
  subscriptionPlan: "free" | "starter" | "royal" | "enterprise";
  storageUsedMB: number;
  isBlocked: boolean;
  blockedIp?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, enum: ["super_admin", "host", "guest"], default: "host" },
  avatar: { type: String, default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" },
  subscriptionPlan: { type: String, enum: ["free", "starter", "royal", "enterprise"], default: "starter" },
  storageUsedMB: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  blockedIp: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
