import { NextRequest } from "next/server";

export interface RequestContext {
  requestId: string;
  installationId: string;
  userProfile: {
    userId?: string;
    role: "guest" | "host" | "super_admin";
    sessionId?: string;
    eventId?: string;
  };
  deviceInfo: {
    deviceType: "mobile" | "tablet" | "desktop";
    os: string;
    browser: string;
    colorScheme?: "dark" | "light";
  };
  networkInfo: {
    ipAnonymized: string;
    country: string;
    region?: string;
  };
  marketingInfo: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrer?: string;
    qrCampaignId?: string;
  };
  timestamp: Date;
}

export function parseDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

export function parseOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("win")) return "Windows";
  if (ua.includes("mac")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("linux")) return "Linux";
  return "Unknown OS";
}

export function parseBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("edg")) return "Edge";
  return "WebBrowser";
}

export function generateRequestContext(req: NextRequest): RequestContext {
  const userAgent = req.headers.get("user-agent") || "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  
  // DPDP & GDPR Privacy: Anonymize IP (zero out last octet)
  const ipParts = ip.split(".");
  const ipAnonymized = ipParts.length === 4 ? `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0` : ip;

  const url = req.nextUrl;
  const installationId = req.cookies.get("scanutsav_inst_id")?.value || "inst_" + Math.random().toString(36).substring(2, 12);
  const requestId = "req_" + Math.random().toString(36).substring(2, 12);

  return {
    requestId,
    installationId,
    userProfile: {
      role: "guest",
      eventId: url.pathname.startsWith("/e/") ? url.pathname.split("/")[2] : undefined,
    },
    deviceInfo: {
      deviceType: parseDeviceType(userAgent),
      os: parseOS(userAgent),
      browser: parseBrowser(userAgent),
    },
    networkInfo: {
      ipAnonymized,
      country: req.headers.get("x-vercel-ip-country") || "IN",
      region: req.headers.get("x-vercel-ip-country-region") || "MH",
    },
    marketingInfo: {
      utmSource: url.searchParams.get("utm_source") || undefined,
      utmMedium: url.searchParams.get("utm_medium") || undefined,
      utmCampaign: url.searchParams.get("utm_campaign") || undefined,
      referrer: req.headers.get("referer") || undefined,
      qrCampaignId: url.searchParams.get("qr") || undefined,
    },
    timestamp: new Date(),
  };
}
