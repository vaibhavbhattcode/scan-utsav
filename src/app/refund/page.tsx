import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Clock, Mail, ArrowRight } from "lucide-react";

export default function RefundPage() {
  const sections = [
    {
      title: "7-Day Money-Back Guarantee",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-300",
      content: [
        "ScanUtsav offers a full 100% refund within 7 days of purchase for any paid plan (Royal Utsav or Grand Enterprise) if you are unsatisfied for any reason.",
        "No questions asked. Simply email concierge@scanutsav.com with your Order ID and registered email address.",
        "Refunds are processed within 5–7 business days to the original payment method (credit card, debit card, or UPI).",
      ],
    },
    {
      title: "Refund Eligibility",
      icon: CheckCircle2,
      iconColor: "text-blue-600",
      bg: "bg-blue-50 border-blue-300",
      content: [
        "Refund request submitted within 7 days of the original purchase date.",
        "Applies to Royal Utsav (₹2,499) and Grand Enterprise (₹6,999) plans.",
        "Event album has not been used to actively collect more than 50 media uploads (trial usage is fine).",
        "Gift pass purchases are eligible for refund only if the recipient has not redeemed the code.",
      ],
    },
    {
      title: "Non-Refundable Cases",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bg: "bg-amber-50 border-amber-300",
      content: [
        "Refund requests submitted after 7 days from the original purchase date.",
        "Events with more than 50 successful media uploads (indicating active use).",
        "Gift pass codes that have been redeemed by the recipient.",
        "Add-on services (custom QR design, standee printing) once production has started.",
      ],
    },
  ];

  const process = [
    { step: "01", title: "Email Us", desc: "Send your refund request to concierge@scanutsav.com with subject 'Refund Request — [Your Order ID]'.", icon: Mail },
    { step: "02", title: "Review (24hrs)", desc: "Our team reviews your request within 24 business hours and confirms eligibility.", icon: Clock },
    { step: "03", title: "Refund Processed", desc: "Approved refunds are processed within 5–7 business days to your original payment method.", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-14 px-6 text-center space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-amber-900 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">
            Legal & Policies
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Refund & <span className="text-[#F2810C]">Cancellation Policy</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium">Last updated: July 1, 2026 · Effective immediately</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Quick Summary Banner */}
        <div className="bg-emerald-600 rounded-3xl p-6 text-white text-center space-y-2 shadow-xl">
          <div className="text-3xl font-black">✅ 7-Day Money-Back Guarantee</div>
          <p className="text-emerald-50 text-sm font-medium">Not happy? Email us within 7 days for a full refund — no questions asked.</p>
        </div>

        {/* Policy Sections */}
        {sections.map(({ title, icon: Icon, iconColor, bg, content }) => (
          <div key={title} className={`rounded-3xl border p-6 md:p-8 space-y-4 ${bg}`}>
            <div className="flex items-center gap-3">
              <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
              <h2 className="text-xl font-black text-slate-900 font-display">{title}</h2>
            </div>
            <ul className="space-y-2.5">
              {content.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium leading-relaxed">
                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white border border-slate-200 text-[10px] font-black text-slate-600 flex items-center justify-center mt-0.5">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Refund Process Steps */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <h2 className="text-xl font-black text-slate-900 font-display text-center">How to Request a Refund</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {process.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#F2810C] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                  {step}
                </div>
                <h3 className="font-black text-slate-900 text-sm font-display">{title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
          <h2 className="text-xl font-black text-slate-900 font-display">Cancellation Policy</h2>
          <div className="space-y-3 text-sm text-slate-700 font-medium leading-relaxed">
            <p>You may cancel your ScanUtsav subscription at any time from your Host Dashboard → Billing → Cancel Plan.</p>
            <p>Upon cancellation, your plan remains active until the end of the current billing period. No pro-rated refunds are issued for partial billing periods beyond the 7-day guarantee window.</p>
            <p>Your event data and media archives are preserved for 30 days after cancellation, giving you time to download your full event archive.</p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-[#F2810C] rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-xl font-black text-white font-display">Need a Refund?</h3>
          <p className="text-amber-50 text-sm font-medium">Email us within 7 days and we'll process your full refund immediately.</p>
          <a href="mailto:concierge@scanutsav.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-slate-900 font-black text-sm rounded-xl shadow-md transition-all">
            <Mail className="w-4 h-4 text-[#F2810C]" /> concierge@scanutsav.com
          </a>
        </div>
      </div>
    </div>
  );
}
