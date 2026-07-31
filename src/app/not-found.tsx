import React from "react";
import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-[#FAF9F6] text-slate-900 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-[#F2810C] flex items-center justify-center mx-auto shadow-sm">
          <Search className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-2xl font-black text-slate-900 font-sans">
            Scan<span className="text-[#F2810C]">Utsav</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            404 - Page Not Found
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            The page or event memory album you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <button className="w-full py-3 px-4 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all border border-[#F2810C]">
              <Home className="w-4 h-4" />
              <span>Return to ScanUtsav Homepage</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
