"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DETAILED_FAQS = [
  {
    question: "Do guests need to download an app to scan and upload photos?",
    answer: "No! Guests simply point their standard smartphone camera at your printed QR standee or venue TV screen. It opens an instant mobile webpage where they can select and upload 4K photos, HD videos, and audio wishes in under 2 seconds without downloading any app or creating an account."
  },
  {
    question: "Can I moderate photos before they appear on the Live Venue TV Stream?",
    answer: "Yes! Host Moderation mode lets you view, approve, or reject incoming guest uploads in real-time from your Host Dashboard. Approved media appears instantly on venue TVs, while unapproved items are safely hidden."
  },
  {
    question: "How do I download all full-resolution photos after the event?",
    answer: "Hosts can download the complete, uncompressed 4K RAW photo and 60fps video archive in a single ZIP file with one click directly from the Host Dashboard."
  },
  {
    question: "What printable QR poster and standee formats are available?",
    answer: "ScanUtsav includes a built-in Printable QR Poster Studio supporting A4 Framed Posters (150-300 DPI), Table Standee Cards, Instagram Story graphics, and WhatsApp Invitation cards designed specifically for your event type."
  },
  {
    question: "How long is event media stored on ScanUtsav?",
    answer: "Free events include 7 days of cloud storage, Royal Utsav includes 30 days of active high-speed cloud access, and Grand Utsav includes lifetime cloud backup & dedicated drive export."
  }
];

export default function PricingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const plans = [
    {
      name: "Free Utsav",
      priceINR: 0,
      popular: false,
      maxStorageGB: 1,
      features: ["Up to 50 Guests", "Basic Gallery Wall", "Standard QR Generator", "7 Days Storage Access"],
    },
    {
      name: "Royal Utsav",
      priceINR: 2499,
      popular: true,
      maxStorageGB: 25,
      features: ["Unlimited Guests", "Live TV Slideshow Mode", "Custom QR Poster Studio", "Full HD RAW ZIP Archive", "30 Days Active Storage Access"],
    },
    {
      name: "Grand Utsav",
      priceINR: 6999,
      popular: false,
      maxStorageGB: 100,
      features: ["Unlimited Guests & Events", "AI Face Recognition Ready", "Dedicated Cloud Folder", "WhatsApp Invite Integration", "Lifetime Cloud Storage Backup"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans px-6 py-6 sm:py-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-950 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
          TRANSPARENT PRICING
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display">Simple Plans for Every Celebration</h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">No hidden monthly subscriptions. Pay per event and keep memories forever.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-3xl space-y-6 flex flex-col justify-between border bg-white shadow-xl ${
              plan.popular ? "border-[#F2810C] shadow-glow-marigold bg-amber-50/50" : "border-slate-200"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 font-display">{plan.name}</h3>
                {plan.popular && (
                  <span className="px-3 py-1 bg-[#F2810C] text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-md">
                    MOST POPULAR
                  </span>
                )}
              </div>

              <div className="text-4xl font-black text-slate-900 font-display">
                ₹{plan.priceINR.toLocaleString()}
                <span className="text-xs font-sans text-slate-500 font-normal"> / event</span>
              </div>
              <div className="h-px bg-slate-200 my-4" />
              <ul className="space-y-2.5 text-xs text-slate-700 font-bold">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/register">
                <Button variant={plan.popular ? "primary" : "outline"} size="md" className={`w-full text-xs font-black ${plan.popular ? "bg-[#F2810C] text-white hover:bg-[#D97706]" : "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"}`}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-8 max-w-4xl mx-auto pt-4">
        <h2 className="text-3xl font-black text-slate-900 font-display text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {DETAILED_FAQS.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              className="p-6 rounded-2xl border border-slate-200 cursor-pointer space-y-2 bg-white shadow-sm hover:border-amber-400 transition-all"
            >
              <div className="flex items-center justify-between font-bold text-slate-900 text-base gap-4">
                <span>{faq.question}</span>
                <span className="text-[#F2810C] font-mono text-lg flex-shrink-0">{openFaqIndex === idx ? "−" : "+"}</span>
              </div>
              {openFaqIndex === idx && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-3 border-t border-slate-200 font-medium">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
