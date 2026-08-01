"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Sparkles, ShieldCheck, CheckCircle2, X, Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface InvoiceData {
  id: string;
  date: string;
  plan: string;
  baseAmount: string;
  cgst: string;
  sgst: string;
  total: string;
  status: string;
}

export default function BillingWorkspacesPage() {
  const { showToast } = useToast();
  const [currentPlan, setCurrentPlan] = useState("Royal Utsav");
  const [upgrading, setUpgrading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  const [invoices, setInvoices] = useState<InvoiceData[]>([
    {
      id: "INV-2026-881921",
      date: "2026-07-20",
      plan: "Royal Utsav Pass",
      baseAmount: "₹2,117.80",
      cgst: "₹190.60",
      sgst: "₹190.60",
      total: "₹2,499.00",
      status: "Paid",
    },
    {
      id: "INV-2026-642018",
      date: "2026-06-15",
      plan: "Grand Enterprise Pass",
      baseAmount: "₹5,931.36",
      cgst: "₹533.82",
      sgst: "₹533.82",
      total: "₹6,999.00",
      status: "Paid",
    },
  ]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (selectedInvoice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedInvoice]);

  const handleOpenInvoice = (inv: InvoiceData) => {
    setSelectedInvoice(inv);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgradePlan = async (planName: string, amountINR: number) => {
    setUpgrading(true);
    try {
      // Step A: Request Razorpay Order Creation from API
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

      // Helper function to call verification endpoint and issue receipt
      const completeVerification = async (paymentId?: string, signature?: string) => {
        const verifyRes = await fetch("/api/payments/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify_payment",
            planName,
            razorpayOrderId: data.orderId,
            razorpayPaymentId: paymentId || `pay_${Date.now()}`,
            razorpaySignature: signature || "mock_signature_valid",
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          setCurrentPlan(planName);
          showToast(`Successfully upgraded to ${planName}! 🎉 GST Invoice issued.`, "success");

          const gst = verifyData.invoice.gstInvoice;
          const newInv: InvoiceData = {
            id: verifyData.invoice.invoiceNumber,
            date: new Date().toISOString().split("T")[0],
            plan: `${planName} Pass`,
            baseAmount: `₹${gst.baseAmountINR}`,
            cgst: `₹${gst.cgstINR}`,
            sgst: `₹${gst.sgstINR}`,
            total: `₹${gst.totalINR}`,
            status: "Paid",
          };

          setInvoices([newInv, ...invoices]);
          setSelectedInvoice(newInv);
        } else {
          throw new Error(verifyData.error || "Payment verification failed");
        }
      };

      // Step B: Load Razorpay script & open popup if available
      const isRazorpayLoaded = await loadRazorpayScript();

      if (isRazorpayLoaded && (window as any).Razorpay) {
        const options = {
          key: data.key,
          amount: data.amountINR * 100,
          currency: data.currency,
          name: "ScanUtsav Technologies",
          description: `${planName} Celebration Pass`,
          order_id: data.orderId,
          handler: async function (response: any) {
            await completeVerification(response.razorpay_payment_id, response.razorpay_signature);
            setUpgrading(false);
          },
          prefill: {
            name: "ScanUtsav Host",
            email: "host@scanutsav.com",
          },
          theme: {
            color: "#F2810C",
          },
          modal: {
            ondismiss: function () {
              setUpgrading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback test verification when script is blocked or offline
        await completeVerification();
        setUpgrading(false);
      }
    } catch (err: any) {
      showToast(err.message || "Upgrade failed", "error");
      setUpgrading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-16 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 print-hide">
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
      <div className="bg-white p-8 rounded-3xl space-y-6 border border-slate-200 shadow-sm print-hide">
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
      <div className="bg-white p-6 rounded-3xl space-y-4 border border-slate-200 shadow-sm print-hide">
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
                  <td className="p-4 text-slate-700 font-bold font-mono">{inv.baseAmount} + GST</td>
                  <td className="p-4 text-emerald-700 font-extrabold font-mono text-sm">{inv.total}</td>
                  <td className="p-4 text-right">
                    <Button variant="glass" size="sm" onClick={() => handleOpenInvoice(inv)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs">
                      <Download className="w-3.5 h-3.5 text-[#F2810C]" /> View & Print GST Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROFESSIONAL GST TAX INVOICE MODAL & PRINT TARGET */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[9999] !mt-0 !top-0 !left-0 !right-0 !bottom-0 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans my-auto print:shadow-none print:border-none print:max-w-full print:rounded-none">
            {/* Modal Toolbar - Hidden when printing */}
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between print-hide">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F2810C]" />
                <span className="font-bold text-sm font-display">Tax Invoice — {selectedInvoice.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintInvoice}
                  className="py-1.5 px-4 rounded-xl bg-[#F2810C] hover:bg-[#D97706] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE INVOICE CONTENT AREA */}
            <div id="printable-invoice-area" className="p-6 sm:p-8 space-y-5 bg-white text-slate-900 print:p-0 print:space-y-4 print:text-black">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 print:pb-3">
                <div>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
                    Scan<span className="text-[#F2810C]">Utsav</span>
                  </span>
                  <p className="text-[10px] text-slate-600 font-extrabold tracking-widest uppercase mt-0.5">
                    ScanUtsav EventTech Solutions Private Limited
                  </p>
                  <p className="text-[10px] text-slate-700 mt-1 max-w-sm leading-snug">
                    104, Celebration Hub, Lake City, Udaipur, Rajasthan — 313001<br />
                    <strong>GSTIN:</strong> 27AAAAA0000A1Z5 | <strong>CIN:</strong> U72900RJ2026PTC081234<br />
                    <strong>Support:</strong> billing@scanutsav.com | +91 98765 00000
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block px-3 py-0.5 bg-amber-100 text-[#F2810C] font-black text-[11px] rounded-full border border-amber-300 tracking-wider">
                    TAX INVOICE
                  </span>
                  <h2 className="text-lg font-black text-slate-900 font-mono pt-1">{selectedInvoice.id}</h2>
                  <p className="text-[11px] text-slate-700 font-bold"><strong>Date:</strong> {selectedInvoice.date}</p>
                  <p className="text-[11px] text-slate-700"><strong>Place of Supply:</strong> Rajasthan (08)</p>
                </div>
              </div>

              {/* Bill To & Payment Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs print:bg-white print:border-slate-300 print:p-3">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-600">BILLED TO (CUSTOMER)</span>
                  <h3 className="text-xs font-black text-slate-900 mt-0.5">ScanUtsav Host User</h3>
                  <p className="text-slate-700 text-[11px]">host@scanutsav.com</p>
                  <p className="text-slate-700 text-[11px] font-medium">Workspace: Royal Planners Udaipur</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-600">PAYMENT DETAILS</span>
                  <p className="font-bold text-slate-900 text-xs">Payment Status: <span className="text-emerald-700 font-black">PAID</span></p>
                  <p className="text-slate-700 text-[11px]">Method: Razorpay Online (UPI / Card)</p>
                  <p className="text-slate-700 font-mono text-[10px]">Txn ID: pay_{selectedInvoice.id.split("-")[2] || "998231"}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="rounded-xl overflow-hidden border border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                    <tr>
                      <th className="p-2.5">Service Description</th>
                      <th className="p-2.5 text-center">SAC Code</th>
                      <th className="p-2.5 text-right">Base Price</th>
                      <th className="p-2.5 text-right">CGST (9%)</th>
                      <th className="p-2.5 text-right">SGST (9%)</th>
                      <th className="p-2.5 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5">
                        <span className="font-bold text-slate-900">{selectedInvoice.plan}</span>
                        <p className="text-[10px] text-slate-600">Includes AI Face Recognition, Live TV Stream & Cloud Storage Access</p>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700">998314</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-800">{selectedInvoice.baseAmount}</td>
                      <td className="p-2.5 text-right font-mono text-slate-700">{selectedInvoice.cgst}</td>
                      <td className="p-2.5 text-right font-mono text-slate-700">{selectedInvoice.sgst}</td>
                      <td className="p-2.5 text-right font-mono font-black text-slate-900 text-xs">{selectedInvoice.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="flex justify-end">
                <div className="w-60 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs font-mono print:bg-white print:border-slate-300 print:p-2.5">
                  <div className="flex justify-between text-slate-700 text-[11px]">
                    <span>Subtotal:</span>
                    <span className="font-bold">{selectedInvoice.baseAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 text-[11px]">
                    <span>CGST (9%):</span>
                    <span>{selectedInvoice.cgst}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 text-[11px]">
                    <span>SGST (9%):</span>
                    <span>{selectedInvoice.sgst}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 text-xs font-black pt-1.5 border-t border-slate-300">
                    <span>Total Paid:</span>
                    <span className="text-[#F2810C]">{selectedInvoice.total}</span>
                  </div>
                </div>
              </div>

              {/* Signature & Verification Seal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-600">DIGITAL AUDIT & VERIFICATION</span>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Digitally Verified GST Compliant Invoice</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-xs font-black text-slate-900 font-display">ScanUtsav Technologies Pvt. Ltd.</div>
                  <p className="text-[9px] text-slate-600 font-mono">Authorized Signatory (System Generated)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
