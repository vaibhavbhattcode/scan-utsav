import { RequestContext } from "./context";
import { connectDB } from "./db";
import AuditLog from "@/models/AuditLog";

export async function logApiAuditRequest(
  context: RequestContext,
  endpoint: string,
  method: string,
  status: number,
  responseTimeMs: number,
  details?: string
) {
  try {
    await connectDB();
    await AuditLog.create({
      requestId: context.requestId,
      installationId: context.installationId,
      userEmail: context.userProfile.userId || "anonymous",
      role: context.userProfile.role,
      action: "API_REQUEST",
      endpoint,
      method,
      status,
      responseTimeMs,
      ipAddress: context.networkInfo.ipAnonymized,
      country: context.networkInfo.country,
      deviceType: context.deviceInfo.deviceType,
      browser: context.deviceInfo.browser,
      os: context.deviceInfo.os,
      details: details || `HTTP ${method} ${endpoint} (${status}) - ${responseTimeMs}ms`,
    });
  } catch (error) {
    console.warn("Observability Logging Warning:", error);
  }
}

export async function logSecurityEvent(
  action: "LOGIN_SUCCESS" | "LOGIN_FAILURE" | "EVENT_CREATED" | "QR_GENERATED" | "FILE_UPLOAD" | "ADMIN_ROLE_CHANGE" | "SUSPICIOUS_RATE_LIMIT",
  context: RequestContext,
  details: string
) {
  try {
    await connectDB();
    await AuditLog.create({
      requestId: context.requestId,
      installationId: context.installationId,
      userEmail: context.userProfile.userId || "system",
      role: context.userProfile.role,
      action,
      ipAddress: context.networkInfo.ipAnonymized,
      country: context.networkInfo.country,
      deviceType: context.deviceInfo.deviceType,
      browser: context.deviceInfo.browser,
      os: context.deviceInfo.os,
      details,
    });
  } catch (error) {
    console.warn("Security Event Logging Warning:", error);
  }
}
