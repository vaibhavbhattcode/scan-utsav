import React from "react";

export default function EventPageLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 space-y-6 font-sans">
      {/* Header Skeleton */}
      <div className="max-w-4xl mx-auto text-center space-y-4 py-8">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded-full mx-auto" />
        <div className="h-10 w-3/4 max-w-md bg-slate-200 animate-pulse rounded-2xl mx-auto" />
        <div className="h-4 w-1/2 max-w-sm bg-slate-200 animate-pulse rounded-xl mx-auto" />
      </div>

      {/* Media Grid Skeleton */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="h-48 bg-slate-200 animate-pulse rounded-2xl border border-slate-300" />
        ))}
      </div>
    </div>
  );
}
