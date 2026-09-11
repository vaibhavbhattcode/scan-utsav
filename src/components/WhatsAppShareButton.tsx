"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface WhatsAppShareButtonProps {
  eventTitle?: string;
  eventCode?: string;
  mediaUrl?: string;
  uploaderName?: string;
  wishMessage?: string;
  className?: string;
}

export function WhatsAppShareButton({
  eventTitle = "Event Memory Wall",
  eventCode = "",
  mediaUrl,
  uploaderName,
  wishMessage,
  className = "",
}: WhatsAppShareButtonProps) {
  const handleWhatsAppShare = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://scanutsav.com";
    const guestUrl = `${origin}/e/${eventCode}`;

    let messageText = `✨ View live memory album for *${eventTitle}* on ScanUtsav! 🎉\n\n`;

    if (uploaderName && uploaderName !== "Guest") {
      messageText += `📸 Photo uploaded by: *${uploaderName}*\n`;
    }
    if (wishMessage) {
      messageText += `💬 Wish: "${wishMessage}"\n`;
    }
    if (mediaUrl) {
      messageText += `🖼️ Media: ${mediaUrl}\n\n`;
    }

    messageText += `👉 View full 4K album & share your own photos here:\n${guestUrl}`;

    const encodedMsg = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleWhatsAppShare}
      className={`px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shadow-md transition-all border border-emerald-500 ${className}`}
      title="Share directly to WhatsApp Chat & Status"
    >
      <Share2 className="w-3.5 h-3.5" />
      <span>Share to WhatsApp</span>
    </button>
  );
}
