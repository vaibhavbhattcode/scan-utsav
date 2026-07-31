"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { 
  QrCode, Sparkles, Tv, ShieldCheck, ArrowRight, Camera, Printer, 
  Download, Star, CheckCircle2, Heart, HelpCircle, Layers, Users, Zap,
  Check, Play, ChevronRight, Lock, MessageSquare, Image as ImageIcon,
  Building, Calendar, Flame, Smile, Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const OCCASIONS = ["wedding", "ganesh", "navratri", "corporate", "birthday"];

const OCCASION_DATA: Record<string, { title: string; desc: string; image: string; tag: string; features: string[] }> = {
  wedding: {
    title: "Royal Wedding & Sangeet Celebrations",
    desc: "Deep maroon & gold foil themes, wax-seal QR medallion standees, live venue TV slideshows, and uncompressed 4K photo archives for your lifelong memory.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    tag: "Weddings & Sangeet",
    features: ["Wax-Seal QR Table Standees", "Live TV Slideshow with Guest Names", "Guest Audio Voice Wishes", "4K Uncompressed ZIP Backup"]
  },
  ganesh: {
    title: "Maha Ganesh Chaturthi Pandal Stream",
    desc: "Marigold & crimson themes, modak line-art motifs, and real-time live venue TV streaming for thousands of visiting devotees.",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800",
    tag: "Ganesh Chaturthi",
    features: ["High-Volume Devotee Photo Stream", "Live Pandal Screen Projection", "AI Blur & Duplicate Filtering", "7-Day Cloud Storage"]
  },
  navratri: {
    title: "Nine-Night Garba & Dandiya Stream",
    desc: "Royal garba purple & gold mirrorwork motifs, vibrant event skins, and guest audio wish recordings for high-energy dance nights.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    tag: "Navratri Garba",
    features: ["Mirrorwork QR Poster Studio", "Real-Time Dance Floor Photo Feed", "WhatsApp QR Share", "Guest Heart Likes"]
  },
  corporate: {
    title: "Corporate Summits & Brand Expos",
    desc: "Platinum ink & gold hairline accents, prominent company logo slots, instant GST invoice receipts, and executive reporting.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    tag: "Corporate Summits",
    features: ["Custom Brand Logo Overlay", "Instant 18% GST Invoice", "DPDP Act Privacy Compliant", "Single-Click Zip Download"]
  },
  birthday: {
    title: "Birthday & Anniversary Parties",
    desc: "Playful confetti scatter backgrounds, friendly QR badges, and instant guest memory collection for your favorite milestones.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
    tag: "Birthdays & Parties",
    features: ["Fun Confetti Theme Skins", "Mobile Web Zero-App Upload", "Instant Live Photo Wall", "Digital Guestbook"]
  }
};

const DETAILED_FAQS = [
  {
    question: "Do guests need to download an app to scan and upload photos?",
    answer: "No! Guests simply point their standard smartphone camera at your printed QR standee or venue TV screen. It opens an instant mobile webpage where they can select and upload 4K photos, HD videos, and voice wishes in under 2 seconds without downloading any app or creating an account."
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
    question: "How does the Live Venue TV Slideshow mode work?",
    answer: "Simply open your event's live TV slideshow link (`/e/[code]/slideshow`) on any smart TV, laptop, or projector. The stream automatically polls for new approved guest photos every 15 seconds with smooth Ken-Burns transitions and displays a floating corner QR code so guests can scan continuously."
  },
  {
    question: "Is guest data private and compliant with India's DPDP Act & GDPR?",
    answer: "Yes. All uploads are encrypted in transit via SSL/TLS and stored securely on cloud storage. Photos are only accessible to your event's guests and host. We strictly enforce privacy laws and never share or sell guest media."
  },
  {
    question: "What happens if guests take photos without internet connectivity at the venue?",
    answer: "Our mobile web app includes offline queueing! Photos captured while offline automatically queue up and upload as soon as the guest's phone detects cellular or venue Wi-Fi connection."
  },
  {
    question: "Can I get a GST invoice for my corporate event or wedding booking?",
    answer: "Yes! All paid plans (Royal Utsav and Grand Utsav) automatically issue a GST-compliant tax invoice with 18% GST breakdown (CGST + SGST) downloadable from your Host Dashboard."
  }
];

const TESTIMONIALS = [
  {
    name: "Vikram & Ananya Sharma",
    role: "Bride & Groom • Udaipur Destination Wedding",
    text: "ScanUtsav collected over 1,400 uncompressed photos that our official wedding photographer missed! Guests loved seeing their photos appear on the big screen during the Sangeet.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  },
  {
    name: "Rajesh Kulkarni",
    role: "Secretary • Lalbaug Festival Committee",
    text: "We hosted 25,000+ devotees during Ganesh Chaturthi. The live TV slideshow projected all devotee photos seamlessly. Highly recommended for festival pandals!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    name: "Priya Mehta",
    role: "Lead Event Planner • Celebrations India",
    text: "The printable QR standee generator saved us hours of design work. We generated custom wax-seal table cards that matched the mandap decor perfectly.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  }
];

export default function LandingHomePage() {
  const [cms, setCms] = useState<any>(null);
  const [activeOccasion, setActiveOccasion] = useState("wedding");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [heroQrUrl, setHeroQrUrl] = useState<string>("");

  // 3D Tilt Card state
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);

  useEffect(() => {
    const origin = typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    const scanDestination = `${origin}/e/demo-event`;

    QRCode.toDataURL(scanDestination, {
      width: 320,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setHeroQrUrl(url))
      .catch((err) => console.error("Hero QR code generation failed:", err));
  }, []);

  useEffect(() => {
    fetch("/api/admin/cms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.cms) {
          setCms(data.cms);
        }
      })
      .catch(() => {});
  }, []);

  // Auto rotate occasion tabs every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOccasion((prev) => {
        const currentIndex = OCCASIONS.indexOf(prev);
        const nextIndex = (currentIndex + 1) % OCCASIONS.length;
        return OCCASIONS[nextIndex];
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotX(-y / 15);
    setRotY(x / 15);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  const currentOccasion = OCCASION_DATA[activeOccasion] || OCCASION_DATA["wedding"];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-amber-500 selection:text-white font-sans overflow-x-hidden">
      {/* Announcement Ticker Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-[#F2810C] to-amber-700 py-1.5 text-center text-[11px] font-bold tracking-wider text-white shadow-md">
        {cms?.announcementBanner || "🎉 ScanUtsav 3.0 Live: 30+ Festival Presets & Audio Voice Wishes Activated across India!"}
      </div>

      {/* 1. HERO SECTION (Pure White / Light Ivory Theme) */}
      <section className="relative px-6 py-8 lg:py-14 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-950 text-[11px] font-black tracking-widest uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F2810C]" />
            <span>{cms?.heroTagline || "Zero App Downloads • AI Moderated • Live TV Slideshow"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-slate-900 leading-tight">
            {cms?.heroTitle || "Scan Once. Relive Forever."}
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-lg leading-relaxed font-semibold">
            {cms?.heroSubtitle || "India's premier QR-based Event Memory Platform. Collect uncompressed 4K photos, HD videos, and voice wishes from every guest into a live venue TV stream."}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/dashboard/events">
              <Button variant="primary" size="md" className="shadow-md text-xs font-black px-6 py-3 bg-[#F2810C] hover:bg-[#D97706] text-white border border-[#F2810C]">
                <span>Create Your Event</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/how-it-works">
              <Button variant="outline" size="md" className="text-xs font-extrabold px-6 py-3 border-slate-300 text-slate-800 hover:bg-slate-100 bg-white shadow-sm">
                <span>See How It Works</span>
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-5 text-[11px] text-slate-700 font-bold pt-1">
            <span className="flex items-center gap-1.5 text-emerald-800"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DPDP Act Compliant</span>
            <span className="flex items-center gap-1.5 text-amber-900"><Lock className="w-3.5 h-3.5 text-amber-600" /> SSL Encrypted</span>
            <span className="flex items-center gap-1.5 text-slate-900"><Award className="w-3.5 h-3.5 text-[#F2810C]" /> Made in India</span>
          </div>

          {/* Real Platform Counters */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-700 font-display">{cms?.stats?.memoriesCaptured || "12.5M+"}</div>
              <div className="text-slate-600 text-[11px] mt-0.5 font-bold">Photos Captured</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#F2810C] font-display">{cms?.stats?.eventsHosted || "45,000+"}</div>
              <div className="text-slate-600 text-[11px] mt-0.5 font-bold">Events Hosted</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-display">{cms?.stats?.uptimePercentage || "99.99%"}</div>
              <div className="text-slate-600 text-[11px] mt-0.5 font-bold">Platform Uptime</div>
            </div>
          </div>
        </div>

        {/* 3D Tilting Event Invite Card in Light Theme */}
        <div className="lg:col-span-5 flex justify-center perspective-1000">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              transition: "transform 0.1s ease-out",
            }}
            className="w-full max-w-xs sm:max-w-sm p-6 rounded-3xl border-2 border-amber-300 shadow-2xl text-center space-y-4 bg-white cursor-pointer group"
          >
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">ROYAL WEDDING INVITATION</span>
              <h3 className="text-xl font-black text-slate-900 font-display">Ananya & Vikram</h3>
              <p className="text-[11px] text-slate-600 font-semibold">Scan to share your blessings & photos!</p>
            </div>

            <Link href="/e/demo-event" className="block relative">
              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto border-4 border-amber-400/60 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                {heroQrUrl ? (
                  <img
                    src={heroQrUrl}
                    alt="Scan to open ScanUtsav website"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="mt-1">
                  <span className="text-[9px] font-black bg-[#F2810C] text-white px-2 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
                    📷 Camera Scannable
                  </span>
                </div>
              </div>
            </Link>

            <div className="pt-2 border-t border-slate-200 text-center space-y-0.5 text-xs">
              <div className="font-bold text-amber-800 text-[11px]">The Taj Palace, Udaipur</div>
              <div className="text-[9px] text-slate-600 font-extrabold tracking-wider">
                POWERED BY <span className="text-[#F2810C] font-black">SCANUTSAV</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF VENUES TICKER */}
      <section className="py-6 bg-white border-y border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            TRUSTED BY PREMIER WEDDING PLANNERS & HOTELS ACROSS INDIA
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-slate-700 text-[11px] font-black uppercase tracking-wider opacity-90">
            <span>The Taj Palace</span>
            <span>The Leela Goa</span>
            <span>Umaid Bhawan Palace</span>
            <span>ITC Grand Bharat</span>
            <span>Lalbaug Festival Committee</span>
            <span>JW Marriott Mumbai</span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 4-STEP WORKFLOW SECTION */}
      <section className="py-12 px-6 max-w-7xl mx-auto space-y-10 text-center">
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
            SIMPLE & SEAMLESS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">How ScanUtsav Works</h2>
          <p className="text-slate-600 text-xs font-semibold">Zero app downloads required. Guests point camera, scan, and upload in under 2 seconds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-left">
          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 relative shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-lg font-black font-display">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Create Event</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">Set up your event in 60 seconds. Select from 30+ tailored Indian festival and wedding themes.</p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 relative shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-lg font-black font-display">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Print QR Standees</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">Export print-ready A4 table standees, wax-seal medallions, and WhatsApp invite graphics.</p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 relative shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800 text-lg font-black font-display">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Guests Scan & Upload</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">Guests scan with any smartphone camera and upload uncompressed 4K media and audio wishes instantly.</p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 relative shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 text-lg font-black font-display">
              04
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Live Stream & ZIP</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">Broadcast live on venue TVs with Ken-Burns transitions & download full 4K RAW ZIP archives anytime.</p>
          </div>
        </div>
      </section>

      {/* 4. AUTO-ROTATING OCCASION SHOWCASE */}
      <section className="py-12 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10 text-center">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
              TAILORED FOR INDIAN CELEBRATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">Designed for Every Occasion</h2>
          </div>

          {/* High Contrast Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {OCCASIONS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveOccasion(tab)}
                className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                  activeOccasion === tab
                    ? "bg-[#F2810C] text-white shadow-md border border-[#F2810C] scale-105"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                }`}
              >
                {OCCASION_DATA[tab]?.tag || tab}
              </button>
            ))}
          </div>

          {/* Dynamic Image & Text Display */}
          <div className="p-6 md:p-8 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-left transition-all duration-500 shadow-xl bg-white">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-snug">
                {currentOccasion.title}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                {currentOccasion.desc}
              </p>

              <ul className="space-y-1.5 text-xs text-slate-700 font-bold">
                {currentOccasion.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link href={`/solutions#${activeOccasion}`} className="inline-block">
                  <Button variant="outline" size="sm" className="px-4 py-2 text-xs font-bold shadow-sm border-slate-300 text-slate-800 bg-white hover:bg-slate-100">
                    <span>Explore Template Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-slate-100 p-2 rounded-2xl border border-amber-300 overflow-hidden shadow-xl">
              <img
                key={activeOccasion}
                src={currentOccasion.image}
                alt={currentOccasion.title}
                className="w-full h-56 sm:h-64 object-cover rounded-xl transition-all duration-700 animate-in fade-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE BENTO GRID */}
      <section className="py-12 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
            ENGINEERED EXCELLENCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">Features Built for Pure Magic</h2>
          <p className="text-slate-600 text-xs font-semibold">Everything you need to host unforgettable event albums.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 md:col-span-2 shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">Live Venue TV Slideshow Stream</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Connect any smart TV, venue screen, or projector. Approved guest photos stream live in 4K resolution with smooth Ken-Burns pan-zoom transitions, uploader name tags, and persistent QR corner target.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Printable QR Standee Studio</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Export print-ready 300 DPI vector PDF standees, table cards, Instagram stories, and WhatsApp invitation cards.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Full-Res 4K RAW ZIP Export</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              No photo compression! Download your full resolution camera captures and 60fps HD videos in one structured ZIP file.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 space-y-3 md:col-span-2 shadow-md bg-white">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">AI Moderation & Duplicate Filtering</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Real-time computer vision filters out blurry accidental shots, low-contrast photos, and duplicate captures. Hosts retain 100% control with single-tap manual approval from the Host Dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section className="py-12 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-10 text-center">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
              TRANSPARENT PLANS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">Simple, Honest Pricing</h2>
            <p className="text-slate-600 text-xs font-semibold">Pay once per event. Keep memories forever with instant GST invoices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {(cms?.pricingPlans || [
              { name: "Free Utsav", priceINR: 0, popular: false, maxStorageGB: 1, features: ["Up to 50 Guests", "Basic Gallery Wall", "Standard QR Generator", "7 Days Storage Access"] },
              { name: "Royal Utsav", priceINR: 2499, popular: true, maxStorageGB: 25, features: ["Unlimited Guests", "Live TV Slideshow Mode", "Custom QR Poster Studio", "Full HD RAW ZIP Archive", "30 Days Active Storage Access"] },
              { name: "Grand Utsav", priceINR: 6999, popular: false, maxStorageGB: 100, features: ["Unlimited Guests & Events", "AI Face Recognition Ready", "Dedicated Cloud Folder", "WhatsApp Invite Integration", "Lifetime Cloud Storage Backup"] }
            ]).map((plan: any, idx: number) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl space-y-5 relative flex flex-col justify-between border shadow-lg bg-white ${
                  plan.popular ? "border-[#F2810C] shadow-glow-marigold bg-amber-50/50" : "border-slate-200"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 font-display">{plan.name}</h3>
                    {plan.popular && (
                      <span className="px-2.5 py-0.5 bg-[#F2810C] text-white font-black text-[9px] uppercase tracking-widest rounded-full shadow-md">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-slate-900 font-display">
                    ₹{plan.priceINR.toLocaleString()}
                    <span className="text-xs font-sans text-slate-500 font-normal"> / event</span>
                  </div>
                  <div className="h-px bg-slate-200 my-3" />
                  <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                    {plan.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Link href="/register">
                    <Button variant={plan.popular ? "primary" : "outline"} size="sm" className={`w-full text-xs font-black ${plan.popular ? "bg-[#F2810C] text-white hover:bg-[#D97706]" : "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"}`}>
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="py-12 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
            HOST LOVE & STORIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">Loved by Event Hosts Across India</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="p-6 rounded-3xl border border-slate-200 space-y-3 flex flex-col justify-between shadow-md bg-white">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed font-medium">"{t.text}"</p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-amber-300" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. EXPANDED FAQ ACCORDION SECTION */}
      <section className="py-12 px-6 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
            QUESTIONS ANSWERED
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {DETAILED_FAQS.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              className="p-5 rounded-2xl border border-slate-200 cursor-pointer space-y-2 transition-all hover:border-amber-400 shadow-sm bg-white"
            >
              <div className="flex items-center justify-between font-bold text-slate-900 text-sm gap-4">
                <span>{faq.question}</span>
                <span className="text-[#F2810C] font-mono text-base flex-shrink-0">{openFaqIndex === idx ? "−" : "+"}</span>
              </div>
              {openFaqIndex === idx && (
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200 font-medium">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. BOTTOM CTA BANNER */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl border-2 border-[#F2810C] bg-[#F2810C] text-center space-y-5 shadow-2xl text-white">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-950 bg-white px-3.5 py-1 rounded-full border border-white">
            READY TO ELEVATE YOUR CELEBRATION?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display max-w-2xl mx-auto">
            Create Your Free Event Memory Album Today
          </h2>
          <p className="text-amber-50 text-xs sm:text-sm max-w-md mx-auto font-bold">
            Takes less than 60 seconds. Unlimited guest uploads with zero app downloads.
          </p>
          <div className="pt-1">
            <Link href="/register">
              <Button variant="primary" size="md" className="shadow-2xl text-xs font-black px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 border-white">
                <span>Start Free Event</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
