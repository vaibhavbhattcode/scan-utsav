import React from "react";
import { MissionControlSidebar } from "@/components/admin/MissionControlSidebar";
import { MissionControlTopbar } from "@/components/admin/MissionControlTopbar";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import GlobalSettings from "@/models/GlobalSettings";

export const metadata: Metadata = {
  title: "Mission Control | ScanUtsav Admin",
  description: "Super Admin Mission Control Center",
  robots: "noindex, nofollow", 
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // IP Whitelist Check
  await connectDB();
  const settings: any = await GlobalSettings.findOne().lean();
  
  if (settings && settings.ipWhitelist && settings.ipWhitelist.length > 0) {
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    
    // Extract first IP if multiple
    let clientIp = "";
    if (forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    }
    
    // In local development, it might be ::1 or 127.0.0.1
    // You should probably exclude local IPs from strict blocking or ensure 
    // the super admin has their IP whitelisted before testing this.
    // For safety, if clientIp is localhost, we allow it in development
    const isLocalhost = process.env.NODE_ENV === "development" && (clientIp === "::1" || clientIp === "127.0.0.1" || !clientIp);

    if (!isLocalhost && !settings.ipWhitelist.includes(clientIp)) {
      redirect("/?error=ip_blocked");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <MissionControlSidebar />

      {/* Main Content Wrapper (offset by sidebar width) */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Sticky Topbar */}
        <MissionControlTopbar />

        {/* Scrollable Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
