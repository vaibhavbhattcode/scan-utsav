"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EVENT_TEMPLATES, EventTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Filter } from "lucide-react";

export default function SolutionsPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "wedding", label: "Weddings & Ceremonies" },
    { id: "festival", label: "Indian Festivals (Ganesh Utsav, Garba, Diwali)" },
    { id: "corporate", label: "Corporate Summits" },
    { id: "party", label: "Birthdays & Parties" },
    { id: "educational", label: "School & College" },
  ];

  const filteredTemplates = filterCategory === "all"
    ? EVENT_TEMPLATES
    : EVENT_TEMPLATES.filter((t) => t.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8 space-y-10 font-sans bg-[#FAF9F6] text-slate-900">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-950 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
          30+ Industry & Festival Presets
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
          Tailored Solutions for <span className="text-[#F2810C]">Every Utsav</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          Explore specialized templates designed for Indian weddings, Garba nights, Ganesh Chaturthi, corporate summits & more.
        </p>
      </div>

      {/* Filter Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all shadow-sm ${
              filterCategory === c.id
                ? "bg-[#F2810C] text-white shadow-md border border-[#F2810C]"
                : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((t) => (
          <div key={t.id} className="p-6 rounded-3xl space-y-4 border border-slate-200 bg-white shadow-md flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={t.coverImage} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-900 uppercase border border-amber-300 shadow-sm">
                  {t.badgeText}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 font-display">{t.name}</h3>
              <p className="text-slate-600 text-xs italic font-medium">"{t.tagline}"</p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Link href="/dashboard/events">
                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-300 text-slate-900 bg-white hover:bg-slate-100">
                  <span>Launch {t.name} Preset</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F2810C]" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
