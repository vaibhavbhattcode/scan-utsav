"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Flame, Sparkles, ArrowRight, Eye, Camera, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DemoAlbum {
  id: string;
  title: string;
  category: "wedding" | "festival" | "corporate" | "party";
  location: string;
  mediaCount: number;
  coverUrl: string;
  tagline: string;
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const demoAlbums: DemoAlbum[] = [
    {
      id: "ananya-vikram-2026",
      title: "Ananya & Vikram Royal Sangeet",
      category: "wedding",
      location: "The Taj Palace, Udaipur",
      mediaCount: 1420,
      coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      tagline: "Deep maroon & gold wax-seal theme with live TV stream",
    },
    {
      id: "durga-puja-2026",
      title: "Durga Puja & Garba Utsav Night",
      category: "festival",
      location: "CR Park, New Delhi",
      mediaCount: 3890,
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      tagline: "High-volume garba dance floor guest photo feed",
    },
    {
      id: "tech-gala-2026",
      title: "TechCorp India Annual Summit",
      category: "corporate",
      location: "JW Marriott, Bengaluru",
      mediaCount: 850,
      coverUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
      tagline: "Platinum ink theme with GST invoice reporting",
    },
    {
      id: "ganesh-pandal-2026",
      title: "Maha Ganesh Pandal Stream",
      category: "festival",
      location: "Lalbaug, Mumbai",
      mediaCount: 12400,
      coverUrl: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800",
      tagline: "Real-time devotee TV projection stream",
    },
    {
      id: "meera-birthday-2026",
      title: "Meera's 25th Milestone Birthday",
      category: "party",
      location: "Olive Bar & Kitchen, Mumbai",
      mediaCount: 420,
      coverUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      tagline: "Playful confetti scatter theme & guest voice notes",
    },
    {
      id: "rohan-sneha-wedding",
      title: "Rohan & Sneha Destination Wedding",
      category: "wedding",
      location: "The Leela, Goa",
      mediaCount: 2150,
      coverUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
      tagline: "Sunset beach wedding memory wall",
    },
  ];

  const categories = [
    { id: "all", label: "All Showcase Albums" },
    { id: "wedding", label: "Weddings" },
    { id: "festival", label: "Regional Festivals" },
    { id: "corporate", label: "Corporate Expos" },
    { id: "party", label: "Birthdays & Parties" },
  ];

  const filteredAlbums = selectedCategory === "all"
    ? demoAlbums
    : demoAlbums.filter((a) => a.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8 space-y-10 font-sans bg-[#FAF9F6] text-slate-900">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-950 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
          DEMO SHOWCASE GALLERY
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
          Real Celebrations via <span className="text-[#F2810C]">ScanUtsav</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          Explore interactive demo showcase albums collected across Indian weddings, garba nights, and corporate summits.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all shadow-sm ${
              selectedCategory === c.id
                ? "bg-[#F2810C] text-white shadow-md border border-[#F2810C]"
                : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlbums.map((item) => (
          <div key={item.id} className="p-5 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-md group space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-900 uppercase tracking-widest border border-amber-300 shadow-sm">
                  {item.location}
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3 h-3 text-[#F2810C]" />
                  <span>{item.mediaCount.toLocaleString()} Photos</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-lg font-display">{item.title}</h3>
                <p className="text-slate-600 text-xs italic font-medium">"{item.tagline}"</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <Link href={`/e/${item.id}`}>
                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-300 text-slate-900 bg-white hover:bg-slate-100">
                  <Eye className="w-4 h-4 text-[#F2810C]" />
                  <span>Open Live Album Demo</span>
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl text-center space-y-6 border-2 border-[#F2810C] bg-[#F2810C] text-white shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">Host Your Own Album in 60 Seconds</h2>
          <p className="text-amber-50 text-sm max-w-md mx-auto font-bold">Create a free event and start receiving guest photos instantly.</p>
        </div>
        <div className="pt-2">
          <Link href="/register" className="inline-block">
            <Button variant="primary" size="lg" className="px-8 py-3.5 shadow-2xl text-sm font-black bg-white text-slate-900 hover:bg-slate-100 border-white">
              <span>Create Free Event</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
