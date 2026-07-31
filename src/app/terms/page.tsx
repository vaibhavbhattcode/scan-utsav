import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using ScanUtsav (\"Service\"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the Service. ScanUtsav reserves the right to update these terms at any time, with changes effective immediately upon posting.",
    },
    {
      title: "2. Description of Service",
      content: "ScanUtsav is an event memory collection platform that allows event hosts to create QR-code-based photo and video upload portals for their guests. The Service includes event management, media storage, live TV slideshow, AI face recognition, and QR code generation features.",
    },
    {
      title: "3. User Accounts & Registration",
      content: [
        "You must be 18 years or older to create a host account.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You agree to provide accurate, current, and complete information during registration.",
        "One person or entity may not maintain more than one free account.",
        "ScanUtsav reserves the right to suspend or terminate accounts that violate these terms.",
      ],
    },
    {
      title: "4. Host Responsibilities",
      content: [
        "Event hosts are responsible for ensuring guest DPDP Act 2023 consent is collected before uploading begins.",
        "Hosts must not create events for illegal purposes or to collect media without participants' knowledge.",
        "Hosts are responsible for moderating their event galleries and removing inappropriate content.",
        "Hosts must not share event access codes with unauthorized individuals for events they do not own.",
        "Hosts agree not to use our platform to collect data for commercial resale or profiling.",
      ],
    },
    {
      title: "5. Prohibited Content",
      content: [
        "Sexually explicit, violent, or harmful content.",
        "Content that violates the privacy, copyright, or personal rights of individuals.",
        "Spam, phishing, or fraudulent content.",
        "Content that promotes hatred, discrimination, or illegal activities.",
        "Malware, viruses, or any code designed to damage or disrupt our systems.",
      ],
    },
    {
      title: "6. Intellectual Property",
      content: "All media uploaded by guests remains the intellectual property of the original uploader. ScanUtsav does not claim ownership of any user-uploaded content. By uploading content, users grant ScanUtsav a limited, non-exclusive license to store, process, and display the content solely for the purpose of providing the Service to the relevant event host.",
    },
    {
      title: "7. Payment & Billing",
      content: [
        "Paid plans (Royal Utsav ₹2,499, Grand Enterprise ₹6,999) are billed at the time of purchase.",
        "All payments are processed via Razorpay in Indian Rupees (INR).",
        "Prices are inclusive of GST at 18% where applicable.",
        "Refunds are subject to our Refund & Cancellation Policy (7-day money-back guarantee).",
        "ScanUtsav reserves the right to change pricing with 30-day notice to existing subscribers.",
      ],
    },
    {
      title: "8. Data Privacy",
      content: "ScanUtsav collects and processes personal data in accordance with India's Digital Personal Data Protection (DPDP) Act 2023. All data is encrypted in transit and at rest. We do not sell, trade, or share personal data with third parties except as required by law. Please review our Privacy Policy for complete details.",
    },
    {
      title: "9. Limitation of Liability",
      content: "ScanUtsav's total liability to you for any claims arising out of or related to the Service shall not exceed the amount you paid for the Service in the 12 months preceding the claim. We are not liable for indirect, incidental, special, or consequential damages, including loss of data, business opportunities, or revenue.",
    },
    {
      title: "10. Governing Law & Dispute Resolution",
      content: "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall first be attempted to be resolved through informal negotiation. Unresolved disputes shall be submitted to binding arbitration under the Indian Arbitration and Conciliation Act, with proceedings conducted in Mumbai, Maharashtra.",
    },
    {
      title: "11. Contact Information",
      content: "For questions about these Terms of Service, please contact: ScanUtsav EventTech Solutions Private Limited, Mumbai & Bengaluru, India. Email: legal@scanutsav.com | GSTIN: 27AAAAA0000A1Z5",
    },
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
            Terms of <span className="text-[#F2810C]">Service</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium">Last updated: July 1, 2026 · Effective immediately</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-2">
        {/* Quick nav */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-8">
          <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-3">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <span key={s.title} className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
                {s.title.split(".")[0] + ". " + s.title.split(". ")[1]?.split(" ").slice(0, 2).join(" ")}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-base font-black text-slate-900 font-display">{section.title}</h2>
            {Array.isArray(section.content) ? (
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F2810C] flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{section.content}</p>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="bg-[#F2810C] rounded-3xl p-8 text-center space-y-4 shadow-xl mt-8">
          <h3 className="text-xl font-black text-white font-display">Have Legal Questions?</h3>
          <a href="mailto:legal@scanutsav.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-slate-900 font-black text-sm rounded-xl shadow-md transition-all">
            <Mail className="w-4 h-4 text-[#F2810C]" /> legal@scanutsav.com
          </a>
        </div>
      </div>
    </div>
  );
}
