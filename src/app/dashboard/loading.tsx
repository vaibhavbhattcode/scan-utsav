import React from "react";

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-full" />
          <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <div className="h-10 w-36 bg-slate-200 animate-pulse rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
