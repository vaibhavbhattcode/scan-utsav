"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Camera, Sparkles, UploadCloud, Heart, ShieldCheck, Search,
  UserCheck, X, RefreshCw, FolderUp, ExternalLink, CheckCircle2, Mic,
  ChevronLeft, ChevronRight, Download, Share2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface MediaItem {
  _id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  uploaderName: string;
  wishMessage: string;
  status?: string;
  createdAt: string;
}

interface FaceMatch {
  mediaId: string;
  mediaUrl: string;
  uploaderName: string;
  wishMessage?: string;
  confidenceScore: number;
}

export default function GuestEventMemoryPage() {
  const params = useParams();
  const eventCode = (params?.code as string) || "demo-event";
  const { showToast } = useToast();

  const [eventData, setEventData] = useState<any>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [guestName, setGuestName] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dpdpConsent, setDpdpConsent] = useState(true);

  // AI Face Recognition Search State
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [scanningFace, setScanningFace] = useState(false);
  const [faceMatches, setFaceMatches] = useState<FaceMatch[] | null>(null);

  // Event Password Protection State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [verifyingPass, setVerifyingPass] = useState(false);

  // Full-Screen Lightbox & Drag-and-Drop States
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeGalleryList = faceMatches !== null
    ? mediaList.filter((m) => faceMatches.some((match) => match.mediaId === m._id))
    : mediaList;

  const currentMediaIndex = selectedMedia
    ? activeGalleryList.findIndex((m) => m._id === selectedMedia._id)
    : -1;

  const handlePrevMedia = () => {
    if (currentMediaIndex > 0) {
      setSelectedMedia(activeGalleryList[currentMediaIndex - 1]);
    } else if (activeGalleryList.length > 0) {
      setSelectedMedia(activeGalleryList[activeGalleryList.length - 1]);
    }
  };

  const handleNextMedia = () => {
    if (currentMediaIndex >= 0 && currentMediaIndex < activeGalleryList.length - 1) {
      setSelectedMedia(activeGalleryList[currentMediaIndex + 1]);
    } else if (activeGalleryList.length > 0) {
      setSelectedMedia(activeGalleryList[0]);
    }
  };

  useEffect(() => {
    fetch(`/api/events?code=${eventCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.event) {
          setEventData(data.event);
          const hasUnlocked = typeof window !== "undefined" && sessionStorage.getItem(`scanutsav_pass_${eventCode}`) === "true";
          if (!data.event.isPasswordProtected || hasUnlocked) {
            setIsUnlocked(true);
            fetchMedia(data.event._id);
          } else {
            setIsUnlocked(false);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [eventCode]);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setVerifyingPass(true);
    try {
      const res = await fetch("/api/events/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventCode, password: passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsUnlocked(true);
        if (typeof window !== "undefined") sessionStorage.setItem(`scanutsav_pass_${eventCode}`, "true");
        showToast("Access Granted! Welcome to the event.", "success");
        if (eventData?._id) fetchMedia(eventData._id);
      } else {
        showToast(data.error || "Incorrect event password", "error");
      }
    } catch (err: any) {
      showToast("Password verification failed", "error");
    } finally {
      setVerifyingPass(false);
    }
  };

  const fetchMedia = (idOrCode: string) => {
    fetch(`/api/media?eventId=${idOrCode}&eventCode=${eventCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.media) {
          setMediaList((prev) => {
            const combined = [...data.media];
            prev.forEach((p) => {
              if (!combined.some((c) => c._id === p._id || c.mediaUrl === p.mediaUrl)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      })
      .finally(() => setLoading(false));
  };

  const processAndUploadFile = async (file: File) => {
    if (!file) return;

    if (!dpdpConsent) {
      showToast("Please accept privacy & DPDP terms before uploading.", "error");
      return;
    }

    // 0ms Instant Local Preview rendering
    const localUrl = URL.createObjectURL(file);
    const isVid = file.type.startsWith("video/");
    const tempId = `temp_${Date.now()}`;
    const tempItem: MediaItem = {
      _id: tempId,
      mediaUrl: localUrl,
      mediaType: isVid ? "video" : "image",
      uploaderName: guestName || "Guest",
      wishMessage: wishMessage || "",
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    setMediaList((prev) => [tempItem, ...prev]);
    setUploading(true);
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventCode", eventData?.code || eventCode);
      formData.append("uploaderName", guestName || "Guest");
      formData.append("wishMessage", wishMessage || "");

      setUploadProgress(60);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Cloudinary upload failed");

      if (data.media) {
        setMediaList((prev) => prev.map((item) => (item._id === tempId ? data.media : item)));
      }

      setUploadProgress(100);
      showToast("Your memory is saved in the event album! 🎉", "success");
      setWishMessage("");
    } catch (err: any) {
      showToast(err.message || "Upload failed.", "error");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAndUploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFileDrag = e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files");
    if (isFileDrag && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type) {
        processAndUploadFile(droppedFile);
      }
    }
  };

  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieFile(file);
    const reader = new FileReader();
    reader.onload = () => setSelfiePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRunFaceSearch = async () => {
    if (!selfiePreview) { showToast("Please upload a selfie image to search", "error"); return; }
    setScanningFace(true);
    try {
      const res = await fetch("/api/media/face-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventData?._id || eventCode, selfieData: selfiePreview }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFaceMatches(data.matches || []);
        showToast(`AI Scan Complete! Found ${data.count} photos featuring you 🎉`, "success");
      } else {
        throw new Error(data.error || "Face search failed");
      }
    } catch (err: any) {
      showToast(err.message || "Face search failed", "error");
    } finally {
      setScanningFace(false);
    }
  };



  if (eventData?.isPasswordProtected && !isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#F2810C] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-black text-white font-sans">
              Scan<span className="text-[#F2810C]">Utsav</span>
            </span>
            <h2 className="text-xl font-bold text-slate-100 font-display">
              {eventData?.title || "Private Event Memory Wall"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              This event is password protected by the host. Please enter the passcode to view photos and share memories.
            </p>
          </div>
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Event Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-center text-sm font-bold tracking-widest placeholder:tracking-normal placeholder-slate-500 focus:outline-none focus:border-[#F2810C]"
              required
            />
            <button
              type="submit"
              disabled={verifyingPass}
              className="w-full py-3 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-sm rounded-xl transition-all shadow-md"
            >
              {verifyingPass ? "Verifying..." : "Unlock Event"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans relative"
      style={{ paddingBottom: "180px" }}
    >
      {/* Event Header Banner */}
      <div className="relative py-10 px-6 bg-gradient-to-b from-amber-50 via-white to-[#FAF9F6] text-center space-y-4 border-b border-slate-200">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
            Scan<span className="text-[#F2810C]">Utsav</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            LIVE CELEBRATION ALBUM
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
          {eventData?.title || "Event Celebration Memory Wall"}
        </h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
          Scan once, upload freely. All photos & videos stream live to the host's 4K album.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setShowFaceModal(true)}
            className="px-5 py-2.5 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-full inline-flex items-center gap-2 shadow-md transition-all border border-[#F2810C]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Find My Photos with AI Selfie</span>
          </button>

          {eventData?.externalDriveUrl && (
            <a
              href={eventData.externalDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-full border border-blue-300 inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <FolderUp className="w-4 h-4 text-blue-600" />
              <span>Upload to Host's Google Drive / Photos</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Media Gallery */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 font-display">
              {faceMatches !== null
                ? `Photos Featuring You (${activeGalleryList.length})`
                : `Live Guest Memories (${mediaList.length})`}
            </h2>
            {faceMatches !== null && (
              <button onClick={() => setFaceMatches(null)} className="text-xs text-[#F2810C] font-bold underline">
                Clear AI Filter
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>LIVE SYNC ACTIVE</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="w-full h-48 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : activeGalleryList.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center border border-amber-300">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {faceMatches !== null ? "No photos found with this selfie" : "Be the first to capture this moment!"}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
              {faceMatches !== null ? "Try a clearer selfie photo." : "Use the upload panel below to share the first memory!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activeGalleryList.map((m) => {
              const matchInfo = faceMatches?.find((f) => f.mediaId === m._id);
              return (
                <div
                  key={m._id}
                  onClick={() => setSelectedMedia(m)}
                  className="rounded-2xl overflow-hidden border border-slate-200 group relative shadow-md bg-white cursor-pointer hover:shadow-xl transition-all duration-200"
                >
                  {m.mediaType === "video" ? (
                    <video src={m.mediaUrl} controls className="w-full h-48 object-cover" />
                  ) : (
                    <img
                      src={m.mediaUrl}
                      alt={m.uploaderName}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                  )}
                  {matchInfo && (
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> {matchInfo.confidenceScore}% Match
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="truncate">{m.uploaderName}</span>
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 flex-shrink-0" />
                    </div>
                    {m.wishMessage && (
                      <p className="text-[10px] text-slate-200 italic line-clamp-1">"{m.wishMessage}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== DRAG & DROP VISUAL OVERLAY ===== */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-amber-500/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center space-y-4 pointer-events-none animate-in fade-in duration-150">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-dashed border-white animate-bounce">
            <UploadCloud className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display">Drop Your Photos or Videos Here!</h2>
          <p className="text-sm font-bold text-amber-100 max-w-sm">
            Release your file anywhere to instantly upload your memory to the live event album! 📸
          </p>
        </div>
      )}

      {/* ===== FIXED BOTTOM UPLOAD BAR ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 print:hidden">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="bg-white border-2 border-amber-300 rounded-2xl shadow-2xl p-4 space-y-3">

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#F2810C] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {/* Name input + Upload button row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Your Name (e.g. Rahul)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#F2810C] font-medium"
              />
              <label className="flex-shrink-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white border shadow-md transition-all ${uploading ? "bg-amber-400 border-amber-400 cursor-wait" : "bg-[#F2810C] hover:bg-[#D97706] border-[#F2810C] cursor-pointer"}`}>
                  <Camera className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {uploading ? `${uploadProgress ?? 0}% Uploading...` : "Upload Memory"}
                  </span>
                </div>
              </label>
            </div>

            {/* Wish message input (optional) */}
            <input
              type="text"
              placeholder="Add a wish or message for the couple... (optional)"
              value={wishMessage}
              onChange={(e) => setWishMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
            />

            {/* DPDP Consent + SSL badge row */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-[#F2810C]"
                />
                <span className="font-medium text-slate-600">DPDP Act 2023 Privacy Consent</span>
              </label>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                SSL Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Face Recognition Modal */}
      {showFaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 relative">
            <button
              onClick={() => setShowFaceModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="text-2xl font-black text-slate-900 font-sans">
                Scan<span className="text-[#F2810C]">Utsav</span>
              </span>
              <h3 className="text-xl font-black text-slate-900 font-display">AI Selfie Photo Search</h3>
              <p className="text-xs text-slate-600 font-medium">
                Upload your selfie to instantly find all event photos that feature your face!
              </p>
            </div>

            <div className="space-y-4">
              {selfiePreview ? (
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-amber-400 shadow-xl">
                  <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                  {scanningFace && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-amber-700 animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <label className="block w-full py-8 border-2 border-dashed border-slate-300 hover:border-[#F2810C] rounded-2xl text-center cursor-pointer bg-slate-50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleSelfieSelect} className="hidden" />
                  <Camera className="w-8 h-8 text-[#F2810C] mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-900 block">Tap to Upload Your Selfie</span>
                  <span className="text-[10px] text-slate-500 block mt-1">PNG, JPG, WEBP supported</span>
                </label>
              )}

              {selfiePreview && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelfiePreview(null); setSelfieFile(null); }}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
                  >
                    Change Selfie
                  </button>
                  <button
                    onClick={handleRunFaceSearch}
                    disabled={scanningFace}
                    className="flex-1 py-2.5 px-5 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#F2810C]"
                  >
                    <Search className="w-4 h-4" />
                    <span>{scanningFace ? "Scanning..." : "Scan Album"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-2 sm:p-6 select-none animate-in fade-in duration-200">
          {/* Close Button */}
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Media Arrow */}
          <button
            onClick={handlePrevMedia}
            className="absolute left-3 sm:left-6 z-40 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Media Arrow */}
          <button
            onClick={handleNextMedia}
            className="absolute right-3 sm:right-6 z-40 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main Media Preview Container */}
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center">
            {selectedMedia.mediaType === "video" ? (
              <video
                src={selectedMedia.mediaUrl}
                controls
                autoPlay
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-slate-800"
              />
            ) : (
              <img
                src={selectedMedia.mediaUrl}
                alt={selectedMedia.uploaderName}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-slate-800"
              />
            )}

            {/* Media Information Bar */}
            <div className="mt-4 w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-white shadow-2xl">
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white truncate">{selectedMedia.uploaderName}</span>
                  <span className="text-[10px] bg-[#F2810C]/20 text-[#F2810C] px-2 py-0.5 rounded-full font-bold">Event Guest</span>
                </div>
                {selectedMedia.wishMessage && (
                  <p className="text-xs text-slate-300 italic truncate">"{selectedMedia.wishMessage}"</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedMedia.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
                  title="Open full size image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Open</span>
                </a>
                <a
                  href={selectedMedia.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${selectedMedia.uploaderName}'s Memory`,
                        url: selectedMedia.mediaUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(selectedMedia.mediaUrl);
                      showToast("Image link copied to clipboard!", "success");
                    }
                  }}
                  className="p-2.5 rounded-xl bg-[#F2810C] hover:bg-[#D97706] text-white transition-colors shadow-md flex items-center gap-1.5 text-xs font-bold"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
