import { connectDB } from "./db";
import AuditLog from "@/models/AuditLog";

export interface WriteAuditLogParams {
  action: string;
  userEmail?: string;
  role?: string;
  ipAddress?: string;
  country?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  endpoint?: string;
  method?: string;
  status?: number;
  responseTimeMs?: number;
  details?: string;
  req?: Request;
}

function parseUserAgent(ua: string) {
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipad/i.test(ua)) deviceType = "mobile";
  if (/ipad|tablet/i.test(ua)) deviceType = "tablet";

  let browser = "Unknown";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return { deviceType, browser, os };
}

/**
 * Non-blocking structured audit logging helper.
 * Captures user IP, geo location country, device, browser, OS & endpoint metrics.
 */
export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  try {
    await connectDB();

    let clientIp = params.ipAddress;
    let country = params.country;
    let deviceType = params.deviceType;
    let browser = params.browser;
    let os = params.os;

    if (params.req) {
      const headers = params.req.headers;
      if (!clientIp) {
        clientIp = headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || "127.0.0.1";
      }
      if (!country) {
        country = headers.get("cf-ipcountry") || headers.get("x-vercel-ip-country") || headers.get("x-country") || "IN";
      }
      const ua = headers.get("user-agent") || "";
      if (ua && (!deviceType || !browser || !os)) {
        const parsed = parseUserAgent(ua);
        deviceType = deviceType || parsed.deviceType;
        browser = browser || parsed.browser;
        os = os || parsed.os;
      }
    }

    await AuditLog.create({
      requestId: "req_audit_" + Math.random().toString(36).substring(2, 10),
      installationId: "inst_audit",
      userEmail: params.userEmail || "anonymous",
      role: params.role || "guest",
      action: params.action,
      endpoint: params.endpoint,
      method: params.method,
      status: params.status,
      responseTimeMs: params.responseTimeMs,
      ipAddress: clientIp || "127.0.0.1",
      country: country || "IN",
      deviceType: deviceType || "desktop",
      browser: browser || "Browser",
      os: os || "OS",
      details: params.details || "",
      timestamp: new Date(),
    });
  } catch (error) {
    console.warn("Audit Logging Warning:", error);
  }
}
