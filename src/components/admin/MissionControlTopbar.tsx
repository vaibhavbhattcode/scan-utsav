"use client";

import React from "react";
import { Search, Bell, Menu, User, Settings, LogOut, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export const MissionControlTopbar = () => {
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Logged out from Mission Control", "info");
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Left: Search */}
      <div className="flex-1 flex items-center">
        <div className="max-w-md w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search events, users, transactions, QR codes..." 
            className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#F2810C] focus:bg-white transition-all outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded">⌘</kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded">K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 pl-4">
        <Link href="/" target="_blank" className="hidden sm:flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ExternalLink className="w-4 h-4" />
          <span>View Site</span>
        </Link>
        
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="relative group cursor-pointer">
          <div className="flex items-center gap-2 p-1 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#F2810C] flex items-center justify-center text-white font-bold text-xs">
              VA
            </div>
          </div>

          {/* Dropdown (Hover) */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
            <div className="p-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Vaibhav Admin</p>
              <p className="text-[10px] text-slate-500 font-mono">vaibhav@scanutsav.com</p>
            </div>
            <div className="p-1">
              <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                <Settings className="w-4 h-4 text-slate-400" /> Account Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left">
                <LogOut className="w-4 h-4 text-red-400" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
