"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ScanUtsav Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-[#FAF9F6] text-slate-900 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-[#F2810C] flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-2xl font-black text-slate-900 font-sans">
            Scan<span className="text-[#F2810C]">Utsav</span>
          </span>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Something went wrong
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            We encountered an unexpected issue while loading this page. Please try refreshing or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all border border-[#F2810C]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link href="/" className="w-full">
            <button className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-all">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
