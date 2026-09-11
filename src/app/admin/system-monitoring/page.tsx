"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Server, Database, Cloud, Activity, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SystemMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  const fetchHealth = () => {
    setLoading(true);
    fetch("/api/admin/health")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHealthData(data.systems);
          setStats(data.stats);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const systems = [
    { 
      name: "MongoDB", 
      type: "Database", 
      status: healthData?.mongodb?.status || "loading", 
      ping: healthData?.mongodb?.ping || "--", 
      icon: Database, 
      color: "text-emerald-500" 
    },
    { 
      name: "Redis", 
      type: "Cache", 
      status: healthData?.redis?.status || "loading", 
      ping: healthData?.redis?.ping || "--", 
      icon: Server, 
      color: "text-red-500" 
    },
    { 
      name: "Cloudinary", 
      type: "Storage", 
      status: healthData?.cloudinary?.status || "loading", 
      ping: healthData?.cloudinary?.ping || "--", 
      icon: Cloud, 
      color: "text-blue-500" 
    },
    { 
      name: "Face AI Worker", 
      type: "Compute", 
      status: "degraded", 
      ping: "Offline", 
      icon: Activity, 
      color: "text-amber-500" 
    },
    { 
      name: "Node.js Server", 
      type: "Application", 
      status: "operational", 
      ping: stats ? `${stats.cpuUsagePercent}% CPU` : "--", 
      icon: Activity, 
      color: "text-indigo-500" 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
              System Monitoring <Activity className="w-6 h-6 text-emerald-500" />
            </h1>
            <p className="text-sm text-slate-500 font-medium">Live health checks for all infrastructure services.</p>
          </div>
        </div>
        <Button variant="outline" className="border-slate-200 text-slate-700" onClick={fetchHealth} disabled={loading}>
          {loading ? "Running..." : "Run Diagnostics"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{s.name}</h3>
                  <p className="text-xs font-mono text-slate-500">{s.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 mb-1">
                  {s.status === "operational" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${s.status === 'operational' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">Ping: {s.ping}</p>
              </div>
            </div>
          )
        })}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CPU Usage</h3>
            <p className="text-2xl font-black text-slate-900">{stats.cpuUsagePercent}%</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Memory (RSS)</h3>
            <p className="text-2xl font-black text-slate-900">{stats.processRssMB} MB</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Uptime</h3>
            <p className="text-2xl font-black text-slate-900">{stats.uptime}</p>
          </div>
        </div>
      )}
    </div>
  );
}