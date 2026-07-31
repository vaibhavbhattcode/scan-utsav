"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Check, Building2, Camera, Briefcase } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("host");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast("Please fill out all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });
      if (res.ok) {
        showToast("Inquiry submitted! Our team will contact you within 2 hours 🎉", "success");
        setName(""); setEmail(""); setMessage("");
      } else {
        showToast("Failed to submit message", "error");
      }
    } catch {
      showToast("Network error submitting form", "error");
    } finally {
      setLoading(false);
    }
  };

  const INQUIRY_TYPES = [
    { key: "host", label: "Event Host", icon: "🎪", activeColor: "border-[#F2810C] bg-amber-50 text-amber-900" },
    { key: "planner", label: "Wedding Planner", icon: "💍", activeColor: "border-rose-500 bg-rose-50 text-rose-900" },
    { key: "hotel", label: "Hotel / Banquet", icon: "🏨", activeColor: "border-emerald-500 bg-emerald-50 text-emerald-900" },
    { key: "photographer", label: "Photographer", icon: "📷", activeColor: "border-purple-500 bg-purple-50 text-purple-900" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 py-14 px-6 text-center space-y-5">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-amber-900 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">
            Executive Support & Partnerships
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            We'd Love to <span className="text-[#F2810C]">Hear From You</span>
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto font-medium">
            Whether you are an event host, wedding planner, hotel manager, or photographer, our team is ready 24/7.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Info Sidebar */}
          <div className="md:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 space-y-6">
              <h3 className="text-lg font-black text-slate-900 font-display">Contact Direct Desk</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "concierge@scanutsav.com", color: "text-[#F2810C]" },
                  { icon: Phone, label: "+91 98765 43210", color: "text-emerald-600" },
                  { icon: MapPin, label: "Mumbai & Bengaluru, India", color: "text-blue-600" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className={`w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time Card */}
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 space-y-2">
              <div className="text-2xl font-black text-slate-900">⚡ 2 hrs</div>
              <div className="text-xs font-black text-amber-900 uppercase tracking-wider">Average Response Time</div>
              <p className="text-xs text-slate-700 font-medium">Our team responds to all inquiries within 2 working hours, 7 days a week.</p>
            </div>

            {/* Trust Badges */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
              <div className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Trusted By</div>
              {["500+ Event Hosts", "50+ Wedding Planners", "20+ Hotels & Banquets"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-black text-slate-900 font-display">Send Us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Inquiry Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Inquiry Type</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {INQUIRY_TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setCategory(t.key)}
                      className={`p-3 rounded-xl border font-bold transition-all text-left flex items-center gap-2 ${
                        category === t.key
                          ? t.activeColor
                          : "border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Event Requirements *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your upcoming event or partnership..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-8 bg-[#F2810C] hover:bg-[#D97706] disabled:opacity-70 text-white font-black text-sm rounded-xl shadow-md border border-[#F2810C] flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                {loading ? "Submitting Inquiry..." : "Submit Message 🎉"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
