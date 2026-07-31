"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowLeft, Search, Filter, ArrowUpRight, Tv, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EventAuditRecord {
  id: string;
  title: string;
  code: string;
  category: string;
  hostName: string;
  mediaCount: number;
  autoApprove: boolean;
  cover: string;
}

export default function AdminEventsManager() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events] = useState<EventAuditRecord[]>([
    {
      id: "e1",
      title: "Ananya & Vikram Wedding",
      code: "ananya-vikram-2026",
      category: "wedding",
      hostName: "Vikram Sethi",
      mediaCount: 248,
      autoApprove: true,
      cover: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500"
    },
    {
      id: "e2",
      title: "Navratri Dandiya Night",
      code: "navratri-garba-2026",
      category: "festival",
      hostName: "Society Committee",
      mediaCount: 412,
      autoApprove: true,
      cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500"
    },
    {
      id: "e3",
      title: "TechCorp Annual Gala 2026",
      code: "techcorp-gala-2026",
      category: "corporate",
      hostName: "Karan Malhotra",
      mediaCount: 184,
      autoApprove: false,
      cover: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500"
    }
  ]);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase()) || e.hostName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const exportEventsCSV = () => {
    const headers = ["ID", "Title", "Code", "Category", "Host", "Media Count", "Moderation"];
    const rows = filteredEvents.map(e => [
      e.id,
      `"${e.title}"`,
      e.code,
      e.category,
      `"${e.hostName}"`,
      e.mediaCount.toString(),
      e.autoApprove ? "Auto-Approve" : "Manual"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ScanUtsav_Events_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                PLATFORM CONTROL
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mt-1">Events Audit & Management</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportEventsCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title/code/host..."
                className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
            >
              <option value="all">All Categories</option>
              <option value="wedding">Weddings</option>
              <option value="festival">Festivals</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-[#F2810C] transition-all space-y-4">
              <div className="flex items-center gap-4">
                <img src={evt.cover} alt={evt.title} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                <div>
                  <h3 className="font-black text-slate-900 text-base font-display">{evt.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">Code: <span className="text-[#F2810C] font-mono font-bold">{evt.code}</span></p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Host: {evt.hostName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl text-center text-xs border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Memories</span>
                  <span className="font-black text-slate-900 text-sm">{evt.mediaCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Moderation</span>
                  <span className="font-bold text-emerald-700 text-xs">{evt.autoApprove ? "Auto-Approve" : "Manual"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link href={`/e/${evt.code}`} target="_blank" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-all">
                  <span>View Memory Wall</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
                <Link href={`/e/${evt.code}/slideshow`} target="_blank" className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition-all">
                  <Tv className="w-3.5 h-3.5 text-[#F2810C]" />
                  <span>TV Stream</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
