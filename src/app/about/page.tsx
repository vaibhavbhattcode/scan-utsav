import React from "react";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, QrCode, Users, Camera, Tv, Star, ArrowRight, MapPin, Target, Zap } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { number: "10,000+", label: "Events Created", icon: "🎪" },
    { number: "2M+", label: "Photos Uploaded", icon: "📸" },
    { number: "500+", label: "Cities Covered", icon: "🇮🇳" },
    { number: "99.9%", label: "Uptime SLA", icon: "⚡" },
  ];

  const values = [
    { icon: Heart, title: "Celebration First", desc: "Every feature is designed to enhance the celebration experience, not complicate it. No app downloads, no friction.", color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
    { icon: ShieldCheck, title: "Privacy by Design", desc: "DPDP Act 2023 compliant. SSL-encrypted uploads. No photo compression. Your memories, your control.", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    { icon: Zap, title: "Speed at Scale", desc: "Auto-scaling cloud infra handles 500+ simultaneous guest uploads during peak Indian wedding moments.", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    { icon: Target, title: "India-First Product", desc: "Built for Indian weddings, sangeets, Ganesh Utsav, Navratri, and corporate events — with GST invoicing.", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  ];

  const timeline = [
    { year: "2024", title: "The Idea", desc: "Founders frustrated by blurry WhatsApp wedding photos dreamed of a better way to collect guest memories." },
    { year: "Early 2025", title: "First Build", desc: "MVP launched with basic QR upload portal. First 10 beta weddings in Mumbai collected 50,000+ uncompressed photos." },
    { year: "Mid 2025", title: "AI Integration", desc: "Launched AI face recognition feature — guests can upload a selfie and instantly find all their photos across the event album." },
    { year: "2026", title: "Scale & Growth", desc: "10,000+ events. 2M+ photos. 500+ cities. Pan-India presence with GST invoicing, Live TV Mode, and enterprise plans." },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 py-16 px-6 text-center space-y-6">
        <div className="max-w-4xl mx-auto space-y-5">
          <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-amber-900 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight font-display leading-tight">
            Preserving India's <br /><span className="text-[#F2810C]">Most Joyous Moments</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            ScanUtsav was born from a simple frustration — WhatsApp compresses your precious wedding photos into pixelated memories. We built a better way.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-[#F2810C] py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center text-white space-y-1">
              <div className="text-3xl">{s.icon}</div>
              <div className="text-3xl font-black">{s.number}</div>
              <div className="text-xs font-bold text-amber-100 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
        {/* Mission Statement */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 space-y-6">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display">Our Mission</h2>
          <div className="space-y-4 text-slate-700 leading-relaxed text-base font-medium">
            <p>
              ScanUtsav was founded with a single mission: <strong className="text-slate-900">to allow every guest at an Indian event to instantly scan a QR code and securely upload photos and videos</strong>, creating a beautiful shared digital memory album — without any app download.
            </p>
            <p>
              Traditional event photography captures formal shots but misses 90% of the authentic candid smiles, dance floor madness, and spontaneous wishes happening across guest tables. ScanUtsav bridges this gap effortlessly.
            </p>
            <p>
              We believe every aunt's smartphone, every cousin's candid shot, every friend's reel deserves to be preserved at full 4K quality — not compressed beyond recognition over WhatsApp.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-display mb-6 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`rounded-3xl border p-6 space-y-3 ${bg}`}>
                <div className={`w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-black text-slate-900 text-base font-display">{title}</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-display mb-8 text-center">Our Journey</h2>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 hidden sm:block" />

            <div className="space-y-8">
              {timeline.map((t, i) => (
                <div key={t.year} className={`flex flex-col sm:flex-row gap-6 items-start ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}>
                  {/* Year Badge */}
                  <div className="sm:w-1/2 flex items-start sm:justify-end gap-3">
                    {i % 2 === 0 && (
                      <div className="hidden sm:block flex-1" />
                    )}
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#F2810C] border-4 border-amber-100 flex items-center justify-center z-10 shadow-md">
                      <span className="text-[10px] font-black text-white text-center leading-tight">{t.year.replace(" ", "\n")}</span>
                    </div>
                  </div>
                  <div className="sm:w-1/2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-2">
                    <h3 className="font-black text-slate-900 text-base font-display">{t.title}</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 space-y-6 text-center">
          <h2 className="text-2xl font-black text-slate-900 font-display">Built by Event Enthusiasts</h2>
          <p className="text-slate-600 font-medium max-w-2xl mx-auto text-sm leading-relaxed">
            Our small, passionate team is spread across Mumbai and Bengaluru. We've personally attended 200+ Indian weddings and festivals to understand what event hosts and guests actually need.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-700 font-bold">
            <span className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4 text-[#F2810C]" /> Mumbai & Bengaluru
            </span>
            <span className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-[#F2810C]" /> Team of 12
            </span>
            <span className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-[#F2810C]" /> Founded 2024
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#F2810C] rounded-3xl p-8 md:p-12 text-center space-y-5 shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-black text-white font-display">Ready to Create Your Memory Album?</h3>
          <p className="text-amber-50 text-sm font-medium max-w-md mx-auto">Set up your first event in under 60 seconds. No credit card required for the free plan.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-amber-50 text-slate-900 font-black text-sm rounded-2xl shadow-xl transition-all">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-amber-700/30 hover:bg-amber-700/50 text-white font-black text-sm rounded-2xl border border-white/30 transition-all">
                Talk to Sales
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
