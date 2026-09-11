import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { QrCode, Tv, Sparkles, ShieldCheck, Download, Layers, Camera, Flame, Zap, Mic, Printer, WifiOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Complete Feature Matrix | ScanUtsav QR Event Platform",
  description: "Explore all the features built into ScanUtsav: QR event generation, live TV slideshow mode, AI face recognition, high-quality ZIP downloads, and host moderation dashboard.",
};

export default function FeaturesPage() {
  const features = [
    {
      icon: QrCode,
      title: "Instant QR Generator",
      desc: "Generate a custom QR code tailored to your event. Simply download it and print it for table standees or venue display.",
      tag: "BRANDING & QR",
      color: "text-[#F2810C] bg-amber-100 border-amber-300"
    },
    {
      icon: Tv,
      title: "Live Venue TV Slideshow Stream",
      desc: "Transform any venue TV, LED wall, or projector into an interactive live slideshow. Approved guest uploads stream live in real-time.",
      tag: "BROADCAST",
      color: "text-amber-800 bg-amber-100 border-amber-300"
    },
    {
      icon: Sparkles,
      title: "AI Face Recognition Search",
      desc: "Our computer vision AI helps guests find their own photos instantly. They just upload a selfie and the AI fetches all matched photos.",
      tag: "AI VISION",
      color: "text-rose-800 bg-rose-100 border-rose-300"
    },
    {
      icon: Download,
      title: "High-Quality ZIP Archive",
      desc: "Download all guest photos and videos in high quality with a single click from the host dashboard.",
      tag: "EXPORTS",
      color: "text-emerald-800 bg-emerald-100 border-emerald-300"
    },
    {
      icon: ShieldCheck,
      title: "Manual Host Moderation",
      desc: "Hosts have full control over what appears on the public live TV stream. Auto-approve all uploads, or manually moderate them.",
      tag: "SECURITY",
      color: "text-amber-900 bg-amber-100 border-amber-300"
    },
    {
      icon: Printer,
      title: "GST Invoice Generation",
      desc: "Perfect for corporate clients and large weddings. Instantly generate a printable 18% GST invoice for your plan purchase.",
      tag: "BILLING",
      color: "text-purple-800 bg-purple-100 border-purple-300"
    },
    {
      icon: Layers,
      title: "Zero-App Web Portals",
      desc: "Guests don't need to download any app. They just scan the QR code and instantly upload photos from their mobile browser.",
      tag: "USER EXPERIENCE",
      color: "text-cyan-800 bg-cyan-100 border-cyan-300"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Easy Sharing",
      desc: "Share your event memory upload link directly to guest WhatsApp groups so remote guests can also upload photos.",
      tag: "GROWTH",
      color: "text-emerald-800 bg-emerald-100 border-emerald-300"
    }
  ];

  const comparisonRows = [
    { feature: "Zero App Download Needed", scanutsav: "✅ Yes (Instant Web)", drive: "❌ No (Needs Google Login)", whatsapp: "❌ Compression & Clutter" },
    { feature: "Live Venue TV Slideshow Mode", scanutsav: "✅ Instant Live Sync", drive: "❌ Manual Slideshow Only", whatsapp: "❌ Not Available" },
    { feature: "High Quality ZIP Archive", scanutsav: "✅ Single-Click ZIP", drive: "⚠️ Slow Multi-Part", whatsapp: "❌ Highly Compressed" },
    { feature: "Instant Event QR Code", scanutsav: "✅ Downloadable", drive: "❌ None", whatsapp: "❌ None" },
    { feature: "AI Face Recognition Search", scanutsav: "✅ Find yourself instantly", drive: "❌ Manual Search", whatsapp: "❌ None" },
    { feature: "Host Moderation Dashboard", scanutsav: "✅ Approve/Reject Uploads", drive: "❌ Open Folder", whatsapp: "❌ Anyone can post" },
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
