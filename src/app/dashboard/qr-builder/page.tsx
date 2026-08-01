"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Download, Printer, Palette, Sparkles, Layout, ArrowLeft, Check, Building2, Sliders } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateQRCodeDataUrl } from "@/lib/qr-service";

export default function QRBuilderStudio() {
  const [eventTitle, setEventTitle] = useState("Ananya & Vikram's Wedding");
  const [tagline, setTagline] = useState("Scan to Upload Your Photos & Wishes!");
  const [qrColor, setQrColor] = useState("#F2810C");
  const [template, setTemplate] = useState<"royal" | "golden" | "minimal">("royal");
  const [agencyName, setAgencyName] = useState("Royal Events & Weddings Pvt Ltd");
  const [agencyContact, setAgencyContact] = useState("www.royalevents.in • +91 98765 00000");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    generateQRCodeDataUrl(`https://scanutsav.com/e/ananya-vikram-2026`, {
      colorDark: qrColor,
      colorLight: "#ffffff",
      width: 400
    }).then(url => setQrDataUrl(url));
  }, [qrColor, eventTitle]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${eventTitle.replace(/[^a-z0-9]/gi, "_")}_QR_Poster.png`;
    link.click();
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-16 space-y-8 font-sans text-slate-900">
      {/* Top Header Bar - Hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 print-hide">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Design Studio</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Printable QR Standee Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="glass" size="md" onClick={handlePrintTrigger} className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs">
            <Printer className="w-4 h-4 text-[#F2810C]" />
            <span>Print Poster</span>
          </Button>

          <Button variant="primary" size="md" onClick={handleDownloadPNG} className="bg-[#F2810C] hover:bg-[#D97706] text-white font-bold text-xs shadow-md border border-[#F2810C]">
            <Download className="w-4 h-4" />
            <span>Download High-Res PNG</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customizer Controls Sidebar - Hidden when printing */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm print-hide">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 font-display">
              <Sliders className="w-4 h-4 text-[#F2810C]" />
              <span>Poster Customization</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Preview
            </span>
          </div>

          {/* Template Style Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">Poster Theme Style</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplate("royal")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${template === "royal"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                Royal Dark
              </button>
              <button
                type="button"
                onClick={() => setTemplate("golden")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${template === "golden"
                    ? "bg-amber-700 text-white border-amber-800 shadow-md"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                Gold Luxe
              </button>
              <button
                type="button"
                onClick={() => setTemplate("minimal")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${template === "minimal"
                    ? "bg-[#F2810C] text-white border-[#F2810C] shadow-md"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                Minimal White
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Header Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Ananya & Vikram's Wedding"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#F2810C] focus:bg-white shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Instruction Subhead</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Scan to Upload Your Photos & Wishes!"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F2810C] focus:bg-white shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Color Swatch Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">QR Code Accent Color</label>
            <div className="flex items-center gap-3">
              {[
                { name: "Marigold Orange", hex: "#F2810C" },
                { name: "Royal Indigo", hex: "#4F46E5" },
                { name: "Gold Amber", hex: "#D97706" },
                { name: "Emerald", hex: "#059669" },
                { name: "Rose Pink", hex: "#E11D48" },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setQrColor(c.hex)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${qrColor === c.hex ? "scale-110 ring-4 ring-amber-300 shadow-md" : "hover:scale-105 opacity-90"
                    }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {qrColor === c.hex && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          {/* Planner / Venue Co-Branding Fields */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-display">
              <Building2 className="w-4 h-4 text-[#F2810C]" /> Planner & Venue Co-Branding
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agency / Hotel Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Royal Events & Weddings Pvt Ltd"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F2810C] focus:bg-white shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agency Contact / Website</label>
              <input
                type="text"
                value={agencyContact}
                onChange={(e) => setAgencyContact(e.target.value)}
                placeholder="e.g. www.royalevents.in • +91 98765 00000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F2810C] focus:bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Live Poster Canvas Frame Target - ISOLATED FOR PRINT */}
        <div className="lg:col-span-7 flex justify-center w-full">
          <div
            id="printable-poster-area"
            className={`w-full max-w-md p-8 rounded-3xl shadow-2xl text-center space-y-6 transition-all duration-300 ${template === "royal"
                ? "bg-slate-950 text-white border-4 border-amber-500/40 shadow-glow-marigold"
                : template === "golden"
                  ? "bg-gradient-to-b from-amber-950 via-slate-950 to-black text-white border-4 border-amber-500"
                  : "bg-white text-slate-900 border-4 border-slate-300 shadow-xl"
              }`}
          >
            <div className="space-y-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${template === "minimal" ? "text-[#F2810C]" : "text-amber-400"}`}>
                WELCOME GUESTS
              </span>
              <h2 className={`text-2xl font-black font-display ${template === "minimal" ? "text-slate-900" : "text-white"}`}>
                {eventTitle}
              </h2>
              <p className={`text-xs font-medium ${template === "minimal" ? "text-slate-600" : "text-slate-300"}`}>
                {tagline}
              </p>
            </div>

            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl mx-auto border-4 border-slate-200">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code Poster" className="w-56 h-56 object-contain" />
              ) : (
                <div className="w-56 h-56 bg-slate-200 animate-pulse rounded-2xl" />
              )}
            </div>

            {/* Co-Branding Footer */}
            <div className={`pt-4 border-t ${template === "minimal" ? "border-slate-200 text-slate-800" : "border-white/10 text-white"} text-center space-y-1`}>
              <div className={`text-xs font-bold ${template === "minimal" ? "text-slate-900" : "text-amber-300"}`}>
                {agencyName}
              </div>
              <div className={`text-[10px] ${template === "minimal" ? "text-slate-600" : "text-slate-400"}`}>
                {agencyContact}
              </div>
              <div className={`text-[9px] uppercase tracking-widest pt-1 font-bold ${template === "minimal" ? "text-slate-500" : "text-slate-400"}`}>
                POWERED BY <span className="text-[#F2810C] font-black">SCANUTSAV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
