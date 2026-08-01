"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Camera, Sparkles, UploadCloud, Heart, ShieldCheck, Search,
  UserCheck, X, RefreshCw, FolderUp, ExternalLink, CheckCircle2, Mic
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  const activeGalleryList = faceMatches !== null
    ? mediaList.filter((m) => faceMatches.some((match) => match.mediaId === m._id))
    : mediaList;

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
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans" style={{ paddingBottom: "180px" }}>
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
                <div key={m._id} className="rounded-2xl overflow-hidden border border-slate-200 group relative shadow-md bg-white">
                  {m.mediaType === "video" ? (
                    <video src={m.mediaUrl} controls className="w-full h-48 object-cover" />
                  ) : (
                    <img
                      src={m.mediaUrl}
                      alt={m.uploaderName}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
    </div>
  );
}
