"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, QrCode, Camera, Users, Sparkles, TrendingUp, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StorageQuotaMeter } from "@/components/dashboard/StorageQuotaMeter";

export default function HostDashboardOverview() {
  const [userPlan] = useState("royal");
  const [usedMB] = useState(4850); // ~4.85 GB used of 25 GB

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 space-y-8 font-sans text-slate-900">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Host Control Center</span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">Event Workspace Overview</h1>
        </div>

        <Link href="/dashboard/events">
          <Button variant="primary" size="md" className="shadow-md bg-[#F2810C] hover:bg-[#D97706] text-white border border-[#F2810C]">
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Button>
        </Link>
      </div>

      {/* Storage Quota Progress Meter */}
      <StorageQuotaMeter usedMB={usedMB} plan={userPlan} />

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Total Active Events</span>
            <QrCode className="w-4 h-4 text-[#F2810C]" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">3</div>
          <span className="text-[10px] text-emerald-700 font-bold">All QR codes active</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Total Guest Memories</span>
            <Camera className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">844</div>
          <span className="text-[10px] text-slate-500 font-medium">Photos, Videos & Audio</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Unique Guest Scans</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">428</div>
          <span className="text-[10px] text-emerald-700 font-bold">74.2% Upload Conversion</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Moderation Queue</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">0</div>
          <span className="text-[10px] text-slate-500 font-medium">Auto-Approve Active</span>
        </div>
      </div>

      {/* Quick Actions Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/dashboard/events" className="glass-card p-6 rounded-2xl border border-slate-200 space-y-3 group hover:border-[#F2810C] transition-all bg-white shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F2810C] flex items-center justify-center font-bold border border-amber-300">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-[#F2810C] transition-colors">Manage Events & QR</h3>
          <p className="text-xs text-slate-600 font-medium">View guest links, live streams, and event settings.</p>
        </Link>

        <Link href="/dashboard/qr-builder" className="glass-card p-6 rounded-2xl border border-slate-200 space-y-3 group hover:border-amber-500 transition-all bg-white shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors">Printable QR Standee Studio</h3>
          <p className="text-xs text-slate-600 font-medium">Design high-resolution framed table standees & posters.</p>
        </Link>

        <Link href="/dashboard/billing" className="glass-card p-6 rounded-2xl border border-slate-200 space-y-3 group hover:border-purple-500 transition-all bg-white shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold border border-purple-200">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">Storage & GST Invoices</h3>
          <p className="text-xs text-slate-600 font-medium">Check storage usage, download tax receipts, upgrade plans.</p>
        </Link>
      </div>
    </div>
  );
}
