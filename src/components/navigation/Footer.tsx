"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Instagram, Twitter, Linkedin, Youtube, ShieldCheck, Mail, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export const Footer = () => {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    showToast("Subscribed! We'll send you event tech guides & festival presets.", "success");
    setNewsletterEmail("");
  };

  // Suppress Footer on Live TV Slideshow pages to avoid visual clutter
  if (pathname && pathname.includes("/slideshow")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-12 text-slate-600 text-sm relative overflow-hidden print:hidden font-sans">
      {/* Radial Background Accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
        {/* Newsletter Section Header Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/70 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/5">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              JOIN THE SCANUTSAV JOURNAL
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Get Festival Presets & Event Tech Guides
            </h3>
            <p className="text-xs text-slate-600 max-w-md font-medium">
              Receive wedding planning checklists, regional festival templates, and live event setup guides directly in your inbox.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 w-full md:w-auto max-w-md">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md flex-shrink-0 transition-all border border-[#F2810C]"
            >
              <span>Subscribe</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Column 1: Text Brand Only */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-black tracking-tight text-slate-900 font-sans">
                Scan<span className="text-[#F2810C]">Utsav</span>
              </span>
            </Link>
            <p className="text-slate-600 max-w-sm leading-relaxed text-xs font-medium">
              Scan Once. Relive Forever. India's premier QR-based Event Memory Platform designed for Weddings, Corporate Expos, Regional Festivals & Private Celebrations.
            </p>
            <div className="flex items-center gap-3 text-slate-600 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-[#F2810C] transition-colors border border-slate-200" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-[#F2810C] transition-colors border border-slate-200" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-[#F2810C] transition-colors border border-slate-200" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-[#F2810C] transition-colors border border-slate-200" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-300 flex items-center gap-1.5 text-xs font-bold px-3">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm font-display">Solutions</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/solutions#wedding" className="hover:text-[#F2810C] transition-colors">Weddings & Sangeet</Link></li>
              <li><Link href="/solutions#ganesh" className="hover:text-[#F2810C] transition-colors">Ganesh Chaturthi Pandals</Link></li>
              <li><Link href="/solutions#navratri" className="hover:text-[#F2810C] transition-colors">Navratri Garba Nights</Link></li>
              <li><Link href="/solutions#corporate" className="hover:text-[#F2810C] transition-colors">Corporate Summits</Link></li>
              <li><Link href="/solutions#birthday" className="hover:text-[#F2810C] transition-colors">Birthdays & Anniversaries</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm font-display">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/features" className="hover:text-[#F2810C] transition-colors">QR Studio & Standees</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#F2810C] transition-colors">Live TV Slideshow</Link></li>
              <li><Link href="/pricing" className="hover:text-[#F2810C] transition-colors">Pricing & GST Billing</Link></li>
              <li><Link href="/gallery" className="hover:text-[#F2810C] transition-colors">Public Showcase</Link></li>
              <li><Link href="/faq" className="hover:text-[#F2810C] transition-colors">FAQ & Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Company */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm font-display">Company & Legal</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/about" className="hover:text-[#F2810C] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#F2810C] transition-colors">Contact Support</Link></li>
              <li><Link href="/gift" className="hover:text-[#F2810C] transition-colors">Gift an Event</Link></li>
              <li><Link href="/privacy" className="hover:text-[#F2810C] transition-colors">DPDP & Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#F2810C] transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-[#F2810C] transition-colors">Refund & Cancellation</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} ScanUtsav Technologies Pvt Ltd. Made with <Heart className="w-3.5 h-3.5 inline text-rose-600 fill-rose-600" /> in India.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-800 font-bold"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DPDP Act 2023 Compliant</span>
            <span>99.99% Cloud Uptime</span>
            <span>GSTIN: 27AAAAA0000A1Z5</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
