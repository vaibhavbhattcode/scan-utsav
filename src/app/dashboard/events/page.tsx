"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QrCode, Plus, Camera, Tv, Download, ArrowUpRight, Share2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { StorageQuotaMeter } from "@/components/dashboard/StorageQuotaMeter";

interface HostEventItem {
  id: string;
  title: string;
  code: string;
  eventType: string;
  mediaCount: number;
  status: "Live" | "Upcoming" | "Ended";
  coverImage: string;
}

export default function HostEventsPage() {
  const { showToast } = useToast();
  const [events] = useState<HostEventItem[]>([
    {
      id: "e1",
      title: "Ananya & Vikram's Wedding",
      code: "ananya-vikram-2026",
      eventType: "wedding",
      mediaCount: 248,
      status: "Live",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500",
    },
    {
      id: "e2",
      title: "Maha Ganesh Chaturthi Pandal",
      code: "ganesh-utsav-2026",
      eventType: "ganesh-chaturthi",
      mediaCount: 412,
      status: "Live",
      coverImage: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=500",
    },
    {
      id: "e3",
      title: "Rohan's 30th Birthday Bash",
      code: "rohan-birthday-30",
      eventType: "birthday",
      mediaCount: 184,
      status: "Upcoming",
      coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500",
    },
  ]);

  const copyGuestLink = (code: string) => {
    navigator.clipboard.writeText(`https://scanutsav.com/e/${code}`);
    showToast("Guest album link copied to clipboard! 📋", "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Host Dashboard</span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">Event Management Desk</h1>
        </div>

        <Link href="/dashboard/events">
          <Button variant="primary" size="md" className="shadow-md bg-[#F2810C] hover:bg-[#D97706] text-white border border-[#F2810C]">
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Button>
        </Link>
      </div>

      {/* Storage Quota Progress Meter */}
      <StorageQuotaMeter usedMB={4850} plan="royal" />

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="glass-card rounded-3xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between bg-white shadow-sm">
            <div className="space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200">
                <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                  {evt.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg font-display">{evt.title}</h3>
                <p className="text-xs text-slate-600 font-medium">Code: <span className="text-[#F2810C] font-mono font-bold">{evt.code}</span></p>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl text-xs border border-slate-200">
                <span className="text-slate-600 font-medium">Memories Captured</span>
                <span className="font-bold text-amber-800 text-sm">{evt.mediaCount} Photos</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="glass" size="sm" onClick={() => copyGuestLink(evt.code)} className="w-full bg-slate-100 text-slate-800 border border-slate-300">
                  <Share2 className="w-3.5 h-3.5" /> Link
                </Button>
                <Link href={`/e/${evt.code}/slideshow`} target="_blank" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-slate-800 border-slate-300">
                    <Tv className="w-3.5 h-3.5 text-[#F2810C]" /> TV Stream
                  </Button>
                </Link>
              </div>

              <Link href={`/e/${evt.code}`} target="_blank" className="block w-full">
                <Button variant="primary" size="sm" className="w-full bg-[#F2810C] hover:bg-[#D97706] text-white">
                  <span>View Memory Wall</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
