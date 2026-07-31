import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { QrCode, Tv, Sparkles, ShieldCheck, Download, Layers, Camera, Flame, Zap, Mic, Printer, WifiOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Complete Feature Matrix | ScanUtsav QR Event Platform",
  description: "Explore all the features built into ScanUtsav: QR studio, live TV slideshow mode, AI photo moderation, 4K RAW ZIP downloads, voice wishes, and printable standees.",
};

export default function FeaturesPage() {
  const features = [
    {
      icon: QrCode,
      title: "Dynamic QR Generator Studio",
      desc: "Generate custom QR codes tailored to your event theme. Choose from custom color schemes, wax-seal monogram badges, and export vector PDF posters ready for professional print shops.",
      tag: "BRANDING & QR",
      color: "text-[#F2810C] bg-amber-100 border-amber-300"
    },
    {
      icon: Tv,
      title: "Live Venue TV Slideshow Stream",
      desc: "Transform any venue TV, LED wall, or projector into an interactive live slideshow. Approved guest uploads stream live in 4K resolution with smooth Ken-Burns pan-zoom animations.",
      tag: "BROADCAST",
      color: "text-amber-800 bg-amber-100 border-amber-300"
    },
    {
      icon: Sparkles,
      title: "AI Moderation & Quality Filter",
      desc: "Our computer vision AI checks incoming uploads in real time. It automatically flags duplicate captures, low-contrast blur, or accidental screenshots so your album remains pristine.",
      tag: "AI VISION",
      color: "text-rose-800 bg-rose-100 border-rose-300"
    },
    {
      icon: Download,
      title: "Full-Resolution 4K RAW ZIP Archive",
      desc: "No image compression! Download all guest photos and 60fps HD videos in original camera quality (RAW/PNG/4K) with organized date & folder structures in a single click.",
      tag: "EXPORTS",
      color: "text-emerald-800 bg-emerald-100 border-emerald-300"
    },
    {
      icon: Mic,
      title: "Audio Voice Wishes & Guestbook",
      desc: "Guests can record high-quality 30-second audio voice blessings directly through their smartphone browser, creating a digital voice guestbook for hosts.",
      tag: "GUEST VOICES",
      color: "text-amber-900 bg-amber-100 border-amber-300"
    },
    {
      icon: Printer,
      title: "Print-Ready QR Standee Studio",
      desc: "Export A4 framed posters (300 DPI), table cards, Instagram story graphics, and WhatsApp invitation cards custom-generated for your event.",
      tag: "PRINT MARKETING",
      color: "text-purple-800 bg-purple-100 border-purple-300"
    },
    {
      icon: WifiOff,
      title: "Offline Sync & Offline Queueing",
      desc: "If venue cell signal is weak, guest uploads automatically queue safely in local browser memory and stream as soon as cellular data or Wi-Fi reconnects.",
      tag: "RELIABILITY",
      color: "text-cyan-800 bg-cyan-100 border-cyan-300"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Invite Integration",
      desc: "Share your event QR code & memory upload link directly to guest WhatsApp groups with rich open-graph thumbnail previews.",
      tag: "GROWTH",
      color: "text-emerald-800 bg-emerald-100 border-emerald-300"
    }
  ];

  const comparisonRows = [
    { feature: "Zero App Download Needed", scanutsav: "✅ Yes (Instant Web)", drive: "❌ No (Needs Google Login)", whatsapp: "❌ Compression & Clutter" },
    { feature: "Live Venue TV Slideshow Mode", scanutsav: "✅ Instant 4K Sync", drive: "❌ Manual Slideshow Only", whatsapp: "❌ Not Available" },
    { feature: "Full 4K Uncompressed ZIP Archive", scanutsav: "✅ Single-Click ZIP", drive: "⚠️ Slow Multi-Part", whatsapp: "❌ Highly Compressed" },
    { feature: "Print-Ready QR Standee Studio", scanutsav: "✅ Built-in 300 DPI", drive: "❌ None", whatsapp: "❌ None" },
    { feature: "AI Duplicate & Blur Moderation", scanutsav: "✅ Real-Time Vision", drive: "❌ Manual Review Only", whatsapp: "❌ None" },
    { feature: "Voice Blessing Audio Notes", scanutsav: "✅ Built-in Player", drive: "❌ Audio Files Only", whatsapp: "⚠️ Unorganized Voice Notes" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8 space-y-12 font-sans bg-[#FAF9F6] text-slate-900">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-950 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
          Complete Feature Matrix
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
          Engineered for <span className="text-[#F2810C]">Pure Celebration Magic</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          Discover all 8 core systems built into ScanUtsav to capture, curate, and broadcast guest memories.
        </p>
      </div>

      {/* Feature Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-8 rounded-3xl space-y-4 border border-slate-200 bg-white shadow-md relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-medium">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Comparison Table vs Competitors */}
      <div className="space-y-8 max-w-5xl mx-auto pt-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            WHY HOSTS CHOOSE SCANUTSAV
          </span>
          <h2 className="text-3xl font-black text-slate-900 font-display">ScanUtsav vs Traditional Alternatives</h2>
        </div>

        <div className="p-2 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-900 font-black uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4 sm:p-5">Feature Capability</th>
                <th className="p-4 sm:p-5 text-[#F2810C]">ScanUtsav</th>
                <th className="p-4 sm:p-5 text-slate-600">Google Drive / Photos</th>
                <th className="p-4 sm:p-5 text-slate-600">WhatsApp Group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{row.feature}</td>
                  <td className="p-4 sm:p-5 font-black text-emerald-700 bg-amber-50/50">{row.scanutsav}</td>
                  <td className="p-4 sm:p-5">{row.drive}</td>
                  <td className="p-4 sm:p-5">{row.whatsapp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl text-center space-y-6 border-2 border-[#F2810C] bg-[#F2810C] text-white shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">Ready to see it in action?</h2>
          <p className="text-amber-50 text-sm sm:text-base max-w-md mx-auto font-bold">Create a free test event in under 60 seconds.</p>
        </div>
        <div className="pt-2">
          <Link href="/register" className="inline-block">
            <Button variant="primary" size="lg" className="px-8 py-3.5 shadow-2xl text-sm font-black bg-white text-slate-900 hover:bg-slate-100 border-white">
              Create Free Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
