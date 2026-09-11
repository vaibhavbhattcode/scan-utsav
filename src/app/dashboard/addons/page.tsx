"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Sparkles, CheckCircle2, ChevronDown } from "lucide-react";
import Script from "next/script";

const ADDON_CATALOG = [
  { id: "ai_highlight", name: "AI Highlight Video", amountINR: 299, desc: "Auto-generated 60s reel of top moments" },
  { id: "ai_face", name: "AI Face Recognition", amountINR: 499, desc: "Let guests find all their photos instantly" },
  { id: "white_label", name: "White-label Branding", amountINR: 999, desc: "Remove all ScanUtsav logos" },
  { id: "custom_web", name: "Custom Event Website", amountINR: 499, desc: "Dedicated page for your event memories" },
  { id: "custom_qr", name: "Custom QR Stand Design", amountINR: 149, desc: "Professionally designed print files" },
  { id: "extended_retention", name: "Extended Retention", amountINR: 299, desc: "Keep memories alive for 6 extra months" },
  { id: "guest_book", name: "Guest Book PDF", amountINR: 199, desc: "Download all wishes in a printable book" },
  { id: "premium_support", name: "Premium Support", amountINR: 299, desc: "Dedicated 24/7 WhatsApp assistance" },
];

export default function AddonsStorePage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success && data.events.length > 0) {
        setEvents(data.events);
        setSelectedEventId(data.events[0]._id);
      }
    } catch (err) {
      showToast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const activeEvent = events.find((e) => e._id === selectedEventId);
  const purchasedIds = activeEvent?.purchasedAddons?.map((a: any) => a.addonId) || [];

  const handlePurchase = async (addon: typeof ADDON_CATALOG[0]) => {
    if (!selectedEventId) {
      showToast("Please select an event first", "error");
      return;
    }

    setProcessing(addon.id);
    try {
      // 1. Create Order
      const resOrder = await fetch("/api/payments/razorpay/addon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_order", addonId: addon.id, eventId: selectedEventId }),
      });
      const dataOrder = await resOrder.json();
      if (!dataOrder.success) throw new Error(dataOrder.error);

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: dataOrder.order.amount,
        currency: "INR",
        name: "ScanUtsav Add-ons",
        description: `${addon.name} for ${activeEvent?.title}`,
        order_id: dataOrder.order.id,
        handler: async (response: any) => {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/payments/razorpay/addon", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "verify_payment",
                addonId: addon.id,
                eventId: selectedEventId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              showToast(`${addon.name} unlocked successfully!`, "success");
              fetchEvents(); // Refresh event data
            } else {
              showToast(verifyData.error || "Payment verification failed", "error");
            }
          } catch {
            showToast("Failed to verify payment", "error");
          } finally {
            setProcessing(null);
          }
        },
        prefill: { name: "Host", email: "host@example.com" },
        theme: { color: "#F2810C" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      showToast(error.message || "Checkout failed", "error");
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading Add-ons Store...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header & Event Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#F2810C]" /> Add-ons Store
          </h1>
          <p className="text-slate-600 mt-2">Level up your event with premium features</p>
        </div>

        {events.length > 0 && (
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-[250px]">
            <div className="bg-orange-50 text-[#F2810C] px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
              Event
            </div>
            <div className="relative flex-1">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full appearance-none bg-transparent text-sm font-bold text-slate-900 pr-8 cursor-pointer focus:outline-none"
              >
                {events.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Catalog Grid */}
      {events.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-8 text-center max-w-xl mx-auto">
          <p className="text-orange-800 font-bold mb-4">You need to create an event first before you can buy add-ons!</p>
          <Button onClick={() => window.location.href = "/dashboard/events"} className="bg-[#F2810C] hover:bg-[#D97706] text-white">
            Create Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADDON_CATALOG.map((addon) => {
            const isPurchased = purchasedIds.includes(addon.id);
            return (
              <div
                key={addon.id}
                className={`bg-white rounded-3xl border-2 p-6 flex flex-col justify-between transition-all duration-300 ${
                  isPurchased ? "border-green-500 shadow-sm opacity-90" : "border-slate-200 hover:border-[#F2810C] shadow-lg hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{addon.name}</h3>
                    {isPurchased && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-600 mb-6 font-medium">{addon.desc}</p>
                </div>
                
                <div>
                  <div className="text-2xl font-black text-slate-900 mb-4">
                    ₹{addon.amountINR}
                  </div>
                  {isPurchased ? (
                    <Button variant="outline" className="w-full border-green-500 text-green-700 bg-green-50 cursor-default" disabled>
                      Active for Event
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(addon)}
                      disabled={processing === addon.id}
                      className="w-full bg-[#F2810C] hover:bg-[#D97706] text-white font-bold shadow-md shadow-orange-500/20"
                    >
                      {processing === addon.id ? "Processing..." : "Buy Now"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
