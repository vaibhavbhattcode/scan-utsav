"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Webhook, Key, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/integrations")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.integrations);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const integrations = [
    { name: "Razorpay", desc: "Payment gateway for subscriptions.", status: data?.razorpay ? "connected" : "missing" },
    { name: "Cloudinary", desc: "Media storage and optimization.", status: data?.cloudinary ? "connected" : "missing" },
    { name: "AWS S3", desc: "Backup storage for high quality images.", status: data?.aws ? "connected" : "missing" },
    { name: "Google OAuth", desc: "Google login for users.", status: data?.google ? "connected" : "missing" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            Integrations & API Keys <Webhook className="w-6 h-6 text-purple-600" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Manage third-party service connections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(integ => (
          <div key={integ.name} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{integ.name}</h3>
                <p className="text-sm text-slate-500">{integ.desc}</p>
              </div>
              {integ.status === "connected" ? (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Missing Keys
                </span>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Key className="w-3 h-3" /> Status
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600">
                {integ.status === "connected" ? "Configured in Environment Variables" : "Missing in Environment Variables"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}