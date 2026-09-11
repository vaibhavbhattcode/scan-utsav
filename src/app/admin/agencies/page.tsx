"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Download, Briefcase, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    // We fetch users from the existing admin users endpoint, but we filter on the client
    // In a real production app, we would query specifically for agency tiers
    setLoading(true);
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Filter for agency tiers only
          const agencyTiers = ["creator", "studio", "enterprise"];
          const filtered = (data.users || []).filter((u: any) => agencyTiers.includes(u.subscriptionPlan));
          setAgencies(filtered);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = agencies.filter(a => {
    const matchesSearch = a.name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" || a.subscriptionPlan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Agency Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Manage top-tier clients on Studio and Enterprise plans.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search agencies by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2810C] outline-none"
            />
          </div>
          
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#F2810C] outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="creator">Creator</option>
            <option value="studio">Studio</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">Agency / User</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Storage Used</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading agencies...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No agencies found matching your criteria.</td></tr>
              ) : (
                filtered.map(a => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{a.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Star className={`w-4 h-4 ${a.subscriptionPlan === 'enterprise' ? 'text-purple-500' : 'text-blue-500'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {a.subscriptionPlan}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">
                      {(a.storageUsedMB / 1024).toFixed(2)} GB
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/users?search=${a.email}`}>
                        <Button size="sm" variant="outline" className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Manage Account
                        </Button>
                      </Link>
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