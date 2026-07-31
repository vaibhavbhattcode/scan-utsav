import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipientId: string;
  title: string;
  message: string;
  type: "upload" | "system" | "billing" | "security";
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["upload", "system", "billing", "security"], default: "system" },
  read: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
