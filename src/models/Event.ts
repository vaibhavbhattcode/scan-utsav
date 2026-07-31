import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IEvent extends Document {
  title: string;
  code: string;
  eventType: string;
  hostId: string;
  hostName: string;
  eventDate?: Date;
  venueName?: string;
  welcomeMessage?: string;
  themeColor?: string;
  isPasswordProtected: boolean;
  password?: string;
  autoApproveMedia: boolean;
  coverImage?: string;
  qrCodeUrl?: string;
  posterTemplateId?: string;
  externalDriveUrl?: string;
  posterCustomizations?: {
    showHostPhoto?: boolean;
    customMessage?: string;
    logoUrl?: string;
    accentColor?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  compareEventPassword(candidatePassword: string): Promise<boolean>;
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, default: "wedding" },
    hostId: { type: String, required: true },
    hostName: { type: String, default: "Event Host" },
    eventDate: { type: Date },
    venueName: { type: String },
    welcomeMessage: { type: String, default: "Scan to share your photos and wishes!" },
    themeColor: { type: String, default: "#ff5429" },
    isPasswordProtected: { type: Boolean, default: false },
    password: { type: String },
    autoApproveMedia: { type: Boolean, default: true },
    coverImage: { type: String },
    qrCodeUrl: { type: String },
    posterTemplateId: { type: String, default: "wedding-royal" },
    externalDriveUrl: { type: String, default: "" },
    posterCustomizations: {
      showHostPhoto: { type: Boolean, default: false },
      customMessage: { type: String, default: "" },
      logoUrl: { type: String, default: "" },
      accentColor: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

// Hash event password before saving if modified
EventSchema.pre<IEvent>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

EventSchema.methods.compareEventPassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return true;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
