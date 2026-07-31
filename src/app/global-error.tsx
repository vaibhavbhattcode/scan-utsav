"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9F6] text-slate-900 font-sans min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-[#F2810C] flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-2xl font-black text-slate-900 font-sans">
              Scan<span className="text-[#F2810C]">Utsav</span>
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Critical System Notice
            </h1>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              A global error occurred. Click below to recover your session.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all border border-[#F2810C]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload ScanUtsav</span>
          </button>
        </div>
      </body>
    </html>
  );
}
