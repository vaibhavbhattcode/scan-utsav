"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Camera, Sparkles, UploadCloud, Heart, ShieldCheck, Search,
  UserCheck, X, RefreshCw, FolderUp, ExternalLink, CheckCircle2,
  ChevronLeft, ChevronRight, Download, Share2, Filter, Calendar, Film, Image as ImageIcon,
  ZoomIn, ZoomOut, LayoutGrid, Grid, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { getOptimizedThumbnailUrl } from "@/lib/cloudinary-utils";
import { canAccessFeature } from "@/lib/permissions";

// Reaction types
type ReactionType = "love" | "fire" | "party" | "clap";

interface MediaItem {
  _id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  uploaderName: string;
  wishMessage?: string;
  reactions?: Record<string, number>;
  aiProcessingStatus?: "pending" | "processing" | "completed" | "failed";
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
  const eventCode = params?.code as string;
  const { showToast } = useToast();

  const [eventData, setEventData] = useState<any>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [guestName, setGuestName] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [batchStatus, setBatchStatus] = useState<{ current: number; total: number; fileName: string } | null>(null);
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastUploadedCount, setLastUploadedCount] = useState(0);
  const [failedFilesQueue, setFailedFilesQueue] = useState<File[]>([]);
  const activeXhrRef = React.useRef<XMLHttpRequest | null>(null);

  const handleCancelUpload = () => {
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
    }
    setUploading(false);
    setUploadProgress(null);
    setBatchStatus(null);
    showToast("Upload cancelled.", "info");
  };

  // AI Face Recognition Search State
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [scanningFace, setScanningFace] = useState(false);
  const [faceMatches, setFaceMatches] = useState<FaceMatch[] | null>(null);

  // Advanced Filtering & Sorting State
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  const [sortOrderFilter, setSortOrderFilter] = useState<"newest" | "oldest" | "today">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Event Password Protection State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [verifyingPass, setVerifyingPass] = useState(false);

  // Full-Screen Lightbox, Zoom & Layout Mode States
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "masonry">("grid");
  const [isDragging, setIsDragging] = useState(false);

  // Selection Mode & Bulk Action States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const activeGalleryList = faceMatches !== null
    ? mediaList.filter((m) => faceMatches.some((match) => match.mediaId === m._id))
    : mediaList;

  // Handle reactions
  const handleReaction = async (mediaId: string, type: ReactionType) => {
    try {
      // Optimistic UI update
      setMediaList(prev => prev.map(m => {
        if (m._id === mediaId) {
          const newReactions = { ...m.reactions } as Record<string, number>;
          newReactions[type] = (newReactions[type] || 0) + 1;
          return { ...m, reactions: newReactions };
        }
        return m;
      }));
      
      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(prev => {
          if (!prev) return prev;
          const newReactions = { ...prev.reactions } as Record<string, number>;
          newReactions[type] = (newReactions[type] || 0) + 1;
          return { ...prev, reactions: newReactions };
        });
      }

      await fetch("/api/media/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, type })
      });
    } catch (e) {
      console.error("Failed to react", e);
    }
  };

  // Apply User Filters & Sorting
  const filteredGalleryList = activeGalleryList
    .filter((m) => {
      // 1. Media Type Filter
      if (mediaTypeFilter === "image" && m.mediaType !== "image" && m.mediaType) return false;
      if (mediaTypeFilter === "video" && m.mediaType !== "video") return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = m.uploaderName?.toLowerCase().includes(q);
        const matchWish = m.wishMessage?.toLowerCase().includes(q);
        if (!matchName && !matchWish) return false;
      }

      // 3. Date Filter (Today Only)
      if (sortOrderFilter === "today") {
        const today = new Date().toDateString();
        const created = new Date(m.createdAt).toDateString();
        if (today !== created) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // 1. If AI Face Search filter is active, sort by highest confidence match score first
      if (faceMatches !== null) {
        const scoreA = faceMatches.find((fm) => fm.mediaId === a._id || fm.mediaUrl === a.mediaUrl)?.confidenceScore || 0;
        const scoreB = faceMatches.find((fm) => fm.mediaId === b._id || fm.mediaUrl === b.mediaUrl)?.confidenceScore || 0;
        return scoreB - scoreA;
      }

      if (sortOrderFilter === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // Default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const currentMediaIndex = selectedMedia
    ? filteredGalleryList.findIndex((m) => m._id === selectedMedia._id)
    : -1;

  const handlePrevMedia = () => {
    setIsZoomed(false);
    if (currentMediaIndex > 0) {
      setSelectedMedia(filteredGalleryList[currentMediaIndex - 1]);
    } else if (filteredGalleryList.length > 0) {
      setSelectedMedia(filteredGalleryList[filteredGalleryList.length - 1]);
    }
  };

  const handleNextMedia = () => {
    setIsZoomed(false);
    if (currentMediaIndex >= 0 && currentMediaIndex < filteredGalleryList.length - 1) {
      setSelectedMedia(filteredGalleryList[currentMediaIndex + 1]);
    } else if (filteredGalleryList.length > 0) {
      setSelectedMedia(filteredGalleryList[0]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events?code=${eventCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
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
          showToast(data.error || "Event could not be loaded", "error");
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [eventCode]);

  // Live album refresh while guests keep uploading
  useEffect(() => {
    if (!isUnlocked || !eventData?._id) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMedia(eventData._id);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isUnlocked, eventData?._id, eventCode]);

  // Keyboard navigation for lightbox (← → Escape)
  useEffect(() => {
    if (!selectedMedia) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevMedia();
      else if (e.key === "ArrowRight") handleNextMedia();
      else if (e.key === "Escape") setSelectedMedia(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia, currentMediaIndex, filteredGalleryList]);

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
        if (data.success && Array.isArray(data.media)) {
          setMediaList(data.media);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelfiePreview(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunFaceSearch = async () => {
    if (!selfiePreview) return;
    setScanningFace(true);
    try {
      const res = await fetch("/api/media/face-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventData?._id || eventCode,
          selfieData: selfiePreview,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Face search failed", "error");
        return;
      }
      
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        setFaceMatches(data.matches);
        setShowFaceModal(false);
        showToast(`Matched ${data.matches.length} photos with your face!`, "success");
      } else {
        showToast("No matching photos found with your face", "info");
      }
    } catch (err: any) {
      console.error("Face Search Error:", err);
      showToast(err.message || "Face search failed", "error");
    } finally {
      setScanningFace(false);
    }
  };

  const handleZipDownload = async (mediaToDownload: MediaItem[]) => {
    if (mediaToDownload.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      
      const BATCH_SIZE = 5;
      let completed = 0;
      
      for (let i = 0; i < mediaToDownload.length; i += BATCH_SIZE) {
        const batch = mediaToDownload.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (m) => {
          try {
            const res = await fetch(m.mediaUrl);
            const blob = await res.blob();
            const extension = m.mediaType === 'video' ? 'mp4' : 'jpg';
            const filename = `${m.uploaderName || 'Guest'}_${m._id.slice(-6)}.${extension}`;
            zip.file(filename, blob);
          } catch (e) {
            console.error(`Failed to fetch ${m.mediaUrl}`, e);
          }
          completed++;
          setZipProgress(Math.round((completed / mediaToDownload.length) * 100));
        }));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventData?.title || 'Event'}_Photos.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Download complete!", "success");
      setSelectionMode(false);
      setSelectedIds(new Set());
    } catch (err: any) {
      showToast(err.message || "Failed to create ZIP", "error");
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const uploadSingleFile = async (file: File): Promise<any | null> => {
    const isVideo = file.type.startsWith("video");

    if (file.size > 25 * 1024 * 1024 && !isVideo) {
      showToast(`Photo "${file.name}" exceeds 25MB limit`, "error");
      return null;
    }
    if (file.size > 200 * 1024 * 1024 && isVideo) {
      showToast(`Video "${file.name}" exceeds 200MB limit`, "error");
      return null;
    }

    setUploadProgress(5);

    let fileToUpload = file;
    if (!isVideo) {
      const { compressImageClient } = await import("@/lib/client-image-compressor");
      fileToUpload = await compressImageClient(file);
    }

    // 1. Fetch signed upload params from server
    const signRes = await fetch("/api/upload/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventCode,
        resourceType: isVideo ? "video" : "image",
        fileSize: fileToUpload.size,
      }),
    });

    const signData = await signRes.json();
    if (!signRes.ok || !signData.success) {
      throw new Error(signData.error || "Failed to obtain signed upload credentials");
    }

    // 2. Direct XMLHttpRequest upload to Cloudinary CDN with real progress
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", String(signData.timestamp));
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);

    const cdnUploadRes = await new Promise<{ secure_url: string; bytes: number }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      activeXhrRef.current = xhr;
      xhr.open("POST", signData.uploadUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        activeXhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resJson = JSON.parse(xhr.responseText);
            resolve({ secure_url: resJson.secure_url, bytes: resJson.bytes || fileToUpload.size });
          } catch (err) {
            reject(new Error("Invalid Cloudinary CDN response"));
          }
        } else {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        activeXhrRef.current = null;
        reject(new Error("Network error during Cloudinary CDN upload"));
      };
      xhr.onabort = () => {
        activeXhrRef.current = null;
        reject(new Error("Upload cancelled by user"));
      };
      xhr.send(formData);
    });

    // 3. Save media record to DB
    const saveRes = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventCode,
        mediaUrl: cdnUploadRes.secure_url,
        mediaType: isVideo ? "video" : "image",
        uploaderName: guestName || "Event Guest",
        wishMessage: wishMessage || "",
        fileSizeBytes: cdnUploadRes.bytes,
      }),
    });

    const saveData = await saveRes.json();
    if (saveRes.ok && saveData.success && saveData.media) {
      return saveData.media;
    }
    return null;
  };

  const uploadMultipleFiles = async (filesList: FileList | File[]) => {
    if (!dpdpConsent) {
      showToast("Please agree to the DPDP Act Privacy Consent before uploading.", "error");
      return;
    }

    const files = Array.from(filesList);
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    const failedList: File[] = [];

    try {
      const CONCURRENCY_LIMIT = 3;
      let i = 0;
      let cancelled = false;

      const processNext = async (): Promise<void> => {
        if (i >= files.length || cancelled) return;
        const index = i++;
        const file = files[index];
        setBatchStatus({ current: index + 1, total: files.length, fileName: file.name });
        
        try {
          const mediaItem = await uploadSingleFile(file);
          if (mediaItem) {
            successCount++;
            setMediaList((prev) => [mediaItem, ...prev.filter((p) => p._id !== mediaItem._id)]);
          } else {
            failedList.push(file);
          }
        } catch (err: any) {
          if (err.message === "Upload cancelled by user") {
            cancelled = true;
          } else {
            failedList.push(file);
            console.error(`Error uploading file ${index + 1}:`, err);
          }
        }
        await processNext();
      };

      const workers = [];
      for (let w = 0; w < Math.min(CONCURRENCY_LIMIT, files.length); w++) {
        workers.push(processNext());
      }
      await Promise.all(workers);

      if (cancelled) {
        showToast("Batch upload cancelled.", "info");
      }

      setFailedFilesQueue(failedList);

      if (successCount > 0) {
        setLastUploadedCount(successCount);
        setShowSuccessModal(true);
        setWishMessage("");
      }
    } finally {
      setUploading(false);
      setUploadProgress(null);
      setBatchStatus(null);
    }
  };

  const handleRetryFailedUploads = () => {
    if (failedFilesQueue.length > 0) {
      const filesToRetry = [...failedFilesQueue];
      setFailedFilesQueue([]);
      uploadMultipleFiles(filesToRetry);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadMultipleFiles(files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadMultipleFiles(files);
    }
  };

  if (!loading && !eventData) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-black text-slate-900 font-display">Event not found</h1>
          <p className="text-sm text-slate-600 font-medium">
            This event link is invalid or has been removed. Ask the host to share a fresh QR / album link from their dashboard.
          </p>
        </div>
      </div>
    );
  }

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
          {eventData?.hostPlan && canAccessFeature(eventData.hostPlan, "face-search") && (
            <button
              onClick={() => setShowFaceModal(true)}
              className="px-5 py-2.5 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-full inline-flex items-center gap-2 shadow-md transition-all border border-[#F2810C]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find My Photos with AI Selfie</span>
            </button>
          )}

          <WhatsAppShareButton
            eventTitle={eventData?.title}
            eventCode={eventCode}
            className="rounded-full px-5 py-2.5"
          />

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
        {/* Gallery Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 font-display">
              {faceMatches !== null
                ? `Photos Featuring You (${filteredGalleryList.length})`
                : `Live Guest Memories (${filteredGalleryList.length})`}
            </h2>
            {faceMatches !== null && (
              <button onClick={() => setFaceMatches(null)} className="text-xs text-[#F2810C] font-bold underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear AI Filter
              </button>
            )}
            
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds(new Set());
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${selectionMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
            >
              {selectionMode ? 'Cancel Selection' : 'Select Photos'}
            </button>
            
            {selectionMode && selectedIds.size > 0 && (
              <button
                onClick={() => handleZipDownload(filteredGalleryList.filter(m => selectedIds.has(m._id)))}
                disabled={isZipping}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#F2810C] hover:bg-[#D97706] text-white flex items-center gap-1 disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {isZipping ? `Zipping ${zipProgress}%` : `Download (${selectedIds.size})`}
              </button>
            )}
            {!selectionMode && eventData?.hostPlan && canAccessFeature(eventData.hostPlan, "zip-download") && (
              <button
                onClick={() => handleZipDownload(filteredGalleryList)}
                disabled={isZipping}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1 disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {isZipping ? `Zipping ${zipProgress}%` : `Download All`}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>LIVE SYNC ACTIVE</span>
          </div>
        </div>

        {/* Multi-Filters Toolbar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Guest Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name or wish..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
            />
          </div>

          {/* Filter Pills & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Grid vs Masonry View Mode */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLayoutMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${layoutMode === "grid" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                title="Standard Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode("masonry")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${layoutMode === "masonry" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                title="Dynamic Masonry View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setMediaTypeFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${mediaTypeFilter === "all" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-600 hover:text-slate-900"}`}
              >
                All
              </button>
              <button
                onClick={() => setMediaTypeFilter("image")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${mediaTypeFilter === "image" ? "bg-[#F2810C] text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"}`}
              >
                <ImageIcon className="w-3 h-3" /> Photos
              </button>
              <button
                onClick={() => setMediaTypeFilter("video")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${mediaTypeFilter === "video" ? "bg-[#F2810C] text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"}`}
              >
                <Film className="w-3 h-3" /> Videos
              </button>
            </div>

            {/* Sort & Date Selector */}
            <select
              value={sortOrderFilter}
              onChange={(e: any) => setSortOrderFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F2810C]"
            >
              <option value="newest">⚡ Newest First</option>
              <option value="oldest">⌛ Oldest First</option>
              <option value="today">📅 Uploaded Today</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="w-full h-48 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredGalleryList.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center border border-amber-300">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {faceMatches !== null
                ? "No photos found with this selfie"
                : searchQuery || mediaTypeFilter !== "all" || sortOrderFilter === "today"
                ? "No photos match your active filter"
                : "Be the first to capture this moment!"}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
              {faceMatches !== null
                ? "Try a clearer selfie photo."
                : searchQuery || mediaTypeFilter !== "all"
                ? "Try clearing your search query or media filter."
                : "Use the upload panel below to share the first memory!"}
            </p>
          </div>
        ) : (
          <div className={layoutMode === "masonry" ? "columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"}>
            {filteredGalleryList.map((m) => {
              const matchInfo = faceMatches?.find((f) => f.mediaId === m._id);
              const isSelected = selectedIds.has(m._id);
              return (
                <div
                  key={m._id}
                  onClick={() => {
                    if (selectionMode) {
                      const newSelected = new Set(selectedIds);
                      if (isSelected) newSelected.delete(m._id);
                      else newSelected.add(m._id);
                      setSelectedIds(newSelected);
                    } else {
                      setSelectedMedia(m);
                    }
                  }}
                  className={`rounded-2xl overflow-hidden border group relative shadow-md bg-white cursor-pointer hover:shadow-xl transition-all duration-200 ${layoutMode === "masonry" ? "break-inside-avoid mb-4" : ""} ${isSelected ? "border-[#F2810C] ring-4 ring-[#F2810C]/30" : "border-slate-200"}`}
                >
                  {selectionMode && (
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all bg-black/30 backdrop-blur-sm">
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#F2810C] fill-white" />}
                    </div>
                  )}
                  {m.mediaType === "video" ? (
                    <video src={m.mediaUrl} controls className="w-full h-48 object-cover" />
                  ) : (
                    <img
                      src={getOptimizedThumbnailUrl(m.mediaUrl, 600)}
                      alt={m.uploaderName}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                  )}
                  {matchInfo && (
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-md">
                      <UserCheck className="w-3 h-3" /> {matchInfo.confidenceScore}% Match
                    </div>
                  )}
                  {(m.aiProcessingStatus === "pending" || m.aiProcessingStatus === "processing") && !matchInfo && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Loader2 className="w-3 h-3 animate-spin" /> Analyzing Face...
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

            {eventData?.isUploadDisabled ? (
              <div className="text-center py-3 px-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-extrabold flex items-center justify-center gap-2">
                <span>⏸️ New uploads have been paused by the event host. You can still view all shared memories!</span>
              </div>
            ) : (
              <>
                {/* Name input + Upload button row */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Rahul)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#F2810C] font-medium"
                  />
                  {uploading ? (
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-300 transition-colors shadow-sm"
                      title="Cancel upload"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel ({batchStatus ? `${batchStatus.current}/${batchStatus.total} · ` : ""}{uploadProgress ?? 0}%)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {failedFilesQueue.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRetryFailedUploads}
                          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-colors shadow-sm"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#F2810C]" />
                          <span>Retry ({failedFilesQueue.length})</span>
                        </button>
                      )}
                      <label className="flex-shrink-0 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileSelect}
                          disabled={uploading}
                          className="hidden"
                        />
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#F2810C] hover:bg-[#D97706] border border-[#F2810C] shadow-md cursor-pointer transition-all">
                          <Camera className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">Upload Memory</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Wish message input (optional) */}
                <input
                  type="text"
                  placeholder="Add a wish or message... (optional)"
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Face Recognition Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-amber-300 shadow-2xl p-6 text-center space-y-5 relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-amber-100 text-[#F2810C] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 font-display">🎉 Upload Successful!</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Thank you{guestName ? `, ${guestName}` : ""}! Your <span className="font-bold text-[#F2810C]">{lastUploadedCount} memory item(s)</span> have been added to <span className="font-bold text-slate-900">{eventData?.title || "the event"}</span>'s live album.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl shadow-md border border-[#F2810C]"
              >
                Upload More Memories
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  const url = `${origin}/e/${eventCode}`;
                  if (navigator.share) {
                    navigator.share({ title: eventData?.title, url });
                  } else {
                    navigator.clipboard.writeText(url);
                    showToast("Event album link copied!", "success");
                  }
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Share Event Album</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Lightbox Modal */}
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
              <div className="overflow-auto max-h-[75vh] max-w-full flex items-center justify-center">
                <img
                  src={getOptimizedThumbnailUrl(selectedMedia.mediaUrl, 1200)}
                  alt={selectedMedia.uploaderName}
                  draggable={false}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onDragStart={(e) => e.preventDefault()}
                  className={`max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-slate-800 transition-transform duration-300 ${
                    isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                  }`}
                />
              </div>
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
                {selectedMedia.mediaType !== "video" && (
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
                    title={isZoomed ? "Zoom Out" : "Zoom In"}
                  >
                    {isZoomed ? <ZoomOut className="w-4 h-4 text-amber-400" /> : <ZoomIn className="w-4 h-4 text-amber-400" />}
                    <span className="hidden sm:inline">{isZoomed ? "Zoom Out" : "Zoom"}</span>
                  </button>
                )}
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
                <WhatsAppShareButton 
                  eventTitle={eventData?.title}
                  eventCode={eventCode}
                  mediaUrl={selectedMedia.mediaUrl}
                  uploaderName={selectedMedia.uploaderName}
                  wishMessage={selectedMedia.wishMessage}
                  className="!px-2.5 !py-2.5"
                />
              </div>
            </div>

            {/* Reactions Bar */}
            <div className="mt-2 w-full max-w-xl flex items-center justify-center gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-full py-2 shadow-xl">
              {(["love", "fire", "party", "clap"] as ReactionType[]).map((reaction) => {
                const emojis = { love: "❤️", fire: "🔥", party: "🎉", clap: "👏" };
                const count = selectedMedia.reactions?.[reaction] || 0;
                return (
                  <button
                    key={reaction}
                    onClick={() => handleReaction(selectedMedia._id, reaction)}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300"
                  >
                    <span className="text-lg">{emojis[reaction]}</span>
                    {count > 0 && <span className="text-xs font-bold">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
