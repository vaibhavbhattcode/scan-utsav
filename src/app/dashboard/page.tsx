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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-marigold-400">Host Control Center</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display">Event Workspace Overview</h1>
        </div>

        <Link href="/dashboard/events">
          <Button variant="primary" size="md" className="shadow-glow-marigold">
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Button>
        </Link>
      </div>

      {/* Storage Quota Progress Meter */}
      <StorageQuotaMeter usedMB={usedMB} plan={userPlan} />

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Active Events</span>
            <QrCode className="w-4 h-4 text-marigold-400" />
          </div>
          <div className="text-3xl font-black text-white font-display">3</div>
          <span className="text-[10px] text-emeraldWarm font-semibold">All QR codes active</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Guest Memories</span>
            <Camera className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-3xl font-black text-white font-display">844</div>
          <span className="text-[10px] text-slate-400">Photos, Videos & Audio</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Unique Guest Scans</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white font-display">428</div>
          <span className="text-[10px] text-emeraldWarm font-semibold">74.2% Upload Conversion</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Moderation Queue</span>
            <ShieldCheck className="w-4 h-4 text-emeraldWarm" />
          </div>
          <div className="text-3xl font-black text-white font-display">0</div>
          <span className="text-[10px] text-slate-400">Auto-Approve Active</span>
        </div>
      </div>

      {/* Quick Actions Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/dashboard/events" className="glass-card p-6 rounded-2xl border border-white/10 space-y-3 group hover:border-marigold-500 transition-all">
          <div className="w-10 h-10 rounded-xl bg-marigold-500/20 text-marigold-400 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-marigold-400 transition-colors">Manage Events & QR</h3>
          <p className="text-xs text-slate-300">View guest links, live streams, and event settings.</p>
        </Link>

        <Link href="/dashboard/qr-builder" className="glass-card p-6 rounded-2xl border border-white/10 space-y-3 group hover:border-gold-500 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-gold-400 transition-colors">Printable QR Standee Studio</h3>
          <p className="text-xs text-slate-300">Design high-resolution framed table standees & posters.</p>
        </Link>

        <Link href="/dashboard/billing" className="glass-card p-6 rounded-2xl border border-white/10 space-y-3 group hover:border-purple-500 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">Storage & GST Invoices</h3>
          <p className="text-xs text-slate-300">Check storage usage, download tax receipts, upgrade plans.</p>
        </Link>
      </div>
    </div>
  );
}
