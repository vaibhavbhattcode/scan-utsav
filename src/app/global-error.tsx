"use client";

import React from "react";
import "@/app/globals.css";

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
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-2xl font-black text-slate-900 font-sans">
              Scan<span className="text-[#F2810C]">Utsav</span>
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              System Recovery Notice
            </h1>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              ScanUtsav encountered a temporary session error. Click below to reload the app seamlessly.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all border border-[#F2810C]"
          >
            <span>Reload ScanUtsav</span>
          </button>
        </div>
      </body>
    </html>
  );
}
