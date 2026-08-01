"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, ShieldAlert, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PendingMedia {
  id: string;
  uploader: string;
  wish: string;
  url: string;
  aiFlag: boolean;
  status: "pending" | "approved" | "rejected";
}

export default function ModerationGridPage() {
  const [items, setItems] = useState<PendingMedia[]>([
    {
      id: "p1",
      uploader: "Karan Johar",
      wish: "Congratulations to the couple!",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500",
      aiFlag: false,
      status: "pending",
    },
    {
      id: "p2",
      uploader: "Rohan V.",
      wish: "Sangeet wildness ⚡",
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500",
      aiFlag: true, // Duplicate or blur flag
      status: "pending",
    },
    {
      id: "p3",
      uploader: "Sneha P.",
      wish: "Haldi ceremony moments ✨",
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500",
      aiFlag: false,
      status: "pending",
    }
  ]);

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: "approved" } : item));
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: "rejected" } : item));
  };

  const handleApproveAll = () => {
    setItems(prev => prev.map(item => ({ ...item, status: "approved" })));
  };

  const pendingItems = items.filter(i => i.status === "pending");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-12 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Moderation Desk</span>
            <h1 className="text-3xl font-black text-slate-900 font-display">Live Guest Upload Queue</h1>
          </div>
        </div>

        {pendingItems.length > 0 && (
          <Button variant="primary" size="sm" onClick={handleApproveAll} className="bg-[#F2810C] hover:bg-[#D97706] text-white">
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve All Pending ({pendingItems.length})</span>
          </Button>
        )}
      </div>

      {pendingItems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-slate-200 bg-white shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 font-display">All Pending Uploads Reviewed!</h3>
          <p className="text-xs text-slate-600 font-medium">New guest uploads will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingItems.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 space-y-3 p-4 flex flex-col justify-between bg-white shadow-sm">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={item.url} alt="Upload" className="w-full h-full object-cover" />

                {item.aiFlag && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <ShieldAlert className="w-3 h-3" /> AI Duplicate Review
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900">{item.uploader}</span>
                <p className="text-[11px] text-slate-600 italic mt-0.5">"{item.wish}"</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleReject(item.id)}
                  className="py-2 px-3 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-bold flex items-center justify-center gap-1 border border-rose-300"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
