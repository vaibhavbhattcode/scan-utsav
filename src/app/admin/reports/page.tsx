"use client";

import React, { useState } from "react";
import { ArrowLeft, FileSpreadsheet, Download, Users, Calendar, IndianRupee, HardDrive } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (reportName: string) => {
    setDownloading(reportName);
    
    // Simulate a slight delay for UI feedback, then trigger download
    setTimeout(() => {
      window.open(`/api/admin/export?type=${reportName}`, "_blank");
      setDownloading(null);
    }, 1000);
  };

  const reports = [
    { id: "users", name: "User Directory Export", description: "Complete list of all registered hosts, agencies, and guests.", icon: Users, color: "text-blue-500" },
    { id: "events", name: "Active Events Report", description: "All ongoing and past events with their QR codes and host details.", icon: Calendar, color: "text-purple-500" },
    { id: "financials", name: "Financial Transactions", description: "All Razorpay orders, subscriptions, and addon purchases.", icon: IndianRupee, color: "text-emerald-500" },
    { id: "storage", name: "Storage Audit", description: "Media consumption per user and event in GBs.", icon: HardDrive, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            Data Reports <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Export platform data to CSV for external analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {reports.map(report => {
          const Icon = report.icon;
          const isDownloading = downloading === report.id;
          return (
            <div key={report.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${report.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{report.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{report.description}</p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-slate-900 hover:bg-black text-white" 
                onClick={() => handleDownload(report.id)}
                disabled={isDownloading || downloading !== null}
              >
                {isDownloading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Generating CSV...
                  </span>
                ) : (
                  <span className="flex items-center"><Download className="w-4 h-4 mr-2" /> Download Report (.csv)</span>
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  );
}