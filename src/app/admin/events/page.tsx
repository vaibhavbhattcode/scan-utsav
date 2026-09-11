"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowLeft, Search, Filter, ArrowUpRight, Tv, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminEventsManager() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const fetchEvents = () => {
    setLoading(true);
    fetch(`/api/admin/events?category=${selectedCategory}&search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvents(data.events || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const exportEventsCSV = () => {
    const headers = ["ID", "Title", "Code", "Category", "Host", "Media Count", "Moderation"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + events.map(e => [
        e._id,
        `"${e.title}"`,
        e.code,
        e.eventType || "wedding",
        `"${e.hostName || "Unknown"}"`,
        e.mediaCount || 0,
        e.requireApproval ? "Manual" : "Auto"
      ].join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scanutsav_events_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Event Management</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor and manage all live events across the platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            
            <button 
              onClick={exportEventsCSV}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <form onSubmit={handleSearch} className="flex-1 max-w-md relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by event title, code, or host name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2810C] focus:border-transparent transition-all outline-none shadow-sm"
              />
            </form>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#F2810C] focus:border-transparent outline-none w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              <option value="wedding">Weddings</option>
              <option value="festival">Festivals</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-10 text-slate-500 font-medium">Loading live events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium">No events found matching your criteria.</div>
          ) : (
            events.map((evt) => (
              <div key={evt._id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-slate-50 transition-colors group">
                <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm relative">
                    <img src={evt.coverImage || "https://scanutsav.com/images/royal-wedding.webp"} alt={evt.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-[#F2810C] transition-colors line-clamp-1">{evt.title}</h4>
                    <p className="text-xs text-slate-500 font-mono font-bold mt-1 bg-slate-100 inline-block px-1.5 rounded">{evt.code}</p>
                  </div>
                </div>
                
                <div className="col-span-6 md:col-span-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {evt.eventType || 'wedding'}
                  </span>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <p className="text-xs font-bold text-slate-700 line-clamp-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">
                      {(evt.hostName || "U")[0].toUpperCase()}
                    </span>
                    {evt.hostName || "Unknown"}
                  </p>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm inline-flex">
                    <div className="flex items-center gap-1.5 px-2">
                      {evt.requireApproval ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Tv className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className="text-[10px] font-black text-slate-600 uppercase">{evt.requireApproval ? "Manual" : "Auto"}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2 flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Link href={`/e/${evt.code}`} target="_blank">
                    <Button variant="outline" size="sm" className="h-8 bg-white border-slate-200 hover:bg-slate-50 hover:text-[#F2810C]">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button size="sm" className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4">
                    Manage
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
