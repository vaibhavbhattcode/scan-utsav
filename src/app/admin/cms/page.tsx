"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, Layout, MessageSquare, HelpCircle, Palette, Check, DollarSign, Cloud, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function AdminCMSPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"hero" | "pricing" | "testimonials" | "faq" | "themes">("hero");
  const [saving, setSaving] = useState(false);

  const [cmsData, setCmsData] = useState({
    heroTitle: "Scan Once. Relive Forever.",
    heroSubtitle: "India's most premium QR-based Event Memory Platform. Collect uncompressed 4K photos, HD videos, and audio wishes from every guest in real-time.",
    heroTagline: "Zero Downloads Needed • AI Moderated • Live TV Slideshow",
    announcementBanner: "🎉 ScanUtsav 3.0 Live: 30+ Festival Templates & Audio Wishes Activated!",
    pricingPlans: [
      { name: "Free Utsav", priceINR: 0, popular: false, maxStorageGB: 1, googleDriveEnabled: false, features: ["Up to 50 Guests", "Basic Gallery Wall", "Standard QR Generator", "7 Days Storage Access"] },
      { name: "Royal Utsav", priceINR: 2499, popular: true, maxStorageGB: 25, googleDriveEnabled: true, features: ["Unlimited Guests", "Live TV Slideshow Mode", "Custom QR Poster Studio", "Full HD RAW ZIP Archive", "Google Drive Export", "30 Days Active Storage Access"] },
      { name: "Grand Utsav", priceINR: 6999, popular: false, maxStorageGB: 100, googleDriveEnabled: true, features: ["Unlimited Guests & Events", "AI Face Recognition Ready", "Dedicated Cloud Folder", "Google Drive Auto-Sync", "WhatsApp Invite Integration", "Lifetime Cloud Storage Backup"] }
    ],
    themeOverrides: {
      ink: "#14100D",
      marigold: "#F2810C",
      maroon: "#7A1E2B",
      gold: "#C9A24B",
      cream: "#F5EDE0",
      emerald: "#1F8A6F",
    },
    faqItems: [
      { question: "Do guests need to download an app?", answer: "No! Guests simply scan the QR code with their camera." }
    ],
    testimonials: [
      { name: "Ananya & Vikram Sethi", role: "Wedding Hosts", quote: "ScanUtsav made our wedding unforgettable!", avatar: "", eventTypeTag: "Wedding" }
    ]
  });

  useEffect(() => {
    fetch("/api/admin/cms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.cms) {
          setCmsData((prev) => ({ ...prev, ...data.cms }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveCMS = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("CMS content and pricing plans saved and published live! 🎉", "success");
      } else {
        showToast(data.error || "Failed to publish CMS updates", "error");
      }
    } catch (err) {
      showToast("Network error saving CMS", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-marigold-400">ADMIN CONTROL ENGINE</span>
            <h1 className="text-3xl font-black text-white font-display">Dynamic CMS & Pricing Plan Desk</h1>
          </div>
        </div>

        <Button variant="gold" size="lg" onClick={handleSaveCMS} disabled={saving} className="shadow-glow-gold text-xs font-bold">
          <Save className="w-4 h-4 text-ink-950" />
          <span>{saving ? "Publishing..." : "Save & Publish Site"}</span>
        </Button>
      </div>

      {/* Editor Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "hero" ? "bg-marigold-500 text-ink-950 shadow-glow-marigold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Layout className="w-4 h-4" /> Hero & Banners
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "pricing" ? "bg-marigold-500 text-ink-950 shadow-glow-marigold" : "text-slate-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Pricing & Google Drive Access
        </button>

        <button
          onClick={() => setActiveTab("testimonials")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "testimonials" ? "bg-marigold-500 text-ink-950 shadow-glow-marigold" : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Testimonials
        </button>

        <button
          onClick={() => setActiveTab("themes")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "themes" ? "bg-marigold-500 text-ink-950 shadow-glow-marigold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Palette className="w-4 h-4" /> Theme Tokens
        </button>
      </div>

      {/* Editor Tab 1: Hero & Banner */}
      {activeTab === "hero" && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 bg-[#14100D]/90 backdrop-blur-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Announcement Ticker Banner</label>
            <input
              type="text"
              value={cmsData.announcementBanner}
              onChange={(e) => setCmsData({ ...cmsData, announcementBanner: e.target.value })}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Hero Main Title (Display Font)</label>
            <input
              type="text"
              value={cmsData.heroTitle}
              onChange={(e) => setCmsData({ ...cmsData, heroTitle: e.target.value })}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-display"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Hero Subtitle / Description</label>
            <textarea
              rows={3}
              value={cmsData.heroSubtitle}
              onChange={(e) => setCmsData({ ...cmsData, heroSubtitle: e.target.value })}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Hero Micro Tagline</label>
            <input
              type="text"
              value={cmsData.heroTagline}
              onChange={(e) => setCmsData({ ...cmsData, heroTagline: e.target.value })}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>
        </div>
      )}

      {/* Editor Tab 2: Pricing & Google Drive Plan Controls */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#14100D]/90 space-y-4">
            <h3 className="font-bold text-white text-base font-display">Manage Subscription Plans & Google Drive Integration</h3>
            <p className="text-xs text-slate-300">Set prices in INR, storage limits, and toggle feature permissions live across the website.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cmsData.pricingPlans.map((plan, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-[#14100D]/90">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Plan Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => {
                      const copy = [...cmsData.pricingPlans];
                      copy[idx].name = e.target.value;
                      setCmsData({ ...cmsData, pricingPlans: copy });
                    }}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Price (₹ INR)</label>
                    <input
                      type="number"
                      value={plan.priceINR}
                      onChange={(e) => {
                        const copy = [...cmsData.pricingPlans];
                        copy[idx].priceINR = Number(e.target.value);
                        setCmsData({ ...cmsData, pricingPlans: copy });
                      }}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Storage (GB)</label>
                    <input
                      type="number"
                      value={plan.maxStorageGB}
                      onChange={(e) => {
                        const copy = [...cmsData.pricingPlans];
                        copy[idx].maxStorageGB = Number(e.target.value);
                        setCmsData({ ...cmsData, pricingPlans: copy });
                      }}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.googleDriveEnabled || false}
                      onChange={(e) => {
                        const copy = [...cmsData.pricingPlans];
                        copy[idx].googleDriveEnabled = e.target.checked;
                        setCmsData({ ...cmsData, pricingPlans: copy });
                      }}
                      className="rounded border-white/20 text-marigold-500"
                    />
                    <span className="font-bold flex items-center gap-1"><Cloud className="w-3.5 h-3.5 text-blue-400" /> Google Drive Export Access</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Tab 3: Testimonials */}
      {activeTab === "testimonials" && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 bg-[#14100D]/90">
          <h3 className="font-bold text-white text-base">Customer Testimonials</h3>
          {cmsData.testimonials.map((t, idx) => (
            <div key={idx} className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => {
                      const copy = [...cmsData.testimonials];
                      copy[idx].name = e.target.value;
                      setCmsData({ ...cmsData, testimonials: copy });
                    }}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role / Location</label>
                  <input
                    type="text"
                    value={t.role}
                    onChange={(e) => {
                      const copy = [...cmsData.testimonials];
                      copy[idx].role = e.target.value;
                      setCmsData({ ...cmsData, testimonials: copy });
                    }}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Quote</label>
                <textarea
                  rows={2}
                  value={t.quote}
                  onChange={(e) => {
                    const copy = [...cmsData.testimonials];
                    copy[idx].quote = e.target.value;
                    setCmsData({ ...cmsData, testimonials: copy });
                  }}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Tab 4: Theme Overrides */}
      {activeTab === "themes" && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 bg-[#14100D]/90">
          <h3 className="font-bold text-white text-base">Indian Celebration Token Overrides</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ink (Base Dark)</label>
              <input
                type="color"
                value={cmsData.themeOverrides?.ink || "#14100D"}
                onChange={(e) => setCmsData({
                  ...cmsData,
                  themeOverrides: { ...cmsData.themeOverrides, ink: e.target.value }
                })}
                className="w-full h-10 rounded-xl bg-slate-900 border border-white/15 cursor-pointer p-1"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Marigold (Warm Accent)</label>
              <input
                type="color"
                value={cmsData.themeOverrides?.marigold || "#F2810C"}
                onChange={(e) => setCmsData({
                  ...cmsData,
                  themeOverrides: { ...cmsData.themeOverrides, marigold: e.target.value }
                })}
                className="w-full h-10 rounded-xl bg-slate-900 border border-white/15 cursor-pointer p-1"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Deep Maroon (Wedding Accent)</label>
              <input
                type="color"
                value={cmsData.themeOverrides?.maroon || "#7A1E2B"}
                onChange={(e) => setCmsData({
                  ...cmsData,
                  themeOverrides: { ...cmsData.themeOverrides, maroon: e.target.value }
                })}
                className="w-full h-10 rounded-xl bg-slate-900 border border-white/15 cursor-pointer p-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
