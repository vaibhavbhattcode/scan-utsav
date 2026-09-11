"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DETAILED_FAQS = [
  {
    question: "Do guests need to download an app to scan and upload photos?",
    answer: "No! Guests simply point their standard smartphone camera at your printed QR standee or venue TV screen. It opens an instant mobile web gallery where they can select and upload photos and videos without downloading any app or creating an account."
  },
  {
    question: "Can I moderate photos before they appear on the Live Venue TV Stream?",
    answer: "Yes! Host Moderation mode lets you view, approve, or reject incoming guest uploads in real-time from your Host Dashboard. Approved media appears on venue TVs, while unapproved items remain hidden."
  },
  {
    question: "How do I access and download event photos?",
    answer: "Hosts can view, approve, and download high-resolution photos and videos individually or by album directly from the Host Dashboard."
  },
  {
    question: "What printable QR poster and standee formats are available?",
    answer: "ScanUtsav includes a built-in QR Poster Studio supporting Framed Posters, Table Standee Cards, and Digital Invitation cards designed specifically for your event type."
  },
  {
    question: "How long is event media stored on ScanUtsav?",
    answer: "Starter Utsav includes 10 GB storage across 3 events, Royal Utsav includes 50 GB storage across 15 events, and Grand Utsav includes 250 GB storage for large multi-day celebrations."
  }
];

export default function PricingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const eventPlans = [
    {
      name: "Free Trial",
      priceINR: 0,
      period: "Testing & Trial",
      popular: false,
      maxStorageGB: 5,
      maxEvents: 1,
      bestFor: "Testing the product",
      features: ["1 Event", "✔ Up to 1,500 Photos", "✔ Up to 30 Guests", "14 Days Expiry", "ScanUtsav Branding"],
    },
    {
      name: "Celebration Lite",
      priceINR: 399,
      period: "Per Event",
      popular: false,
      maxStorageGB: 10,
      maxEvents: 1,
      bestFor: "Birthdays & Home Parties",
      features: ["1 Event", "✔ Up to 3,000 Photos", "✔ Up to 100 Guests", "30 Days Expiry", "QR Upload & Gallery"],
    },
    {
      name: "Celebration Standard",
      priceINR: 899,
      period: "Per Event",
      popular: true,
      maxStorageGB: 50,
      maxEvents: 1,
      bestFor: "Weddings, Garba & Mandals",
      features: ["1 Event", "✔ Up to 15,000 Photos", "✔ Up to 350 Videos", "90 Days Expiry", "Live Moderation Desk", "ZIP Album Download"],
    },
    {
      name: "Celebration Premium",
      priceINR: 1499,
      period: "Per Event",
      popular: false,
      maxStorageGB: 100,
      maxEvents: 1,
      bestFor: "Big Weddings & Corporates",
      features: ["1 Event", "✔ Up to 30,000 Photos", "✔ Up to 500 Guests", "180 Days Validity", "AI Face Search", "Live TV Slideshow Mode"],
    },
    {
      name: "Celebration Ultimate",
      priceINR: 2499,
      period: "Per Event",
      popular: false,
      maxStorageGB: 250,
      maxEvents: 1,
      bestFor: "Luxury Weddings",
      features: ["1 Event", "✔ Up to 75,000 Photos", "✔ Unlimited Guests", "1 Year Validity", "Custom Branding & Domain", "Dedicated Support Manager"],
    },
  ];

  const agencyPlans = [
    {
      name: "Creator Monthly",
      priceINR: 999,
      period: "per month",
      maxStorageGB: 100,
      maxEvents: 5,
      features: ["✔ Up to 30,000 Photos", "Up to 5 Active Events/mo", "Live TV Slideshow", "Custom Branding", "Cancel Anytime"],
    },
    {
      name: "Studio Monthly",
      priceINR: 2499,
      period: "per month",
      maxStorageGB: 500,
      maxEvents: 999,
      features: ["✔ Up to 150,000 Photos", "Unlimited Active Events", "Live TV Slideshow", "Team Member Accounts", "Priority Tech Support"],
    },
    {
      name: "Enterprise Custom",
      priceINR: "Custom",
      period: "yearly",
      maxStorageGB: 1000,
      maxEvents: 999,
      features: ["Custom Storage Limits", "Unlimited Active Events", "White-label Solution", "API Access", "Dedicated Success Manager"],
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
        <p className="text-slate-600 text-sm sm:text-base font-medium">All prices are inclusive of 18% GST. Pay once per plan tier and manage your celebrations with ease.</p>
      </div>

      {/* Per-Event Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900 font-display">🎉 Per-Event Celebration Plans</h2>
          <span className="text-xs text-slate-500 font-bold">Pay once per event • No auto-renewal traps</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-left max-w-6xl mx-auto">
          {eventPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] max-w-[340px] p-6 rounded-3xl space-y-5 flex flex-col justify-between border bg-white shadow-lg ${
                plan.popular ? "border-[#F2810C] ring-2 ring-[#F2810C]/30 bg-amber-50/40" : "border-slate-200"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 font-display">{plan.name}</h3>
                  {plan.popular && (
                    <span className="px-2.5 py-0.5 bg-[#F2810C] text-white font-black text-[9px] uppercase tracking-widest rounded-full shadow-sm">
                      ⭐ POPULAR
                    </span>
                  )}
                </div>

                <div className="text-3xl font-black text-slate-900 font-display">
                  {plan.priceINR === 0 ? "FREE" : `₹${plan.priceINR.toLocaleString()}`}
                  <span className="text-[10px] font-sans text-slate-500 font-normal block">{plan.period}</span>
                </div>

                <div className="bg-slate-100 p-2.5 rounded-xl text-[11px] font-bold text-slate-700">
                  Ideal for: <span className="text-[#F2810C]">{plan.bestFor}</span>
                </div>

                <div className="h-px bg-slate-200 my-2" />
                <ul className="space-y-2 text-xs text-slate-700 font-bold">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Link href="/register">
                  <Button variant={plan.popular ? "primary" : "outline"} size="md" className={`w-full text-xs font-black ${plan.popular ? "bg-[#F2810C] text-white hover:bg-[#D97706]" : "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"}`}>
                    {plan.priceINR === 0 ? "Start Free Trial" : `Choose ${plan.name.replace("Celebration ", "")}`}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Overage Notice */}
      <div className="p-6 bg-amber-100/80 border border-amber-300 rounded-3xl text-center space-y-2 max-w-4xl mx-auto shadow-sm">
        <h3 className="text-base font-bold text-amber-950 font-display">⚡ Transparent Storage Overage: ₹50 per Extra GB</h3>
        <p className="text-xs text-amber-900 font-medium max-w-2xl mx-auto">
          Need a little extra space during your celebration? Expand storage seamlessly at just ₹50/GB. <br className="hidden sm:inline" />
          <span className="font-bold text-amber-950">No forced expensive upgrades or unlimited storage bill traps!</span>
        </p>
      </div>

      {/* Agency Subscriptions Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">💼 Monthly Subscriptions for Event Companies & Photographers</h2>
            <p className="text-xs text-slate-500 font-medium">Repeat event managers get lower per-event costs and team access.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-6xl mx-auto">
          {agencyPlans.map((plan, idx) => (
            <div key={idx} className="p-8 rounded-3xl space-y-6 flex flex-col justify-between border border-slate-200 bg-white shadow-xl">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900 font-display">{plan.name}</h3>
                <p className="text-3xl font-black font-display text-slate-900 flex items-end gap-1">
                  {typeof plan.priceINR === 'number' ? `₹${plan.priceINR}` : plan.priceINR} <span className="text-sm font-medium text-slate-500 mb-1">{plan.period}</span>
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4 text-center">
                  <p className="text-xs text-slate-500">Storage limit</p>
                  <p className="font-bold text-slate-700 text-sm">{plan.maxStorageGB} GB High-Res</p>
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

              <div className="pt-4">
                <Link href="/register">
                  <Button variant="outline" size="md" className="w-full text-xs font-black bg-slate-900 text-white hover:bg-slate-800 border-slate-900">
                    Subscribe {plan.name}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Revenue / Add-ons Section */}
      <div className="pt-8 pb-12 border-t border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">Level up your event with Add-ons</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mt-2 text-sm">Enhance your event experience with these optional upgrades available anytime from your dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { name: "AI Face Recognition", price: "₹499", desc: "Let guests find all their photos instantly" },
            { name: "Extended Retention", price: "₹299", desc: "Keep memories alive for 6 extra months" },
            { name: "Premium Support", price: "₹299", desc: "Dedicated 24/7 WhatsApp assistance" },
          ].map((addon, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#F2810C] transition-colors">
              <div>
                <h4 className="font-bold text-slate-900">{addon.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{addon.desc}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-black text-[#F2810C]">{addon.price}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Per Event</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
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
