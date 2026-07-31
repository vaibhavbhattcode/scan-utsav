import React from "react";
import Link from "next/link";
import { HardDrive, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StorageQuotaMeterProps {
  usedMB?: number;
  plan?: string;
}

const PLAN_CAPACITIES_GB: Record<string, number> = {
  free: 1,
  starter: 5,
  royal: 25,
  enterprise: 100,
};

export const StorageQuotaMeter: React.FC<StorageQuotaMeterProps> = ({
  usedMB = 1840, // default ~1.84 GB used
  plan = "royal",
}) => {
  const capacityGB = PLAN_CAPACITIES_GB[plan.toLowerCase()] || 25;
  const capacityMB = capacityGB * 1024;
  const usedGB = (usedMB / 1024).toFixed(2);
  const remainingGB = Math.max(0, capacityGB - usedMB / 1024).toFixed(2);
  const percentUsed = Math.min(100, Math.round((usedMB / capacityMB) * 100));

  // Determine indicator color
  const isHighUsage = percentUsed >= 90;
  const isWarningUsage = percentUsed >= 70 && percentUsed < 90;

  const barColor = isHighUsage
    ? "bg-rose-500"
    : isWarningUsage
    ? "bg-marigold-500"
    : "bg-emeraldWarm";

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200 shadow-sm bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-sans">Event Memory Storage Quota</h4>
            <p className="text-[11px] text-slate-600 font-sans">
              Current Plan: <span className="text-[#F2810C] font-bold uppercase">{plan}</span> ({capacityGB} GB Included)
            </p>
          </div>
        </div>

        <Link href="/dashboard/billing">
          <Button variant="glass" size="sm" className="text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300">
            <span>Manage Storage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-slate-900 font-bold">{usedGB} GB Used</span>
          <span className="text-slate-600 font-medium">{remainingGB} GB Remaining ({percentUsed}%)</span>
        </div>

        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-300">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Usage Warning Banner */}
      {isHighUsage && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Storage is almost full! Upgrade to prevent upload disruptions.</span>
          </div>
          <Link href="/dashboard/billing">
            <span className="font-bold underline text-rose-900">Upgrade Now</span>
          </Link>
        </div>
      )}
    </div>
  );
};
