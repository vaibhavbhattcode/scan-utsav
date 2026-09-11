import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformNotification extends Document {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isActive: boolean;
  targetAudience: "all" | "agencies" | "hosts";
  createdAt: Date;
}

const PlatformNotificationSchema = new Schema<IPlatformNotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "success", "error"], default: "info" },
    isActive: { type: Boolean, default: true },
    targetAudience: { type: String, enum: ["all", "agencies", "hosts"], default: "all" },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformNotification || mongoose.model<IPlatformNotification>("PlatformNotification", PlatformNotificationSchema);
