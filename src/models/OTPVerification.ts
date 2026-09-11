import mongoose, { Schema, Document } from "mongoose";

export interface IOTPVerification extends Document {
  email: string;
  code: string;
  type: "login" | "reset" | "register";
  createdAt: Date;
  expiresAt: Date;
}

const OTPVerificationSchema: Schema = new Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  type: { type: String, enum: ["login", "reset", "register"], required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// TTL Index to auto-delete expired OTPs from the database
OTPVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTPVerification || mongoose.model<IOTPVerification>("OTPVerification", OTPVerificationSchema);
