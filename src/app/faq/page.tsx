"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Search, Phone, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

const FAQ_DATA = [
  {
    category: "Getting Started",
    icon: "🚀",
    items: [
      {
        q: "Do guests need to download an app to upload photos?",
        a: "No! Guests simply open their smartphone camera, scan the event QR code, and land directly on your private web gallery. They can upload photos, videos, and wishes in seconds — no app download, no sign-up required.",
      },
      {
        q: "How do I create my first event?",
        a: "Register as a host → go to Host Dashboard → click 'Create New Event' → enter event details → your unique QR code is instantly generated. The entire setup takes under 60 seconds.",
      },
      {
        q: "How many guests can upload photos simultaneously?",
        a: "ScanUtsav is built on auto-scaling cloud infrastructure. Our platform handles 500+ simultaneous guest uploads without any slowdown — perfect for large Indian weddings and festivals.",
      },
    ],
  },
  {
    category: "Photo & Video Uploads",
    icon: "📸",
    items: [
      {
        q: "What file formats are supported for uploads?",
        a: "We support all standard image formats (JPG, PNG, HEIC, WEBP, RAW) and video formats (MP4, MOV, AVI) up to 2GB per file. 4K video and uncompressed RAW files are fully supported.",
      },
      {
        q: "Is photo quality compressed or degraded during upload?",
        a: "Never! ScanUtsav uses direct presigned cloud storage URLs so photos are uploaded at 100% original quality — no WhatsApp-style compression. Your 4K RAW wedding photos arrive exactly as captured.",
      },
      {
        q: "Can I download all guest photos at once?",
        a: "Yes! Hosts can download the complete event memory archive as an uncompressed ZIP file with one click from the Host Dashboard. All photos maintain their original 4K resolution.",
      },
    ],
  },
  {
    category: "Live TV & Slideshow",
    icon: "📺",
    items: [
      {
        q: "How do I set up the live slideshow on venue TV screens?",
        a: "Connect a laptop or smart TV to your venue display → open your event slideshow URL (e.g. /e/your-code/slideshow) → press F11 for fullscreen. New guest photos auto-appear every 15 seconds with beautiful Ken Burns pan/zoom animations.",
      },
      {
        q: "Can I moderate which photos appear on the TV screen?",
        a: "Yes! Toggle 'Auto-Approve' off in your Host Dashboard. All incoming uploads queue in the moderation grid. You or your coordinator can approve or reject each photo from your phone in real time.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    icon: "🔒",
    items: [
      {
        q: "Who can view my event photos?",
        a: "Only guests with your unique event URL/QR code can view and upload to your event gallery. All galleries are private by default. You control visibility settings from your Host Dashboard.",
      },
      {
        q: "Is ScanUtsav compliant with India's DPDP Act 2023?",
        a: "Yes. We display a mandatory DPDP Act 2023 consent checkbox on all guest upload pages. All data is encrypted in transit (SSL/TLS) and at rest. Guest data is never sold or shared with third parties.",
      },
      {
        q: "How long are event photos stored?",
        a: "Storage duration depends on your plan: Starter (30 days), Royal Utsav (1 year), Grand Enterprise (Lifetime). You can always download your full archive before the retention period ends.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    icon: "💳",
    items: [
      {
        q: "What is your refund policy?",
        a: "We offer a 100% money-back guarantee within 7 days of purchase if you are unsatisfied for any reason. Contact concierge@scanutsav.com with your order ID for an instant refund.",
      },
      {
        q: "Do you offer discounts for wedding planners or hotels?",
        a: "Yes! We have a Partner Program for wedding planners, hotels, and banquet halls offering 20-40% bulk event discounts. Contact our partnerships team at concierge@scanutsav.com.",
      },
      {
        q: "Is GST invoice available for business events?",
        a: "Yes. We issue proper GST-compliant tax invoices (GSTIN: 27AAAAA0000A1Z5) for all paid plans. Invoices are auto-generated after payment and sent to your registered email.",
      },
    ],
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...FAQ_DATA.map((c) => c.category)];

  const filteredFAQs = FAQ_DATA
    .filter((cat) => activeCategory === "All" || cat.category === activeCategory)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          search === "" ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const totalQuestions = FAQ_DATA.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 py-14 px-6 text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-amber-900 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">
            Support & Help Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Frequently Asked <span className="text-[#F2810C]">Questions</span>
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto font-medium">
            Find answers to common questions about ScanUtsav's event photo collection, live TV, pricing, and privacy.
          </p>
          <div className="text-xs text-slate-500 font-bold">{totalQuestions} questions answered</div>
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-black transition-all"
              style={activeCategory === cat
                ? { backgroundColor: "#F2810C", color: "#fff", border: "1.5px solid #F2810C" }
                : { backgroundColor: "#F1F5F9", color: "#334155", border: "1.5px solid #E2E8F0" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordions */}
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="font-bold text-slate-900">No results found</h3>
            <p className="text-sm text-slate-500">Try a different search term.</p>
            <button onClick={() => setSearch("")} className="px-5 py-2 bg-[#F2810C] text-white font-black text-xs rounded-xl">Clear Search</button>
          </div>
        ) : (
          filteredFAQs.map((category) => (
            <div key={category.category} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xl">{category.icon}</span>
                <h2 className="text-base font-black text-slate-900 font-display">{category.category}</h2>
                <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {category.items.length}
                </span>
              </div>

              {category.items.map((item, i) => {
                const key = `${category.category}-${i}`;
                const isOpen = openItem === key;
                return (
                  <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-amber-300">
                    <button
                      onClick={() => setOpenItem(isOpen ? null : key)}
                      className="w-full flex items-start gap-3 p-5 text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-[#F2810C] flex-shrink-0 mt-0.5" />
                      <span className="flex-1 text-sm font-bold text-slate-900 leading-snug">{item.q}</span>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      }
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pl-12">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Contact Support Card */}
        <div className="bg-[#F2810C] rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-xl font-black text-white font-display">Still Have Questions?</h3>
          <p className="text-amber-50 text-sm font-medium">Our team is available 7 days a week, 9 AM – 9 PM IST.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-black text-xs rounded-xl shadow-md hover:bg-amber-50 transition-all">
              <Mail className="w-4 h-4 text-[#F2810C]" /> Email Support
            </Link>
            <a href="https://wa.me/919876543210" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md hover:bg-emerald-700 transition-all">
              <MessageCircle className="w-4 h-4" /> WhatsApp Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
