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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Host Command Analytics</span>
            <h1 className="text-3xl font-black text-slate-900 font-display">Event Performance & Guest Engagement</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Privacy-Aware Visitor Tokens Active
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Total Event QR Scans</div>
          <div className="text-3xl font-black text-slate-900 flex items-center gap-2 font-display">
            <QrCode className="w-6 h-6 text-[#F2810C]" />
            <span>{metrics.totalScans}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">{metrics.uploadConversion} Upload Rate</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Unique Guest Visitors</div>
          <div className="text-3xl font-black text-slate-900 flex items-center gap-2 font-display">
            <Users className="w-6 h-6 text-amber-600" />
            <span>{metrics.uniqueVisitors}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Installation ID Tokenized</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Peak Upload Time</div>
          <div className="text-3xl font-black text-slate-900 flex items-center gap-2 text-base font-bold font-sans">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>{metrics.peakHour}</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold">Highest energy period</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Guest Device Distribution</div>
          <div className="text-3xl font-black text-slate-900 flex items-center gap-2 text-sm font-bold font-sans">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <span>{metrics.mobileDeviceRatio}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Camera scanning optimized</span>
        </div>
      </div>

      {/* Top Contributors Leaderboard */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200 bg-white shadow-sm">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 font-display">
          <Users className="w-5 h-5 text-[#F2810C]" />
          <span>Top Guest Contributors</span>
        </h3>

        <div className="divide-y divide-slate-200 text-xs text-slate-700 font-medium">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-[#F2810C] font-bold flex items-center justify-center text-[10px] border border-amber-300">1</span>
              <span className="font-bold text-slate-900">Aarav & Sanya</span>
            </div>
            <span className="font-bold text-amber-700">42 Photos Uploaded</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-300">2</span>
              <span className="font-bold text-slate-900">Vikram Sethi</span>
            </div>
            <span className="font-bold text-amber-700">28 Photos Uploaded</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-300">3</span>
              <span className="font-bold text-slate-900">Meera Uncle & Aunty</span>
            </div>
            <span className="font-bold text-amber-700">19 Photos Uploaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
