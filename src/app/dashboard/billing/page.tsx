"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Check, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function BillingWorkspacesPage() {
  const { showToast } = useToast();
  const [activeWorkspace] = useState("Royal Planners Udaipur");
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Enterprise Billing</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Subscription Plans & GST Invoices</h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-white p-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-600">Current Active Plan:</span>
          <span className="px-3 py-1 bg-amber-100 text-[#F2810C] font-black text-xs rounded-full border border-amber-300">
            {currentPlan}
          </span>
        </div>
      </div>

      {/* Plan Upgrade Selector */}
      <div className="bg-white p-8 rounded-3xl space-y-6 border border-slate-200 shadow-sm print:hidden">
        <div className="space-y-1 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-xl font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F2810C]" />
            <span>Available Celebration Passes</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Upgrade to Royal Utsav or Grand Utsav to unlock AI Face Recognition & Live TV Slideshows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* Free Tier */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full border border-slate-300">
                STARTER PASS
              </span>
              <h4 className="text-xl font-black text-slate-900 font-display">Free Utsav</h4>
              <div className="text-3xl font-black text-slate-900 font-display">₹0 <span className="text-xs font-semibold text-slate-500">/ event</span></div>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Up to 50 Guests</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 7 Days Cloud Access</li>
                <li className="flex items-center gap-2 text-slate-400">❌ AI Face Recognition</li>
                <li className="flex items-center gap-2 text-slate-400">❌ Live TV Slideshow</li>
              </ul>
            </div>
            <Button variant="outline" size="sm" disabled className="w-full text-xs font-bold text-slate-400 border-slate-300 bg-slate-100">
              Default Plan
            </Button>
          </div>

          {/* Royal Utsav */}
          <div className={`p-6 rounded-2xl border ${currentPlan === "Royal Utsav" ? "border-[#F2810C] bg-amber-50/50 shadow-md ring-2 ring-amber-300" : "border-slate-200 bg-white"} space-y-4 flex flex-col justify-between`}>
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F2810C] bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                MOST POPULAR
              </span>
              <h4 className="text-xl font-black text-slate-900 font-display">Royal Utsav</h4>
              <div className="text-3xl font-black text-slate-900 font-display">₹2,499 <span className="text-xs font-semibold text-slate-500">+ 18% GST</span></div>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited Guests</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> AI Face Recognition</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Live TV Slideshow</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 30 Days Storage</li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={upgrading || currentPlan === "Royal Utsav"}
              onClick={() => handleUpgradePlan("Royal Utsav", 2499)}
              className="w-full text-xs font-extrabold bg-[#F2810C] hover:bg-[#D97706] text-white shadow-md"
            >
              {currentPlan === "Royal Utsav" ? "Active Plan" : upgrading ? "Processing..." : "Upgrade to Royal"}
            </Button>
          </div>

          {/* Grand Utsav */}
          <div className={`p-6 rounded-2xl border ${currentPlan === "Grand Utsav" ? "border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-400" : "border-slate-200 bg-white"} space-y-4 flex flex-col justify-between`}>
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-200 px-2.5 py-1 rounded-full border border-amber-300">
                ENTERPRISE
              </span>
              <h4 className="text-xl font-black text-slate-900 font-display">Grand Utsav</h4>
              <div className="text-3xl font-black text-slate-900 font-display">₹6,999 <span className="text-xs font-semibold text-slate-500">+ 18% GST</span></div>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited Guests & Events</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> High-Accuracy AI Face Search</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Dedicated Cloud Folder</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Lifetime Cloud Backup</li>
              </ul>
            </div>
            <Button
              variant="gold"
              size="sm"
              disabled={upgrading || currentPlan === "Grand Utsav"}
              onClick={() => handleUpgradePlan("Grand Utsav", 6999)}
              className="w-full text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md"
            >
              {currentPlan === "Grand Utsav" ? "Active Plan" : upgrading ? "Processing..." : "Upgrade to Grand"}
            </Button>
          </div>
        </div>
      </div>

      {/* GST Invoices Table */}
      <div className="bg-white p-6 rounded-3xl space-y-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 font-display">
            <FileText className="w-5 h-5 text-[#F2810C]" />
            <span>Tax Invoices & GST Receipts (18% GST Compliance)</span>
          </h3>
          <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> GSTIN: 27AAAAA0000A1Z5
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Plan Description</th>
                <th className="p-4">Base Amount + 18% GST</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4 text-right">GST Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-black text-[#F2810C] font-mono">{inv.id}</td>
                  <td className="p-4 text-slate-700 font-bold font-mono">{inv.date}</td>
                  <td className="p-4 text-slate-900 font-bold font-sans">{inv.plan}</td>
                  <td className="p-4 text-slate-700 font-bold font-mono">{inv.amount}</td>
                  <td className="p-4 text-emerald-700 font-extrabold font-mono text-sm">{inv.total}</td>
                  <td className="p-4 text-right">
                    <Button variant="glass" size="sm" onClick={() => handleDownloadInvoice(inv.id)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs">
                      <Download className="w-3.5 h-3.5 text-[#F2810C]" /> GST Invoice
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
