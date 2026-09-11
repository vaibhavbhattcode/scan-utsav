"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, TrendingUp, Users, Activity, 
  Globe, QrCode, Zap, HardDrive, Download, RefreshCw
} from "lucide-react";
import { apiFetch } from "@/lib/client-api";

export default function AdminAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalMemories: 0,
    moderationQueue: 0,
    usedMB: 0,
    uniqueScans: 0,
    userPlan: "super_admin",
  });

  const fetchRealStats = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealStats();
  }, []);

  const exportAnalyticsCSV = () => {
    const headers = ["Metric", "Live System Value"];
    const rows = [
      ["Total Active Events", stats.totalEvents],
      ["Total Uploaded Media", stats.totalMemories],
      ["Pending Moderation Queue", stats.moderationQueue],
      ["Total Cloud Storage Used (MB)", stats.usedMB],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ScanUtsav_RealAnalytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Observability & Real Analytics
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mt-1">
                Business & Storage Analytics Desk
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRealStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl border border-slate-300 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Stats</span>
            </button>
            <button
              onClick={exportAnalyticsCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Storage Meter Card */}
        <div className="bg-white p-6 rounded-3xl space-y-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base font-display flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <span>Cloud Storage Meter</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {stats.usedMB} MB Storage Consumed Across Platform
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Events Created</span>
              <span className="font-black text-slate-900 text-base">{stats.totalEvents}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Uploaded Media Items</span>
              <span className="font-black text-slate-900 text-base">{stats.totalMemories}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Moderation Queue</span>
              <span className="font-black text-amber-600 text-base">{stats.moderationQueue}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">CDN Delivery</span>
              <span className="font-black text-emerald-700 text-xs">Cloudinary HD Active</span>
            </div>
          </div>
        </div>

        {/* Primary KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Platform Events</span>
              <Users className="w-4 h-4 text-[#F2810C]" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{stats.totalEvents}</div>
            <span className="inline-block text-[11px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Live Database Count</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Guest Uploads</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{stats.totalMemories}</div>
            <span className="inline-block text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Photos & Videos</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Pending Moderation</span>
              <QrCode className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{stats.moderationQueue}</div>
            <span className="inline-block text-[11px] text-amber-700 font-black bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Awaiting Host Review</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Cloud Storage Used</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{stats.usedMB} MB</div>
            <span className="inline-block text-[11px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Calculated Bytes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
