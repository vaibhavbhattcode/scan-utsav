import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Eye, Database, Users, Globe, AlertTriangle } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "1. What Data We Collect",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      items: [
        "Host accounts: Name, email address, mobile number, event details, and payment information.",
        "Guest uploads: Photos, videos, and optional wish messages uploaded to event galleries.",
        "Usage data: IP address, device type, browser, and pages visited (for security and analytics).",
        "Event metadata: Upload timestamps, file sizes, and media types for gallery management.",
        "DPDP Consent records: Timestamp and consent status for each guest upload session.",
      ],
    },
    {
      icon: Eye,
      title: "2. How We Use Your Data",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      items: [
        "To provide and improve the ScanUtsav event memory collection service.",
        "To process payments and generate GST-compliant invoices.",
        "To send transactional emails (payment confirmations, event summaries).",
        "To moderate event galleries for prohibited content.",
        "To comply with legal obligations under Indian law, including the DPDP Act 2023.",
        "We do NOT use your data for advertising profiling or sell it to third parties.",
      ],
    },
    {
      icon: Users,
      title: "3. Data Sharing & Third Parties",
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
      items: [
        "Razorpay: Payment processing (PCI-DSS compliant). We share only transaction data.",
        "AWS S3 / Cloudflare R2: Encrypted media storage. Your files are stored in India-region servers.",
        "Resend / SendGrid: Transactional email delivery only.",
        "We do not share, sell, or rent your personal data to any marketing agencies or data brokers.",
        "We may disclose data to law enforcement agencies only when required by Indian courts or CERT-In.",
      ],
    },
    {
      icon: Lock,
      title: "4. Data Security",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      items: [
        "All media uploads use SSL/TLS encryption in transit (HTTPS only).",
        "Media files are stored with AES-256 encryption at rest.",
        "Passwords are hashed using bcrypt with salting — we never store plain-text passwords.",
        "JWT access tokens expire every 15 minutes; refresh tokens every 7 days.",
        "IP-based rate limiting prevents brute force and spam attacks.",
        "Regular security audits and penetration testing by third-party vendors.",
      ],
    },
    {
      icon: Globe,
      title: "5. DPDP Act 2023 Compliance",
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
      items: [
        "ScanUtsav complies fully with India's Digital Personal Data Protection (DPDP) Act 2023.",
        "A mandatory consent checkbox is displayed to all guests before any upload is permitted.",
        "Consent is recorded with timestamp and IP address for audit purposes.",
        "Guests may request deletion of their uploaded content by emailing privacy@scanutsav.com.",
        "Data Principal rights (access, correction, erasure, nomination) are honored within 72 hours.",
        "Our Data Protection Officer can be reached at dpo@scanutsav.com.",
      ],
    },
    {
      icon: Database,
      title: "6. Data Retention",
      color: "text-slate-600",
      bg: "bg-slate-50 border-slate-200",
      items: [
        "Free plan: Event data retained for 30 days after event end date.",
        "Royal Utsav: Event data retained for 1 year.",
        "Grand Enterprise: Lifetime data retention.",
        "After retention period, all event media and metadata are permanently deleted.",
        "Account data (email, name) retained for 5 years for GST compliance.",
        "You may request early deletion of your data by contacting privacy@scanutsav.com.",
      ],
    },
    {
      icon: AlertTriangle,
      title: "7. Cookies & Tracking",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      items: [
        "We use essential cookies for session management and CSRF protection only.",
        "We use analytics cookies (privacy-preserving) to understand platform usage patterns.",
        "We do NOT use third-party advertising or tracking cookies.",
        "You may disable non-essential cookies via your browser settings.",
      ],
    },
    {
      icon: Mail,
      title: "8. Contact & Data Requests",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      items: [
        "Privacy inquiries: privacy@scanutsav.com",
        "Data erasure requests: privacy@scanutsav.com (processed within 72 hours)",
        "Data Protection Officer: dpo@scanutsav.com",
        "Legal requests: legal@scanutsav.com",
        "Registered address: ScanUtsav EventTech Solutions Pvt. Ltd., Mumbai, Maharashtra — 400001",
      ],
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
            Privacy <span className="text-[#F2810C]">Policy</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium">Last updated: July 1, 2026 · DPDP Act 2023 Compliant</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-5">
        {/* DPDP Badge */}
        <div className="bg-emerald-600 rounded-2xl p-5 text-white flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 flex-shrink-0 text-emerald-200" />
          <div>
            <div className="font-black text-base">DPDP Act 2023 Compliant</div>
            <p className="text-emerald-100 text-xs font-medium">ScanUtsav is fully compliant with India's Digital Personal Data Protection Act 2023. Guest consent is mandatory and recorded for all media uploads.</p>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            ScanUtsav EventTech Solutions Private Limited ("ScanUtsav", "we", "our", "us") values your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our event memory collection platform. By using our Service, you consent to the practices described in this policy.
          </p>
        </div>

        {/* Sections */}
        {sections.map(({ icon: Icon, title, color, bg, items }) => (
          <div key={title} className={`rounded-2xl border p-6 space-y-4 ${bg}`}>
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
              <h2 className="text-base font-black text-slate-900 font-display">{title}</h2>
            </div>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2810C] flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer CTA */}
        <div className="bg-[#F2810C] rounded-3xl p-8 text-center space-y-4 shadow-xl mt-4">
          <h3 className="text-xl font-black text-white font-display">Privacy Questions?</h3>
          <p className="text-amber-50 text-sm font-medium">Contact our Data Protection Officer for any privacy-related requests.</p>
          <a href="mailto:dpo@scanutsav.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-slate-900 font-black text-sm rounded-xl shadow-md transition-all">
            <Mail className="w-4 h-4 text-[#F2810C]" /> dpo@scanutsav.com
          </a>
        </div>
      </div>
    </div>
  );
}
