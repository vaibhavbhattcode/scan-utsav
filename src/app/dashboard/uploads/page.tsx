"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, ShieldAlert, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface ModerationMediaItem {
  id: string;
  uploader: string;
  wish: string;
  url: string;
  type: "image" | "video";
  aiFlag: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ModerationGridPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ModerationMediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = () => {
    fetch("/api/media?status=all")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.media) {
          const mapped = data.media.map((m: any) => ({
            id: m._id,
            uploader: m.uploaderName || "Guest",
            wish: m.wishMessage || "",
            url: m.mediaUrl,
            type: m.mediaType || "image",
            aiFlag: false,
            status: m.status || "approved",
            createdAt: m.createdAt || new Date().toISOString(),
          }));
          setItems(mapped);
        }
      })
      .catch((err) => console.warn("Failed to load moderation uploads:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUpdateStatus = async (mediaId: string, status: "approved" | "rejected") => {
    setItems((prev) => prev.map((item) => (item.id === mediaId ? { ...item, status } : item)));

    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Memory ${status === "approved" ? "approved for live stream" : "rejected"}`, "success");
      } else {
        fetchUploads();
      }
    } catch (err) {
      fetchUploads();
    }
  };

  const handleApproveAll = async () => {
    const pending = items.filter((i) => i.status === "pending");
    setItems((prev) => prev.map((item) => ({ ...item, status: "approved" })));

    for (const item of pending) {
      await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id, status: "approved" }),
      }).catch(() => {});
    }
    showToast("All pending guest memories approved!", "success");
  };

  const pendingItems = items.filter((i) => i.status === "pending");
  const approvedItems = items.filter((i) => i.status === "approved");

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
          <Button variant="primary" size="sm" onClick={handleApproveAll} className="bg-[#F2810C] hover:bg-[#D97706] text-white font-bold shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve All Pending ({pendingItems.length})</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : pendingItems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-slate-200 bg-white shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 font-display">All Pending Uploads Reviewed!</h3>
          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
            {items.length > 0
              ? `Showing ${approvedItems.length} approved live album memories. New uploads will stream here in real-time.`
              : "No guest uploads yet. Share event QR code with guests to collect memories."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingItems.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 space-y-3 p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                {item.type === "video" ? (
                  <video src={item.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="Upload" className="w-full h-full object-cover" />
                )}

                {item.aiFlag && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <ShieldAlert className="w-3 h-3" /> AI Flagged
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900">{item.uploader}</span>
                {item.wish && <p className="text-[11px] text-slate-600 italic mt-0.5">"{item.wish}"</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleUpdateStatus(item.id, "rejected")}
                  className="py-2 px-3 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-bold flex items-center justify-center gap-1 border border-rose-300"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(item.id, "approved")}
                  className="py-2 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center justify-center gap-1 shadow-sm font-bold"
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
