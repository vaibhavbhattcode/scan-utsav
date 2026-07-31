"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gift, Heart, Check, ArrowRight, Mail, Shield, Star, Copy, Download } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    key: "royal",
    name: "Royal Utsav Pass",
    price: "₹2,499",
    amountINR: 2499,
    emoji: "👑",
    features: ["500 Photos/Videos", "Live TV Slideshow", "AI Face Search", "1-Year Storage"],
    activeStyle: { borderColor: "#F2810C", backgroundColor: "#FFF8F0" },
    activeBadgeStyle: { backgroundColor: "#F2810C", color: "#fff" },
    badge: "Most Popular",
    highlight: true,
  },
  {
    key: "grand",
    name: "Grand Enterprise Pass",
    price: "₹6,999",
    amountINR: 6999,
    emoji: "💎",
    features: ["Unlimited Uploads", "4K RAW Preservation", "AI Face Tags", "Lifetime Storage"],
    activeStyle: { borderColor: "#7C3AED", backgroundColor: "#F5F3FF" },
    activeBadgeStyle: { backgroundColor: "#7C3AED", color: "#fff" },
    badge: "Best Value",
    highlight: false,
  },
];

interface GiftSuccess {
  giftCode: string;
  invoiceNumber: string;
  planName: string;
  amountINR: number;
  recipientName: string;
  recipientEmail: string;
  emailSent: boolean;
}

export default function GiftPassPage() {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("royal");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<GiftSuccess | null>(null);
  const [copied, setCopied] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => { try { document.body.removeChild(script); } catch {} };
  }, []);

  const plan = PLANS.find((p) => p.key === selectedPlan)!;

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientEmail.trim()) {
      alert("Please enter recipient name and email.");
      return;
    }
    setLoading(true);

    try {
      // Step 1: Create order
      const orderRes = await fetch("/api/payments/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_order", planKey: selectedPlan }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || "Order creation failed");

      // Step 2: If mock order (no real Razorpay key), complete directly
      if (orderData.isMock) {
        const verifyRes = await fetch("/api/payments/gift", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify_payment",
            planKey: selectedPlan,
            recipientName,
            recipientEmail,
            message,
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: "mock_signature",
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setSuccess(verifyData);
          setLoading(false);
          return;
        }
        throw new Error(verifyData.error || "Payment verification failed");
      }

      // Step 3: Real Razorpay checkout
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error("Payment gateway is loading. Please try again in a moment.");
      }

      const rzpOptions = {
        key: orderData.key,
        amount: plan.amountINR * 100,
        currency: "INR",
        name: "ScanUtsav",
        description: `Gift Pass — ${plan.name}`,
        order_id: orderData.orderId,
        prefill: { name: senderName, email: "", contact: "" },
        theme: { color: "#F2810C" },
        modal: { backdropclose: false },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payments/gift", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "verify_payment",
                planKey: selectedPlan,
                recipientName,
                recipientEmail,
                message,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(verifyData);
            } else {
              alert("Payment verification failed: " + (verifyData.error || "Unknown error"));
            }
          } catch (err: any) {
            alert("Verification error: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        modal_close: () => setLoading(false),
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();

    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const copyGiftCode = () => {
    if (success?.giftCode) {
      navigator.clipboard.writeText(success.giftCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── SUCCESS STATE ──────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] font-sans flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full space-y-6">
          {/* Success Animation */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-400 mx-auto flex items-center justify-center shadow-lg">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display">Gift Pass Sent! 🎁</h2>
              <p className="text-sm text-slate-600 font-medium mt-1">
                {success.emailSent
                  ? `Gift pass emailed to ${success.recipientEmail}`
                  : `Gift pass created for ${success.recipientName}`}
              </p>
            </div>

            {/* Gift Code Box */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 space-y-2">
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Shareable Gift Code</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xl font-black text-[#F2810C] text-center tracking-widest">
                  {success.giftCode}
                </code>
                <button
                  onClick={copyGiftCode}
                  className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-700" />}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Plan</span>
                <span className="font-bold text-slate-900">{success.planName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Amount Paid</span>
                <span className="font-black text-[#F2810C]">₹{success.amountINR.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Recipient</span>
                <span className="font-bold text-slate-900">{success.recipientName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Invoice</span>
                <span className="font-mono text-slate-700 text-[10px]">{success.invoiceNumber}</span>
              </div>
            </div>

            {!success.emailSent && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-800 font-medium">
                ⚠️ Email not sent (Resend not configured). Share the gift code manually with the recipient.
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-sm rounded-xl border border-slate-200 transition-all">
                  Return Home
                </button>
              </Link>
              <button
                onClick={() => { setSuccess(null); setRecipientName(""); setRecipientEmail(""); setMessage(""); setSenderName(""); }}
                className="flex-1 py-3 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-sm rounded-xl border border-[#F2810C] transition-all"
              >
                Send Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 py-14 px-6 text-center space-y-5">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-amber-900 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">
            Digital Gift Cards & Event Passes
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
            Gift an Unforgettable <span className="text-[#F2810C]">Memory Album</span>
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto font-medium">
            Surprise a couple or event host with a premium ScanUtsav event pass — delivered instantly via email.
          </p>
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-slate-600 pt-1">
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full"><Shield className="w-3 h-3 text-emerald-600" /> SSL Secure</span>
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full"><Check className="w-3 h-3 text-emerald-600" /> 7-Day Refund</span>
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full"><Mail className="w-3 h-3 text-[#F2810C]" /> Instant Email Delivery</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Plan Selector */}
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display mb-4">1. Choose a Gift Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLANS.map((p) => (
              <div
                key={p.key}
                onClick={() => setSelectedPlan(p.key)}
                className="relative cursor-pointer rounded-3xl border-2 p-6 transition-all shadow-sm hover:shadow-lg"
                style={selectedPlan === p.key
                  ? { ...p.activeStyle, borderWidth: "2px" }
                  : { borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }
                }
              >
                <span
                  className="absolute -top-3 right-5 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full"
                  style={p.activeBadgeStyle}
                >
                  {p.badge}
                </span>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{p.emoji}</span>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{p.name}</div>
                    <div className="text-2xl font-black text-[#F2810C]">{p.price}</div>
                  </div>
                  {selectedPlan === p.key && (
                    <div
                      className="ml-auto w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: p.activeStyle.borderColor, border: `2px solid ${p.activeStyle.borderColor}` }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Gift Form */}
        <form onSubmit={handleGiftSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <h2 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#F2810C]" />
            2. Enter Gift Details
          </h2>

          {/* Your Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name (From)</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Ritu Aunty"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Name *</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sanya & Rahul"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Email *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="sanya@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Personal Greeting Message (optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wishing you a magical wedding celebration! Enjoy your ScanUtsav memory album ❤️"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-800 font-black uppercase tracking-wider">Order Total</div>
              <div className="text-sm font-black text-slate-900">{plan.name}</div>
              <div className="text-[10px] text-amber-700 font-medium">Includes 18% GST · Instant Email Delivery</div>
            </div>
            <div className="text-3xl font-black text-[#F2810C]">{plan.price}</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-8 bg-[#F2810C] hover:bg-[#D97706] disabled:opacity-70 text-white font-black text-sm rounded-xl shadow-md border border-[#F2810C] flex items-center justify-center gap-2 transition-all"
          >
            <Gift className="w-4 h-4" />
            {loading ? "Opening Payment..." : `Pay ${plan.price} & Send Gift 🎁`}
          </button>

          <div className="flex items-center justify-center gap-5 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /> SSL Secure</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /> Razorpay Encrypted</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /> 7-Day Refund</span>
          </div>
        </form>
      </div>
    </div>
  );
}
