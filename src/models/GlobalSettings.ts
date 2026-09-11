import mongoose, { Schema, Document } from "mongoose";

export interface IGlobalSettings extends Document {
  defaultStorageQuotaGB: number;
  forcePasswordProtection: boolean;
  maintenanceMode: boolean;
  superAdminRecoveryEmail: string;
  enforce2FA: boolean;
  ipWhitelist: string[];
  updatedAt: Date;
}

const GlobalSettingsSchema = new Schema<IGlobalSettings>(
  {
    defaultStorageQuotaGB: { type: Number, default: 2 },
    forcePasswordProtection: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    superAdminRecoveryEmail: { type: String, default: "admin@scanutsav.com" },
    enforce2FA: { type: Boolean, default: false },
    ipWhitelist: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.GlobalSettings || mongoose.model<IGlobalSettings>("GlobalSettings", GlobalSettingsSchema);
