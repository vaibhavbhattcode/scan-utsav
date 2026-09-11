import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: "super_admin" | "host" | "guest";
  avatar?: string;
  subscriptionPlan: "trial" | "lite" | "standard" | "premium" | "ultimate" | "creator" | "studio" | "enterprise";
  storageUsedMB: number;
  isBlocked: boolean;
  blockedIp?: string;
  authProvider?: string;
  googleId?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  role: { type: String, enum: ["super_admin", "host", "guest"], default: "host", index: true },
  avatar: { type: String, default: "" },
  subscriptionPlan: { type: String, enum: ["trial", "lite", "standard", "premium", "ultimate", "creator", "studio", "enterprise"], default: "trial" },
  storageUsedMB: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  blockedIp: { type: String, default: "" },
  authProvider: { type: String, default: "local" },
  googleId: { type: String, index: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
