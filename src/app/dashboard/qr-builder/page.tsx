"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Download, Printer, Palette, Sparkles, Layout, ArrowLeft, Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateQRCodeDataUrl } from "@/lib/qr-service";

export default function QRBuilderStudio() {
  const [eventTitle, setEventTitle] = useState("Ananya & Vikram's Wedding");
  const [tagline, setTagline] = useState("Scan to Upload Your Photos & Wishes!");
  const [qrColor, setQrColor] = useState("#ff5429");
  const [template, setTemplate] = useState<"royal" | "minimal" | "golden">("royal");
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 font-sans text-slate-900">
      {/* Top Header - Hidden when printing */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6 print-hide">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Design Studio</span>
            <h1 className="text-3xl font-black text-slate-900 font-display">Printable QR Poster & Standee Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="glass" size="md" onClick={handlePrintTrigger}>
            <Printer className="w-4 h-4 text-brand-400" />
            <span>Print Poster</span>
          </Button>

          <Button variant="primary" size="md" onClick={handleDownloadPNG} className="shadow-glow-brand">
            <Download className="w-4 h-4" />
            <span>Download High-Res PNG</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customizer Controls Sidebar - Hidden when printing */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl space-y-6 border border-white/10 print-hide">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-400" />
            <span>Poster Customization</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Header Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Instruction Subhead</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">QR Code Accent Color</label>
            <div className="flex items-center gap-3">
              {["#ff5429", "#6366f1", "#f59e0b", "#10b981", "#ec4899"].map((color) => (
                <button
                  key={color}
                  onClick={() => setQrColor(color)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    qrColor === color ? "scale-125 ring-2 ring-white" : ""
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {qrColor === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Planner / Venue Co-Branding Fields */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" /> Planner & Venue Co-Branding
            </h4>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Agency / Hotel Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Agency Contact / Website</label>
              <input
                type="text"
                value={agencyContact}
                onChange={(e) => setAgencyContact(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Poster Canvas Frame Target - ISOLATED FOR PRINT */}
        <div className="lg:col-span-7 flex justify-center w-full">
          <div
            id="printable-poster-area"
            className={`w-full max-w-md p-8 rounded-3xl shadow-2xl text-center space-y-6 transition-all duration-300 ${
              template === "royal" ? "bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-brand-500 shadow-glow-brand" :
              template === "golden" ? "bg-gradient-to-b from-amber-950/40 via-slate-950 to-black border-2 border-amber-500" :
              "bg-slate-900 border border-white/20"
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">WELCOME GUESTS</span>
              <h2 className="text-2xl font-black text-white">{eventTitle}</h2>
              <p className="text-xs text-slate-300">{tagline}</p>
            </div>

            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl mx-auto border-4 border-slate-100">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code Poster" className="w-56 h-56 object-contain" />
              ) : (
                <div className="w-56 h-56 bg-slate-200 animate-pulse rounded-2xl" />
              )}
            </div>

            {/* Co-Branding Footer */}
            <div className="pt-4 border-t border-white/10 text-center space-y-1">
              <div className="text-xs font-bold text-amber-300">{agencyName}</div>
              <div className="text-[10px] text-slate-400">{agencyContact}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest pt-1">
                POWERED BY <span className="text-brand-500 font-bold">SCANUTSAV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
