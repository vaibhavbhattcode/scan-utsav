"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Users, Flame, Heart, Camera, Clock, Smartphone, QrCode, ShieldCheck } from "lucide-react";

export default function EventAnalyticsPage() {
  const [metrics] = useState({
    totalScans: 482,
    uniqueVisitors: 237,
    uploadConversion: "74.2%",
    peakHour: "10:30 PM (Sangeet Night)",
    totalReactions: 1420,
    mobileDeviceRatio: "91% Mobile, 9% Desktop",
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">Host Command Analytics</span>
            <h1 className="text-3xl font-black text-white">Event Performance & Guest Engagement</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-semibold">
          <ShieldCheck className="w-4 h-4" /> Privacy-Aware Visitor Tokens Active
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Total Event QR Scans</div>
          <div className="text-3xl font-black text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-brand-400" />
            <span>{metrics.totalScans}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">{metrics.uploadConversion} Upload Rate</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Unique Guest Visitors</div>
          <div className="text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>{metrics.uniqueVisitors}</span>
          </div>
          <span className="text-[10px] text-slate-400">Installation ID Tokenized</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Peak Upload Time</div>
          <div className="text-3xl font-black text-white flex items-center gap-2 text-base font-bold">
            <Clock className="w-5 h-5 text-purple-400" />
            <span>{metrics.peakHour}</span>
          </div>
          <span className="text-[10px] text-purple-300">Highest energy period</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Guest Device Distribution</div>
          <div className="text-3xl font-black text-white flex items-center gap-2 text-sm font-bold">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>{metrics.mobileDeviceRatio}</span>
          </div>
          <span className="text-[10px] text-slate-400">Camera scanning optimized</span>
        </div>
      </div>

      {/* Top Contributors Leaderboard */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" />
          <span>Top Guest Contributors</span>
        </h3>

        <div className="divide-y divide-white/5 text-xs text-slate-300">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px]">1</span>
              <span className="font-bold text-white">Aarav & Sanya</span>
            </div>
            <span className="font-bold text-amber-400">42 Photos Uploaded</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">2</span>
              <span className="font-bold text-white">Vikram Sethi</span>
            </div>
            <span className="font-bold text-amber-400">28 Photos Uploaded</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">3</span>
              <span className="font-bold text-white">Meera Uncle & Aunty</span>
            </div>
            <span className="font-bold text-amber-400">19 Photos Uploaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
