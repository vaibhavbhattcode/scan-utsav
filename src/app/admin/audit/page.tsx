"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Activity, User, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLogs(data.logs || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => 
    l.action?.toLowerCase().includes(search.toLowerCase()) || 
    l.userId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            Audit Logs <Activity className="w-5 h-5 text-indigo-500" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">A strict chronological timeline of platform activities.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="max-w-md relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by action or User ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">IP / Agent</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading audit logs...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No logs found.</td></tr>
              ) : (
                filtered.map(l => (
                  <tr key={l._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(l.createdAt).toLocaleDateString()} <br/>
                      <span className="text-xs text-slate-400 font-mono">{new Date(l.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {l.userId === "system" ? <Shield className="w-4 h-4 text-indigo-500" /> : <User className="w-4 h-4 text-slate-400" />}
                        <span className="text-sm font-mono text-slate-700">{l.userId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-mono text-slate-500">{l.ipAddress || 'Unknown IP'}</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px] truncate" title={l.userAgent}>{l.userAgent || 'Unknown Device'}</p>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="glass" size="sm" className="text-indigo-600">View Data</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}