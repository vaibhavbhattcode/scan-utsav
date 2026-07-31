"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, Users, Calendar, DollarSign, HardDrive, 
  Settings, Layers, FileText, Activity, AlertTriangle, ArrowUpRight, Download, BarChart3, Ticket
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [metrics] = useState({
    totalRevenueINR: "₹4,850,000",
    totalUsers: 1420,
    totalEvents: 3850,
    storageUsedGB: 412,
    activeSubscriptions: 890,
  });

  const exportReport = () => {
    const reportData = [
      ["Metric", "Value"],
      ["Total Gross Revenue", metrics.totalRevenueINR],
      ["Platform Hosts & Users", metrics.totalUsers.toString()],
      ["Total Platform Events", metrics.totalEvents.toString()],
      ["Storage Used (GB)", metrics.storageUsedGB.toString()],
      ["Active Subscriptions", metrics.activeSubscriptions.toString()]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + reportData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ScanUtsav_Admin_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Admin Command Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-black tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Super Admin CMS
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mt-2">
              Platform Command Center
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage platform users, events, landing page content, analytics, and security audit logs.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={exportReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV Report</span>
            </button>
            <Link href="/admin/cms">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F2810C] hover:bg-[#D97706] text-white text-xs font-black rounded-xl shadow-sm transition-all">
                <Layers className="w-4 h-4" />
                <span>Landing Page CMS</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Gross Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.totalRevenueINR}</div>
            <span className="inline-block text-[11px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+24% vs last month</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Platform Hosts & Users</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#F2810C]" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.totalUsers}</div>
            <span className="inline-block text-[11px] text-amber-800 font-black bg-amber-50 px-2 py-0.5 rounded border border-amber-200">+140 hosts this week</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Platform Events</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.totalEvents}</div>
            <span className="inline-block text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">99.9% auto-approved</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Cloud Storage Meter</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{metrics.storageUsedGB} GB</div>
            <span className="inline-block text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">41% of 1TB capacity</span>
          </div>
        </div>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/users" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-[#F2810C] hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#F2810C]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg font-display">RBAC & User Control</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">Manage host accounts, assign tiers, block malicious IPs, and audit permissions.</p>
            <div className="text-xs font-bold text-[#F2810C] flex items-center gap-1">Manage Users →</div>
          </Link>

          <Link href="/admin/events" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg font-display">Event Management</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">Audit event galleries, toggle moderation settings, inspect media count, and open slideshows.</p>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1">Manage Events →</div>
          </Link>

          <Link href="/admin/analytics" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg font-display">Business Analytics</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">View DAU/MAU trends, QR scan-to-upload conversion rate, storage meters, and UTM tracking.</p>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">View Analytics →</div>
          </Link>

          <Link href="/admin/cms" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg font-display">Landing Page CMS</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">Dynamically edit hero titles, banners, proof logos, and featured photos without deploying code.</p>
            <div className="text-xs font-bold text-amber-700 flex items-center gap-1">Edit CMS →</div>
          </Link>

          <Link href="/admin/logs" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg font-display">Security Audit Logs</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">Monitor real-time system events, API latency, rate-limiting history, and security audits.</p>
            <div className="text-xs font-bold text-purple-600 flex items-center gap-1">Audit Logs →</div>
          </Link>

          <Link href="/admin/coupons" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-rose-500 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg font-display">Coupons & Passes</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">Create promo codes, manage discount percentages, set expiry dates, and audit usage.</p>
            <div className="text-xs font-bold text-rose-600 flex items-center gap-1">Manage Coupons →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
