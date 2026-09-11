"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, QrCode, Download, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function QRManagementPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/events")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvents(data.events || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (eventId: string, eventCode: string) => {
    setDownloading(eventId);
    try {
      const res = await fetch(`/api/admin/qr/${eventId}`);
      const data = await res.json();
      if (data.success && data.qrDataUrl) {
        const link = document.createElement("a");
        link.href = data.qrDataUrl;
        link.download = `scanutsav-qr-${eventCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to download QR code", error);
    } finally {
      setDownloading(null);
    }
  };

  const filtered = events.filter(e => 
    e.title?.toLowerCase().includes(search.toLowerCase()) || 
    e.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            QR Code Management <QrCode className="w-6 h-6 text-[#F2810C]" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Quick access to download Print-Ready QR Codes for any active event.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex-1 max-w-md relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by event title or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2810C] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">Event</th>
                <th className="p-4">Code / URL</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-500">Loading events...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-500">No events found.</td></tr>
              ) : (
                filtered.map(e => (
                  <tr key={e._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img src={e.coverImage || "https://scanutsav.com/images/royal-wedding.webp"} alt={e.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{e.title}</p>
                          <p className="text-xs text-slate-500">Host: {e.hostName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          scanutsav.com/e/{e.code}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        onClick={() => handleDownload(e._id, e.code)}
                        disabled={downloading === e._id}
                      >
                        <Download className="w-4 h-4 mr-2" /> 
                        {downloading === e._id ? "Generating..." : "Download Standee"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}