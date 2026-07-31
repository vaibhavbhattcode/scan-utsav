"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Clock, Calendar, User, Share2, BookOpen,
  CheckCircle2, Sparkles, ArrowRight, Heart
} from "lucide-react";

const BLOG_CONTENT: Record<string, {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  coverImage: string;
  excerpt: string;
  sections: { heading: string; body: string }[];
  ctaTitle: string;
}> = {
  "how-to-collect-uncompressed-4k-wedding-photos": {
    title: "How to Collect Uncompressed 4K Wedding Photos From 500 Guests",
    category: "Wedding Planning",
    author: "Ananya Sharma",
    date: "July 24, 2026",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    excerpt: "The biggest heartbreak after a gorgeous Indian wedding is asking 500 guests for photos over WhatsApp and receiving heavily compressed, pixelated images.",
    sections: [
      {
        heading: "1. Why App Downloads Fail at Real Events",
        body: "Expecting busy guests to download a 50MB mobile app, create a new user account, and grant background location permissions during a noisy sangeet or reception leads to a 90%+ drop-off rate. Guests are there to celebrate, not troubleshoot tech.",
      },
      {
        heading: "2. The QR Memory Standee Breakthrough",
        body: "By placing framed QR standees on reception tables and mandap entrances, guests simply point their native iOS or Android camera at the QR code. It opens a 2-second web upload portal without requiring any app download or sign-up — frictionless, instant, and beautiful.",
      },
      {
        heading: "3. Preserving Uncompressed 4K & RAW Quality",
        body: "ScanUtsav streams uploads directly to cloud storage via presigned URLs, preserving 100% camera resolution — 4K, RAW, PNG, and 60fps video — so the host receives full camera archives in one click. No WhatsApp compression. No pixelation.",
      },
      {
        heading: "4. Live Slideshow on Venue TVs",
        body: "With ScanUtsav's built-in Live TV Mode, guest uploads appear on your venue's big screen in real time. Imagine guests seeing their own photos appear on the reception hall screen minutes after uploading — truly magical!",
      },
      {
        heading: "5. AI-Powered Face Recognition Search",
        body: "After the event, every guest can upload a selfie to instantly find all photos they appear in across the 500+ guest uploads. The AI facial recognition engine matches faces with high confidence so your guests can download just their photos in seconds.",
      },
    ],
    ctaTitle: "Ready to collect uncompressed wedding memories?",
  },
  "top-10-indian-festival-qr-standee-designs": {
    title: "Top 10 Indian Festival QR Standee Designs for Ganesh Utsav & Navratri",
    category: "Festival Guides",
    author: "Vikram Sethi",
    date: "July 20, 2026",
    readTime: "7 min read",
    coverImage: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200",
    excerpt: "Discover print-ready standee poster designs with marigold, modak line-art, and garba mirrorwork borders that delight devotees.",
    sections: [
      {
        heading: "Why Standee Design Matters at Festivals",
        body: "A beautifully designed QR standee placed at the mandap entrance or near the Ganesh idol invites devotees to participate in the community memory album. The right design matches the festival's visual language and earns instant trust.",
      },
      {
        heading: "Design 1: Marigold Garland Border",
        body: "Inspired by the signature marigold garlands of Indian festivals — bright amber and saffron borders frame the QR code with a Devanagari headline 'यादें साझा करें' (Share Your Memories). Perfect for Ganesh Utsav pandals.",
      },
      {
        heading: "Design 2: Mirrorwork Garba Circle",
        body: "Circular mirror embroidery patterns from Kutch craft tradition surround the QR code in this Navratri-special design. The deep maroon and gold palette evokes the festive energy of nine nights of garba.",
      },
      {
        heading: "Print Specifications",
        body: "All standees should be printed at minimum 300 DPI on matte laminated boards (A1 or A2 size). Ensure the QR code is at least 8cm x 8cm and high-contrast black on white for reliable scanning from 1-2 metres distance.",
      },
    ],
    ctaTitle: "Create your festival event memory portal today!",
  },
  "setting-up-live-venue-tv-slideshows": {
    title: "Setting Up Live Venue TV Slideshows for Reception Halls & Pandals",
    category: "Event Tech",
    author: "Rohan Verma",
    date: "July 15, 2026",
    readTime: "4 min read",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
    excerpt: "Step-by-step guide to projecting real-time guest photo uploads on venue big screens with 15-second auto-polling and Ken Burns pan/zoom.",
    sections: [
      {
        heading: "Step 1: Open the Live TV URL on Your Venue Screen",
        body: "From your ScanUtsav host dashboard, navigate to your event → Live TV Mode. Copy the fullscreen slideshow URL and paste it into the browser on the TV or projector laptop connected to your venue screen. No app install required.",
      },
      {
        heading: "Step 2: Auto-Polling Every 15 Seconds",
        body: "The slideshow auto-fetches newly approved guest uploads every 15 seconds. New photos smoothly fade into the Ken Burns pan/zoom carousel so the display always feels fresh and live — perfect for reception dining.",
      },
      {
        heading: "Step 3: Recommended Display Settings",
        body: "Set the browser to fullscreen (F11), disable screensaver, and enable 'Keep display on' in your OS power settings. For best results, use a HDMI connection at 1920×1080 or 3840×2160 (4K) resolution.",
      },
      {
        heading: "Step 4: Moderate Uploads from Your Phone",
        body: "While the slideshow runs on your venue TV, your event coordinator can approve or reject uploads in real time from the ScanUtsav host app on their phone — ensuring only the best memories make it to the big screen.",
      },
    ],
    ctaTitle: "Set up your live TV slideshow for your next event!",
  },
};

export default function BlogArticleDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "how-to-collect-uncompressed-4k-wedding-photos";
  const article = BLOG_CONTENT[slug] || BLOG_CONTENT["how-to-collect-uncompressed-4k-wedding-photos"];

  const CATEGORY_COLORS: Record<string, string> = {
    "Wedding Planning": "bg-rose-100 text-rose-800 border-rose-300",
    "Festival Guides": "bg-amber-100 text-amber-900 border-amber-300",
    "Event Tech": "bg-blue-100 text-blue-800 border-blue-300",
    "SaaS Architecture": "bg-emerald-100 text-emerald-800 border-emerald-300",
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#F2810C] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#F2810C] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{article.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#F2810C] transition-colors bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        {/* Article Header */}
        <div className="space-y-5">
          <span className={`inline-block px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${CATEGORY_COLORS[article.category] || "bg-amber-100 text-amber-900 border-amber-300"}`}>
            {article.category}
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display leading-tight">
            {article.title}
          </h1>

          {/* Author / Date / Read time bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-bold pb-5 border-b border-slate-200">
            <span className="flex items-center gap-1.5 text-slate-900">
              <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-black text-sm">
                {article.author[0]}
              </div>
              {article.author}
            </span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#F2810C]" /> {article.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#F2810C]" /> {article.readTime}</span>
            <button className="ml-auto flex items-center gap-1.5 text-slate-500 hover:text-[#F2810C] transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* Hero Banner Image */}
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-72 sm:h-96 object-cover"
          />
        </div>

        {/* Lead Quote */}
        <blockquote className="border-l-4 border-[#F2810C] pl-6 py-2">
          <p className="text-lg text-slate-700 font-serif italic leading-relaxed">
            "{article.excerpt}"
          </p>
        </blockquote>

        {/* Article Body Sections */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-8">
          {article.sections.map((section, i) => (
            <div key={i} className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display flex items-start gap-2">
                <span className="w-7 h-7 flex-shrink-0 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-black text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{section.heading.replace(/^\d+\.\s*/, "")}</span>
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium pl-9">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Key Takeaways Box */}
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-black text-amber-900 font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F2810C]" /> Key Takeaways
          </h3>
          <ul className="space-y-2">
            {article.sections.slice(0, 3).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#F2810C] flex-shrink-0 mt-0.5" />
                <span>{s.heading.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Author Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 font-black text-lg flex-shrink-0">
            {article.author[0]}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-black text-slate-900">{article.author}</div>
            <div className="text-xs text-slate-500 font-medium">ScanUtsav Content Team · Event Tech & Wedding Planning Expert</div>
            <div className="flex items-center gap-1 text-[10px] text-[#F2810C] font-bold">
              <Heart className="w-3 h-3 fill-[#F2810C]" /> Writing about Indian weddings & celebrations since 2022
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">More Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(BLOG_CONTENT)
              .filter(([s]) => s !== slug)
              .slice(0, 2)
              .map(([s, a]) => (
                <Link key={s} href={`/blog/${s}`} className="group block bg-white rounded-2xl border border-slate-200 hover:border-amber-300 p-5 shadow-sm hover:shadow-md transition-all">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-2 ${CATEGORY_COLORS[a.category] || "bg-amber-100 text-amber-900 border-amber-300"}`}>
                    {a.category}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#F2810C] transition-colors leading-snug line-clamp-2">{a.title}</h4>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-[#F2810C] font-bold">
                    Read Article <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-[#F2810C] rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-2xl">
          <span className="inline-block text-xs font-black uppercase tracking-widest bg-white text-slate-900 px-4 py-1.5 rounded-full">
            GET STARTED FREE
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
            {article.ctaTitle}
          </h3>
          <p className="text-amber-50 text-sm font-medium max-w-md mx-auto">
            Set up your event memory portal in under 60 seconds. No app download required for guests.
          </p>
          <Link href="/register">
            <button className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-amber-50 text-slate-900 font-black text-sm rounded-2xl shadow-xl transition-all border border-white mt-2">
              <span>Create Free Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
