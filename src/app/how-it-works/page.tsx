import React from "react";
import Link from "next/link";
import { QrCode, Upload, Tv, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Create Event & Generate QR",
      desc: "Host sets up event details in 60 seconds and downloads a custom QR code standee poster.",
      icon: QrCode
    },
    {
      num: "02",
      title: "Guests Scan & Upload",
      desc: "Guests scan QR standee with phone camera. No app download needed. Photos and videos stream live.",
      icon: Upload
    },
    {
      num: "03",
      title: "Live Venue TV Broadcast",
      desc: "Connect any TV monitor or venue projector to auto-display approved guest photos in real time.",
      icon: Tv
    },
    {
      num: "04",
      title: "Download Full HD Archive",
      desc: "Host downloads all original uncompressed 4K photos and videos in a single ZIP file.",
      icon: Download
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8 space-y-12 font-sans bg-[#FAF9F6] text-slate-900">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-950 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
          Step by Step Workflow
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
          How <span className="text-[#F2810C]">ScanUtsav</span> Works
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          Designed for seamless guest participation with zero technical friction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="p-8 rounded-3xl space-y-4 border border-slate-200 bg-white shadow-md relative">
              <span className="text-5xl font-black text-amber-300/40 absolute top-6 right-6 font-display">{step.num}</span>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-[#F2810C]">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{step.title}</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">{step.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href="/dashboard">
          <Button variant="primary" size="lg" className="shadow-md text-xs font-black bg-[#F2810C] hover:bg-[#D97706] text-white px-8 py-3.5 border border-[#F2810C]">
            <span>Try It Yourself Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
