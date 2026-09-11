"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  targetAudience: "all" | "hosts" | "agencies";
}

export const PlatformBroadcastBanner = ({ userRole }: { userRole: string }) => {
  const [broadcasts, setBroadcasts] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Attempt to load dismissed broadcasts from local storage
    try {
      const saved = localStorage.getItem("scanutsav_dismissed_broadcasts");
      if (saved) setDismissed(JSON.parse(saved));
    } catch (e) {}

    fetch("/api/public/broadcasts")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.broadcasts) {
          // Filter by audience
          const relevant = data.broadcasts.filter((b: Notification) => {
            if (b.targetAudience === "all") return true;
            if (b.targetAudience === "hosts" && userRole === "host") return true;
            if (b.targetAudience === "agencies" && userRole === "agency") return true;
            return false;
          });
          setBroadcasts(relevant);
        }
      })
      .catch(console.error);
  }, [userRole]);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    try {
      localStorage.setItem("scanutsav_dismissed_broadcasts", JSON.stringify(newDismissed));
    } catch (e) {}
  };

  const activeBroadcasts = broadcasts.filter(b => !dismissed.includes(b._id));

  if (activeBroadcasts.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 mb-6">
      {activeBroadcasts.map((broadcast) => {
        let bg = "bg-indigo-50 border-indigo-200 text-indigo-900";
        let iconColor = "text-indigo-500";
        
        if (broadcast.type === "warning") {
          bg = "bg-amber-50 border-amber-200 text-amber-900";
          iconColor = "text-amber-500";
        } else if (broadcast.type === "error") {
          bg = "bg-red-50 border-red-200 text-red-900";
          iconColor = "text-red-500";
        } else if (broadcast.type === "success") {
          bg = "bg-emerald-50 border-emerald-200 text-emerald-900";
          iconColor = "text-emerald-500";
        }

        return (
          <div key={broadcast._id} className={`flex items-start p-4 rounded-xl border ${bg} shadow-sm relative pr-12 transition-all`}>
            <Megaphone className={`w-5 h-5 mt-0.5 mr-3 shrink-0 ${iconColor}`} />
            <div>
              <h4 className="font-bold text-sm mb-1">{broadcast.title}</h4>
              <p className="text-xs opacity-90">{broadcast.message}</p>
            </div>
            <button 
              onClick={() => handleDismiss(broadcast._id)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
