"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, CalendarDays, HardDrive, IndianRupee, ArrowUpRight, 
  ArrowDownRight, Activity, Download, Server
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { Button } from "@/components/ui/Button";





// Static feed removed - now fetching from DB

export default function MissionControlDashboard() {
  const [metrics, setMetrics] = useState({
    totalRevenueINR: "₹0",
    totalUsers: 0,
    activeEvents: 0,
    storageUsedTB: "0.00",
  });
  const [revenueData, setRevenueData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMetrics(data.metrics);
          setRevenueData(data.charts.revenueData);
          setStorageData(data.charts.storageData);
          setRecentActivity(data.recentActivity || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 flex items-center justify-center">Loading Mission Control...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Your platform metrics at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button size="sm" className="bg-[#F2810C] hover:bg-[#d96305] text-white shadow-md">
            View Live Events
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500">Gross Revenue</h3>
            <div className="p-2 bg-emerald-50 rounded-lg"><IndianRupee className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.totalRevenueINR}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center"><ArrowUpRight className="w-3 h-3" /> +14.5%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500">Total Users</h3>
            <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.totalUsers.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center"><ArrowUpRight className="w-3 h-3" /> +8.2%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500">Active Events</h3>
            <div className="p-2 bg-purple-50 rounded-lg"><CalendarDays className="w-4 h-4 text-purple-600" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.activeEvents.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center"><ArrowUpRight className="w-3 h-3" /> +24%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500">Storage Used (TB)</h3>
            <div className="p-2 bg-amber-50 rounded-lg"><HardDrive className="w-4 h-4 text-amber-600" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.storageUsedTB}</span>
            <span className="text-xs font-bold text-red-600 flex items-center"><ArrowDownRight className="w-3 h-3" /> Live</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Revenue Growth (Last 7 Days)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${value ?? 0}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#F2810C]" /> Live Activity
            </h3>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-4">No recent activity</div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity._id} className="flex gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${activity.status === 200 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div>
                    <p className="text-xs text-slate-700 font-medium leading-snug">{activity.details || activity.action}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {new Date(activity.createdAt).toLocaleString()} by {activity.userEmail || "System"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="glass" className="w-full mt-4 text-xs text-[#F2810C] hover:text-[#d96305] hover:bg-orange-50" onClick={() => window.location.href = "/admin/audit"}>
            View All Activity
          </Button>
        </div>
      </div>

      {/* System Health / Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Storage Consumption (GB)</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="gb" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">System Health</h3>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">All Systems Operational</span>
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg"><Server className="w-4 h-4 text-slate-600" /></div>
                <div>
                  <p className="text-xs font-bold text-slate-900">API Gateway</p>
                  <p className="text-[10px] text-slate-500">99.99% Uptime</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500">12ms response</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg"><HardDrive className="w-4 h-4 text-slate-600" /></div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Cloud Storage Bucket</p>
                  <p className="text-[10px] text-slate-500">AWS S3 (Mumbai)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
