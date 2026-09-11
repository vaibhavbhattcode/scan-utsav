"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, X, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GalleryModerationPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMedia();
  }, [statusFilter]);

  const fetchMedia = () => {
    setLoading(true);
    fetch(`/api/admin/gallery-moderation?status=${statusFilter}&limit=30`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMedia(data.media);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleAction = async (id: string, action: "approve" | "reject" | "delete") => {
    try {
      if (action === "delete") {
        const res = await fetch(`/api/admin/gallery-moderation/${id}`, { method: "DELETE" });
        if (res.ok) {
          setMedia(prev => prev.filter(m => m._id !== id));
        }
      } else {
        const res = await fetch(`/api/admin/gallery-moderation/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action })
        });
        if (res.ok) {
          setMedia(prev => prev.map(m => m._id === id ? { ...m, status: action === "approve" ? "approved" : "rejected" } : m));
        }
      }
    } catch (error) {
      console.error("Failed to moderate media", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            Gallery Moderation <ShieldAlert className="w-5 h-5 text-red-500" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Global queue to moderate all recent uploads across the platform.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant={statusFilter === "all" ? "primary" : "outline"} 
          onClick={() => setStatusFilter("all")}
          size="sm"
          className={statusFilter === "all" ? "bg-slate-900" : ""}
        >
          All Uploads
        </Button>
        <Button 
          variant={statusFilter === "pending" ? "primary" : "outline"} 
          onClick={() => setStatusFilter("pending")}
          size="sm"
          className={statusFilter === "pending" ? "bg-amber-500 hover:bg-amber-600 border-none text-white" : ""}
        >
          Pending Review
        </Button>
        <Button 
          variant={statusFilter === "rejected" ? "primary" : "outline"} 
          onClick={() => setStatusFilter("rejected")}
          size="sm"
          className={statusFilter === "rejected" ? "bg-red-500 hover:bg-red-600 border-none text-white" : ""}
        >
          Rejected
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading media queue...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
          No media found in the moderation queue.
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {media.map((m) => (
            <div key={m._id} className="relative group break-inside-avoid rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              {m.mediaType === "video" ? (
                <video src={m.mediaUrl} className="w-full object-cover" />
              ) : (
                <img src={m.mediaUrl} alt="Upload" className="w-full object-cover" loading="lazy" />
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                {m.status}
              </div>

              {/* Moderation Actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                <Button 
                  size="sm" 
                  onClick={() => handleAction(m._id, "approve")}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                  <Check className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleAction(m._id, "reject")}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button 
                  size="sm" 
                  variant="danger"
                  onClick={() => handleAction(m._id, "delete")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold mt-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Media
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}