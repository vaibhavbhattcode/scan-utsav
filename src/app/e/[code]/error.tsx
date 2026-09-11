"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Guest Event Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FAF9F6] text-slate-900 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-[#F2810C] flex items-center justify-center mx-auto shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#F2810C]" />
        </div>

        <div className="space-y-2">
          <span className="text-2xl font-black text-slate-900 font-sans">
            Scan<span className="text-[#F2810C]">Utsav</span>
          </span>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Event Memory Wall Reloading
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            The event album is refreshing its live stream. Click below to reconnect to the album.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all border border-[#F2810C]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconnect Album</span>
          </button>

          <Link href="/" className="w-full">
            <button className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-all">
              <Home className="w-4 h-4" />
              <span>Homepage</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
