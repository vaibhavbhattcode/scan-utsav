"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Search, Filter, Clock, Activity, FileText, Download } from "lucide-react";

interface AuditLogRecord {
  _id: string;
  requestId: string;
  userEmail: string;
  role: string;
  action: string;
  ipAddress: string;
  status?: number;
  responseTimeMs?: number;
  details?: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [logs] = useState<AuditLogRecord[]>([
    {
      _id: "log1",
      requestId: "req_101",
      userEmail: "admin@scanutsav.com",
      role: "super_admin",
      action: "login_success",
      ipAddress: "103.22.18.0",
      status: 200,
      responseTimeMs: 42,
      details: "User logged in successfully",
      timestamp: new Date().toISOString()
    },
    {
      _id: "log2",
      requestId: "req_102",
      userEmail: "vikram@example.com",
      role: "host",
      action: "event_created",
      ipAddress: "103.22.18.0",
      status: 201,
      responseTimeMs: 85,
      details: "Created event: ananya-vikram-2026",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: "log3",
      requestId: "req_103",
      userEmail: "sanya@example.com",
      role: "guest",
      action: "CONTACT_INQUIRY_SUBMITTED",
      ipAddress: "157.33.91.4",
      status: 200,
      responseTimeMs: 64,
      details: "[HOST] Sanya & Rahul: Inquired about Royal Pass",
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const exportLogsCSV = () => {
    const headers = ["Timestamp", "Action", "User Email", "IP Address", "HTTP Status", "Response Time (ms)", "Details"];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.timestamp).toLocaleString()}"`,
      l.action,
      `"${l.userEmail}"`,
      l.ipAddress,
      l.status || 200,
      l.responseTimeMs || 35,
      `"${l.details || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ScanUtsav_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Security Audit
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mt-1">
                System & Security Audit Logs
              </h1>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportLogsCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email/IP/action..."
                className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
            >
              <option value="all">All Actions</option>
              <option value="login_success">login_success</option>
              <option value="login_failed">login_failed</option>
              <option value="event_created">event_created</option>
              <option value="CONTACT_INQUIRY_SUBMITTED">CONTACT_INQUIRY</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">User Email</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Status & Latency</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        log.action.includes("success") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        log.action.includes("failed") ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-amber-50 text-amber-800 border-amber-200"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-900 font-sans font-bold">{log.userEmail}</td>
                    <td className="p-4 text-slate-500">{log.ipAddress}</td>
                    <td className="p-4 text-emerald-700 font-bold">
                      HTTP {log.status || 200} ({log.responseTimeMs || 35}ms)
                    </td>
                    <td className="p-4 text-slate-600 font-sans">{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
