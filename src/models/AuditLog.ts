import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  requestId: string;
  installationId: string;
  userEmail?: string;
  role: string;
  action: string;
  endpoint?: string;
  method?: string;
  status?: number;
  responseTimeMs?: number;
  ipAddress: string;
  country?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  details?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  requestId: { type: String, required: true },
  installationId: { type: String, required: true },
  userEmail: { type: String, default: "anonymous" },
  role: { type: String, default: "guest" },
  action: { type: String, required: true },
  endpoint: { type: String },
  method: { type: String },
  status: { type: Number },
  responseTimeMs: { type: Number },
  ipAddress: { type: String, required: true },
  country: { type: String, default: "IN" },
  deviceType: { type: String },
  browser: { type: String },
  os: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

AuditLogSchema.index({ requestId: 1 });
AuditLogSchema.index({ timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
