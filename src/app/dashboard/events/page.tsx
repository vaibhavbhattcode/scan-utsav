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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-marigold-400">Host Dashboard</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display">Event Management Desk</h1>
        </div>

        <Link href="/dashboard/events">
          <Button variant="primary" size="md" className="shadow-glow-marigold">
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
          <div key={evt.id} className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10">
                <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-emeraldWarm border border-emeraldWarm/30">
                  {evt.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-lg font-display">{evt.title}</h3>
                <p className="text-xs text-slate-400">Code: <span className="text-marigold-400 font-mono font-bold">{evt.code}</span></p>
              </div>

              <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl text-xs border border-white/5">
                <span className="text-slate-400">Memories Captured</span>
                <span className="font-bold text-gold-400 text-sm">{evt.mediaCount} Photos</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="glass" size="sm" onClick={() => copyGuestLink(evt.code)} className="w-full">
                  <Share2 className="w-3.5 h-3.5" /> Link
                </Button>
                <Link href={`/e/${evt.code}/slideshow`} target="_blank" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <Tv className="w-3.5 h-3.5 text-marigold-400" /> TV Stream
                  </Button>
                </Link>
              </div>

              <Link href={`/e/${evt.code}`} target="_blank" className="block w-full">
                <Button variant="primary" size="sm" className="w-full">
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
