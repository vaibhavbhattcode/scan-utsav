"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Download, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/subscriptions")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubs(data.subscriptions);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = subs.filter(s => 
    s.userId?.toLowerCase().includes(search.toLowerCase()) || 
    s.planId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Subscriptions</h1>
          <p className="text-sm text-slate-500 font-medium">Manage active platform subscription plans.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by User ID or Plan name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2810C] outline-none"
            />
          </div>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">User</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Storage (GB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading subscriptions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No subscriptions found.</td></tr>
              ) : (
                filtered.map(s => {
                  const isActive = s.status === 'active' && new Date(s.endDate) > new Date();
                  return (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-xs font-mono text-slate-600">
                        <Link href={`/admin/users?search=${s.userId}`} className="hover:text-[#F2810C] underline">
                          {s.userId.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                          {s.planId}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(s.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(s.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {isActive ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-emerald-700' : 'text-red-500'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900">
                        {s.maxStorageGB} GB
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}