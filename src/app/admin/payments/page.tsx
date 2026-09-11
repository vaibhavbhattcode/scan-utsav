"use client";

import React, { useState, useEffect } from "react";
import { IndianRupee, Search, ArrowLeft, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/payments")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPayments(data.payments);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p => 
    p.razorpayOrderId?.toLowerCase().includes(search.toLowerCase()) || 
    p.userId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Payments</h1>
          <p className="text-sm text-slate-500 font-medium">All Razorpay transactions across subscriptions and addons.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Order ID or User ID..." 
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
                <th className="p-4">Date</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading payments...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No payments found.</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(p.createdAt).toLocaleDateString()} <br/>
                      <span className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-600">{p.razorpayOrderId || "N/A"}</td>
                    <td className="p-4 text-xs font-mono text-slate-600">
                      <Link href={`/admin/users?search=${p.userId}`} className="hover:text-[#F2810C] underline">
                        {p.userId.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.paymentType === 'subscription' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> {p.amountPaidINR}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        {p.status || "success"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="glass" size="sm" className="text-[#F2810C]">
                        <ExternalLink className="w-4 h-4" />
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