"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Tag, Plus, Percent } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");

  const fetchCoupons = () => {
    fetch("/api/admin/coupons")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCoupons(data.coupons);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!newCode || !newDiscount) return;
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.toUpperCase(),
          discountType: "percentage",
          discountValue: parseInt(newDiscount, 10),
          maxUses: 100,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        })
      });
      if (res.ok) {
        setNewCode("");
        setNewDiscount("");
        setCreating(false);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Failed to create coupon", error);
    }
  };

  const filtered = coupons.filter(c => 
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
              Marketing & Coupons <Tag className="w-5 h-5 text-indigo-500" />
            </h1>
            <p className="text-sm text-slate-500 font-medium">Create discount codes and track promotional campaigns.</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-2" /> {creating ? "Cancel" : "New Coupon"}
        </Button>
      </div>

      {creating && (
        <div className="bg-white rounded-3xl border border-indigo-200 shadow-md p-6 flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1">Coupon Code</label>
            <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. SUMMER50" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1">Discount %</label>
            <input type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} placeholder="e.g. 20" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto h-[46px]">
            Save Coupon
          </Button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="max-w-md relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search coupon codes..." 
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
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading coupons...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No coupons found. Create one!</td></tr>
              ) : (
                filtered.map(c => {
                  const isActive = c.isActive && new Date(c.expiryDate) > new Date();
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-sm">
                          {c.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                          {c.discountType === 'percentage' ? (
                            <><Percent className="w-4 h-4" /> {c.discountValue}%</>
                          ) : (
                            <>₹ {c.discountValue}</>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600">
                        {c.usageCount} / {c.maxUses || '∞'}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(c.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}