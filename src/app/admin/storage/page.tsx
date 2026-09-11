"use client";

import React, { useState, useEffect } from "react";
import { HardDrive, ArrowLeft, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StoragePage() {
  const [consumers, setConsumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState<string | null>(null);

  const fetchConsumers = () => {
    fetch("/api/admin/storage")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConsumers(data.consumers || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConsumers();
  }, []);

  const handleClearMedia = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete ALL media for this user? This cannot be undone.")) return;
    
    setClearing(userId);
    try {
      const res = await fetch(`/api/admin/storage/${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchConsumers();
      }
    } catch (error) {
      console.error("Failed to clear media", error);
    } finally {
      setClearing(null);
    }
  };

  const filtered = consumers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            Storage Center <HardDrive className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Track media storage consumption across the platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="max-w-md relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search consumers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">Consumer</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Storage Used</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading storage metrics...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No active storage consumers found.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {c.subscriptionPlan}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${Math.min((c.storageUsedMB / 25000) * 100, 100)}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {(c.storageUsedMB / 1024).toFixed(2)} GB
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => handleClearMedia(c._id)}
                        disabled={clearing === c._id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> 
                        {clearing === c._id ? "Clearing..." : "Clear Media"}
                      </Button>
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