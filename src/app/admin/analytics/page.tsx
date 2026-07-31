"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BarChart3, ArrowLeft, TrendingUp, Users, DollarSign, Activity, 
  ShieldCheck, Globe, Smartphone, QrCode, ArrowUpRight, Zap, HardDrive, Download
} from "lucide-react";

export default function AdminAnalyticsDashboard() {
  const [metrics] = useState({
    dau: "14,250",
    mau: "185,000",
    qrScanCount: "420,500",
    qrConversionRate: "68.4%",
    monthlyRevenueINR: "₹4,850,000",
    apiLatencyMs: 42,
    errorRate: "0.02%",
    storageUsedGB: 412,
    storageCapacityGB: 1000,
    fileCount: "128,450",
    avgFileSizeMB: "3.2 MB",
  });

  const [marketingUTM] = useState([
    { source: "instagram_ad", campaign: "navratri_garba_2026", scans: "42,100", conversions: "28,400" },
    { source: "whatsapp_invite", campaign: "wedding_viral_loop", scans: "128,500", conversions: "94,200" },
    { source: "google_search", campaign: "qr_wedding_album", scans: "18,400", conversions: "12,100" },
    { source: "venue_partner", campaign: "hotel_qr_standee", scans: "64,200", conversions: "48,900" },
  ]);

  const exportAnalyticsCSV = () => {
    const headers = ["UTM Source", "Campaign Name", "QR Scans", "Memory Uploads", "Conversion Rate %"];
    const rows = marketingUTM.map(u => [
      u.source,
      `"${u.campaign}"`,
      u.scans.replace(",", ""),
      u.conversions.replace(",", ""),
      ((parseInt(u.conversions.replace(",", "")) / parseInt(u.scans.replace(",", ""))) * 100).toFixed(1) + "%"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ScanUtsav_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
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
                Observability & Marketing
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mt-1">
                Business & Storage Analytics Desk
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportAnalyticsCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Analytics CSV</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Zap className="w-4 h-4 text-emerald-600" /> DPDP Compliant
            </div>
          </div>
        </div>

        {/* Storage Meter Card */}
        <div className="bg-white p-6 rounded-3xl space-y-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base font-display flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <span>Cloud Storage & Bandwidth Meter</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {metrics.storageUsedGB} GB of {metrics.storageCapacityGB} GB (41.2% Used)
            </span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-purple-600 to-[#F2810C] h-full w-[41.2%]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Files Stored</span>
              <span className="font-black text-slate-900 text-base">{metrics.fileCount}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Average File Size</span>
              <span className="font-black text-slate-900 text-base">{metrics.avgFileSizeMB}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Cloud Infrastructure</span>
              <span className="font-black text-emerald-700 text-xs">Cloudinary HD Active</span>
            </div>
          </div>
        </div>

        {/* Primary KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Daily Active Users (DAU)</span>
              <Users className="w-4 h-4 text-[#F2810C]" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.dau}</div>
            <span className="inline-block text-[11px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+18.5% growth today</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Monthly Active Users (MAU)</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.mau}</div>
            <span className="inline-block text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Across 30+ Presets</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>QR Scan-to-Upload Funnel</span>
              <QrCode className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.qrConversionRate}</div>
            <span className="inline-block text-[11px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{metrics.qrScanCount} total scans</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>API Latency (p99) & Errors</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.apiLatencyMs} ms</div>
            <span className="inline-block text-[11px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{metrics.errorRate} Error Rate</span>
          </div>
        </div>

        {/* Marketing Attribution & UTM Campaign Analytics */}
        <div className="bg-white p-6 rounded-3xl space-y-4 border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg font-display flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#F2810C]" />
            <span>Marketing Campaign & UTM Attribution</span>
          </h3>

          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">UTM Source</th>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">QR Scans</th>
                    <th className="p-4">Memory Uploads</th>
                    <th className="p-4 text-right">Conversion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {marketingUTM.map((utm, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-sans font-bold text-[#F2810C]">{utm.source}</td>
                      <td className="p-4 text-slate-900 font-sans font-medium">{utm.campaign}</td>
                      <td className="p-4 text-slate-700">{utm.scans}</td>
                      <td className="p-4 text-slate-700">{utm.conversions}</td>
                      <td className="p-4 text-right text-emerald-700 font-bold">
                        {((parseInt(utm.conversions.replace(",", "")) / parseInt(utm.scans.replace(",", ""))) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
