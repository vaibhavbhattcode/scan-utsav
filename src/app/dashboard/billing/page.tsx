"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Download, FileText, Building2, Check, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function BillingWorkspacesPage() {
  const { showToast } = useToast();
  const [activeWorkspace, setActiveWorkspace] = useState("Royal Planners Udaipur");
  const [currentPlan, setCurrentPlan] = useState("Royal Utsav");
  const [upgrading, setUpgrading] = useState(false);

  const [invoices, setInvoices] = useState([
    { id: "INV-2026-881921", date: "2026-07-20", plan: "Royal Utsav Pass", amount: "₹2,117.80 + ₹381.20 GST", total: "₹2,499.00", status: "Paid" },
    { id: "INV-2026-642018", date: "2026-06-15", plan: "Grand Enterprise Pass", amount: "₹5,931.36 + ₹1,067.64 GST", total: "₹6,999.00", status: "Paid" },
  ]);

  const handleDownloadInvoice = (id: string) => {
    showToast(`Downloading GST Tax Invoice ${id}...`, "success");
    window.print();
  };

  const handleUpgradePlan = async (planName: string, amountINR: number) => {
    setUpgrading(true);
    try {
      // Step A: Request Razorpay Order Creation from POST /api/payments/razorpay
      const res = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          planName,
          amountINR,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order creation failed");
      }

      // Step B: Verify Payment & Issue GST Invoice
      const verifyRes = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_payment",
          planName,
          razorpayOrderId: data.orderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: "mock_signature_valid",
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setCurrentPlan(planName);
        showToast(`Successfully upgraded to ${planName}! 🎉 GST Invoice issued.`, "success");

        const newInv = {
          id: verifyData.invoice.invoiceNumber,
          date: new Date().toISOString().split("T")[0],
          plan: `${planName} Pass`,
          amount: `₹${verifyData.invoice.gstInvoice.baseAmountINR} + ₹${verifyData.invoice.gstInvoice.totalGSTINR} GST`,
          total: `₹${verifyData.invoice.gstInvoice.totalINR}`,
          status: "Paid",
        };
        setInvoices([newInv, ...invoices]);
      } else {
        throw new Error(verifyData.error || "Payment verification failed");
      }
    } catch (err: any) {
      showToast(err.message || "Upgrade failed", "error");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-marigold-400">Enterprise Billing</span>
            <h1 className="text-3xl font-black text-white font-display">Subscription Plans & GST Invoices</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Active Plan:</span>
          <span className="px-3 py-1 bg-marigold-500/20 text-marigold-400 font-extrabold text-xs rounded-full border border-marigold-500/30">
            {currentPlan}
          </span>
        </div>
      </div>

      {/* Plan Upgrade Selector */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 print:hidden">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <span>Available Celebration Passes</span>
          </h3>
          <p className="text-xs text-slate-300">Upgrade to Royal Utsav or Grand Utsav to unlock AI Face Recognition & Live TV Slideshows.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* Free Tier */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">STARTER PASS</span>
              <h4 className="text-lg font-bold text-white font-display">Free Utsav</h4>
              <div className="text-2xl font-black text-white">₹0 <span className="text-xs font-normal text-slate-400">/ event</span></div>
              <ul className="space-y-2 pt-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> Up to 50 Guests</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> 7 Days Cloud Access</li>
                <li className="flex items-center gap-1.5 text-slate-500">❌ AI Face Recognition</li>
                <li className="flex items-center gap-1.5 text-slate-500">❌ Live TV Slideshow</li>
              </ul>
            </div>
            <Button variant="outline" size="sm" disabled className="w-full text-xs">
              Default Plan
            </Button>
          </div>

          {/* Royal Utsav */}
          <div className={`glass-card p-6 rounded-2xl border ${currentPlan === "Royal Utsav" ? "border-marigold-500 shadow-glow-marigold bg-marigold-500/10" : "border-white/10"} space-y-4 flex flex-col justify-between`}>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">MOST POPULAR</span>
              <h4 className="text-lg font-bold text-white font-display">Royal Utsav</h4>
              <div className="text-2xl font-black text-white">₹2,499 <span className="text-xs font-normal text-slate-400">+ 18% GST</span></div>
              <ul className="space-y-2 pt-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> Unlimited Guests</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> AI Face Recognition</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> Live TV Slideshow</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> 30 Days Storage</li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={upgrading || currentPlan === "Royal Utsav"}
              onClick={() => handleUpgradePlan("Royal Utsav", 2499)}
              className="w-full text-xs font-bold shadow-glow-marigold"
            >
              {currentPlan === "Royal Utsav" ? "Active Plan" : upgrading ? "Processing..." : "Upgrade to Royal"}
            </Button>
          </div>

          {/* Grand Utsav */}
          <div className={`glass-card p-6 rounded-2xl border ${currentPlan === "Grand Utsav" ? "border-gold-500 shadow-glow-gold bg-gold-500/10" : "border-white/10"} space-y-4 flex flex-col justify-between`}>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon-400">ENTERPRISE</span>
              <h4 className="text-lg font-bold text-white font-display">Grand Utsav</h4>
              <div className="text-2xl font-black text-white">₹6,999 <span className="text-xs font-normal text-slate-400">+ 18% GST</span></div>
              <ul className="space-y-2 pt-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> Unlimited Guests & Events</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> High-Accuracy AI Face Search</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> Dedicated Cloud Folder</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emeraldWarm" /> Lifetime Cloud Backup</li>
              </ul>
            </div>
            <Button
              variant="gold"
              size="sm"
              disabled={upgrading || currentPlan === "Grand Utsav"}
              onClick={() => handleUpgradePlan("Grand Utsav", 6999)}
              className="w-full text-xs font-bold text-slate-950"
            >
              {currentPlan === "Grand Utsav" ? "Active Plan" : upgrading ? "Processing..." : "Upgrade to Grand"}
            </Button>
          </div>
        </div>
      </div>

      {/* GST Invoices Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2 font-display">
            <FileText className="w-5 h-5 text-marigold-400" />
            <span>Tax Invoices & GST Receipts (18% GST Compliance)</span>
          </h3>
          <span className="text-[10px] text-emeraldWarm font-extrabold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> GSTIN: 27AAAAA0000A1Z5
          </span>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-white font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Plan Description</th>
                <th className="p-4">Base Amount + 18% GST</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4 text-right">GST Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-marigold-400">{inv.id}</td>
                  <td className="p-4 text-slate-400">{inv.date}</td>
                  <td className="p-4 text-white font-sans">{inv.plan}</td>
                  <td className="p-4 text-slate-300">{inv.amount}</td>
                  <td className="p-4 text-emeraldWarm font-bold">{inv.total}</td>
                  <td className="p-4 text-right">
                    <Button variant="glass" size="sm" onClick={() => handleDownloadInvoice(inv.id)}>
                      <Download className="w-3.5 h-3.5 text-gold-400" /> GST Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
