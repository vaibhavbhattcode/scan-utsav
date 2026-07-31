"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tag, Plus, ArrowLeft, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CouponItem {
  id: string;
  code: string;
  discount: string;
  uses: number;
  active: boolean;
}

export default function CouponManagerPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { id: "c1", code: "UTSAV2026", discount: "20% OFF", uses: 45, active: true },
    { id: "c2", code: "ROYALWEDDING", discount: "₹500 Flat OFF", uses: 18, active: true },
  ]);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("15% OFF");

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setCoupons([
      ...coupons,
      { id: "c_" + Date.now(), code: newCode.toUpperCase(), discount: newDiscount, uses: 0, active: true }
    ]);
    setNewCode("");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">Promotions</span>
            <h1 className="text-3xl font-black text-white">Coupon Code Manager</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddCoupon} className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code</label>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="e.g. WELCOME50"
            required
            className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2 text-xs text-white uppercase"
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Text</label>
          <input
            type="text"
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
            placeholder="e.g. 25% OFF"
            required
            className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2 text-xs text-white"
          />
        </div>

        <Button type="submit" variant="gold" size="md">
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-black text-amber-400 font-mono tracking-widest">{c.code}</span>
              <p className="text-xs text-slate-300 font-semibold">{c.discount}</p>
              <span className="text-[10px] text-slate-400 block">{c.uses} Redeemed Uses</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
