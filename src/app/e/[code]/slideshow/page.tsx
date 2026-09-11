"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QrCode, Tv, Heart, Sparkles, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { generateQRCodeDataUrl } from "@/lib/qr-service";

interface MediaItem {
  _id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  uploaderName: string;
  wishMessage: string;
  createdAt: string;
}

export default function LiveVenueSlideshow() {
  const params = useParams();
  const eventCode = params?.code as string;

  const [eventData, setEventData] = useState<any>(null);
  const [slides, setSlides] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  // 1. Fetch Event metadata & generate floating Corner QR Code
  useEffect(() => {
    fetch(`/api/events?code=${eventCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.event) {
          setEventData(data.event);
          fetchApprovedMedia(data.event._id);
          const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://scanutsav.com");
          generateQRCodeDataUrl(`${origin}/e/${eventCode}`, {
            colorDark: "#F2810C",
            colorLight: "#ffffff",
            width: 300,
          }).then((url) => setQrUrl(url));
        }
      })
      .catch(() => {});
  }, [eventCode]);

  // 2. Poll approved media every 6 seconds for instant TV stream updates
  const fetchApprovedMedia = (idOrCode?: string) => {
    const query = idOrCode ? `eventId=${idOrCode}&eventCode=${eventCode}` : `eventCode=${eventCode}`;
    fetch(`/api/media?${query}&status=approved`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.media && data.media.length > 0) {
          setSlides(data.media);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchApprovedMedia(eventData?._id);
    const interval = setInterval(() => {
      fetchApprovedMedia(eventData?._id);
    }, 6000);
    return () => clearInterval(interval);
  }, [eventData, eventCode]);

  // 3. Auto slide rotation every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="fixed inset-0 bg-[#0a0807] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 z-30 flex items-center justify-between pointer-events-auto gap-2">
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-white/10 shadow-2xl max-w-[65%] min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] sm:text-xs uppercase font-extrabold tracking-widest text-[#F2810C] truncate">LIVE VENUE STREAM</div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate">{eventData?.title || "Event Live Stream"}</h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 sm:p-3 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2810C]" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 sm:p-3 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Slide Display Canvas with Ken-Burns pan/zoom effect */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {currentSlide ? (
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-8">
            {currentSlide.mediaType === "video" ? (
              <video
                src={currentSlide.mediaUrl}
                autoPlay
                loop
                muted={muted}
                className="max-w-full max-h-[82vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10"
              />
            ) : (
              <img
                key={currentSlide._id}
                src={currentSlide.mediaUrl}
                alt={currentSlide.uploaderName}
                className="max-w-full max-h-[82vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-1000"
              />
            )}

            {/* Overlaid Wish Card (Responsive positioning) */}
            <div className="absolute bottom-3 left-3 sm:bottom-8 sm:left-8 max-w-[calc(100%-120px)] sm:max-w-md bg-black/80 backdrop-blur-2xl p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-500/30 shadow-2xl space-y-1 text-left animate-in slide-in-from-bottom-5 duration-700 z-20">
              <div className="flex items-center gap-1.5 text-[#F2810C] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">SHARED BY {currentSlide.uploaderName}</span>
              </div>
              {currentSlide.wishMessage && (
                <p className="text-white text-xs sm:text-base font-serif italic leading-snug line-clamp-2">
                  "{currentSlide.wishMessage}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2810C]/20 text-[#F2810C] mx-auto flex items-center justify-center border border-[#F2810C]/30 animate-pulse">
              <Tv className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">Waiting for live guest uploads...</h3>
            <p className="text-xs text-slate-400">Scan the QR code in the corner to share your photos!</p>
          </div>
        )}
      </div>

      {/* Floating Corner QR Scan Target (Responsive sizing) */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-30 bg-black/85 backdrop-blur-2xl p-2 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-[#F2810C]/40 shadow-2xl text-center space-y-1 pointer-events-auto">
        {qrUrl ? (
          <img src={qrUrl} alt="Scan to Upload" className="w-20 h-20 sm:w-28 sm:h-28 object-contain rounded-xl sm:rounded-2xl mx-auto border-2 border-white" />
        ) : (
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-slate-900 animate-pulse rounded-xl sm:rounded-2xl" />
        )}
        <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#F2810C]">
          SCAN TO UPLOAD
        </div>
        <div className="text-[8px] sm:text-[9px] text-slate-400 font-medium hidden sm:block">ADD YOUR PHOTOS LIVE</div>
      </div>
    </div>
  );
}
