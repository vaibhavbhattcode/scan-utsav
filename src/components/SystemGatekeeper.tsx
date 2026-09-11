"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";

export const SystemGatekeeper = ({ children }: { children: React.ReactNode }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // If it's an admin path, don't check for global maintenance here
    if (pathname?.startsWith("/admin")) {
      setLoading(false);
      return;
    }

    fetch("/api/public/system-status")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.maintenanceMode) {
          setMaintenance(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pathname]);

  if (loading) {
    // Return children immediately to prevent hydration mismatch/flicker
    // We will let the client render normally, then overlay if maintenance is true.
    return <>{children}</>;
  }

  if (maintenance) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-[#F2810C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 text-[#F2810C]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 font-display">System Under Maintenance</h1>
          <p className="text-slate-500 mb-6">
            ScanUtsav is currently undergoing scheduled maintenance to bring you new features. We will be back online shortly.
          </p>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Check back soon
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
