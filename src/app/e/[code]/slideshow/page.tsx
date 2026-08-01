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
  const eventCode = (params?.code as string) || "demo-event";

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
          generateQRCodeDataUrl(`https://scanutsav.com/e/${eventCode}`, {
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
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-emeraldWarm animate-ping" />
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-marigold-400">LIVE VENUE STREAM</div>
            <h2 className="text-sm font-bold text-white">{eventData?.title || "Event Live Stream"}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className="p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-marigold-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-5 h-5 text-gold-400" />
          </button>
        </div>
      </div>

      {/* Slide Display Canvas with Ken-Burns pan/zoom effect */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {currentSlide ? (
          <div className="relative w-full h-full flex items-center justify-center p-8">
            {currentSlide.mediaType === "video" ? (
              <video
                src={currentSlide.mediaUrl}
                autoPlay
                loop
                muted={muted}
                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/10"
              />
            ) : (
              <img
                key={currentSlide._id}
                src={currentSlide.mediaUrl}
                alt={currentSlide.uploaderName}
                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-1000"
              />
            )}

            {/* Overlaid Wish Card */}
            <div className="absolute bottom-12 left-12 max-w-lg bg-black/75 backdrop-blur-2xl p-6 rounded-3xl border border-gold-500/30 shadow-2xl space-y-2 text-left animate-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>SHARED BY {currentSlide.uploaderName}</span>
              </div>
              {currentSlide.wishMessage && (
                <p className="text-white text-base font-serif italic leading-relaxed">
                  "{currentSlide.wishMessage}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-marigold-500/20 text-marigold-400 mx-auto flex items-center justify-center border border-marigold-500/30 animate-pulse">
              <Tv className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white font-display">Waiting for live guest uploads...</h3>
            <p className="text-xs text-slate-400">Scan the QR code in the corner to share your photos!</p>
          </div>
        )}
      </div>

      {/* Floating Corner QR Scan Target */}
      <div className="absolute bottom-8 right-8 z-30 bg-black/80 backdrop-blur-2xl p-4 rounded-3xl border border-marigold-500/40 shadow-2xl text-center space-y-2 pointer-events-auto">
        {qrUrl ? (
          <img src={qrUrl} alt="Scan to Upload" className="w-32 h-32 object-contain rounded-2xl mx-auto border-2 border-white" />
        ) : (
          <div className="w-32 h-32 bg-slate-900 animate-pulse rounded-2xl" />
        )}
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-marigold-400">
          SCAN TO UPLOAD
        </div>
        <div className="text-[9px] text-slate-400 font-medium">ADD YOUR PHOTOS LIVE</div>
      </div>
    </div>
  );
}
