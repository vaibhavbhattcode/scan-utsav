"use client";

import React from "react";
import { usePathname } from "next/navigation";

export const MainLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // If we are on Admin, Dashboard, or Slideshow routes, we don't want the marketing navbar padding
  const isSpecialRoute = pathname && (
    pathname.includes("/slideshow") || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/dashboard")
  );

  return (
    <main className={`min-h-screen ${isSpecialRoute ? "" : "pt-20 sm:pt-24"} bg-[#FAF9F6]`}>
      {children}
    </main>
  );
};
