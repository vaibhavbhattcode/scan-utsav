"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, Briefcase, 
  CreditCard, IndianRupee, HardDrive, QrCode, BrainCircuit,
  Image as ImageIcon, BarChart3, Megaphone, LifeBuoy,
  Bell, FileText, ShieldAlert, Plug, Activity, Settings, List
} from "lucide-react";

export const MissionControlSidebar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Events", href: "/admin/events", icon: CalendarDays },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Agencies", href: "/admin/agencies", icon: Briefcase },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Payments", href: "/admin/payments", icon: IndianRupee },
    { name: "Storage", href: "/admin/storage", icon: HardDrive },
    { name: "QR Management", href: "/admin/qr", icon: QrCode },
    { name: "AI Processing", href: "/admin/ai", icon: BrainCircuit },
    { name: "Gallery Moderation", href: "/admin/gallery-moderation", icon: ImageIcon },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
    { name: "Support", href: "/admin/support", icon: LifeBuoy },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Security", href: "/admin/security", icon: ShieldAlert },
    { name: "Integrations", href: "/admin/integrations", icon: Plug },
    { name: "System Monitoring", href: "/admin/system-monitoring", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Audit Logs", href: "/admin/audit", icon: List },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed top-0 left-0 flex flex-col border-r border-slate-800 z-40">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#F2810C] to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-[#F2810C]/20">
            <span className="text-white font-black text-xl leading-none">S</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Mission Control</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-[#F2810C]/10 text-[#F2810C]" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-[#F2810C]" : "text-slate-500"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
            VA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">Vaibhav Admin</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Super Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
