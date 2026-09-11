"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, ShieldAlert, Sparkles, Filter, CheckCircle2, Search, Image as ImageIcon, Film, Trash2, LayoutGrid, Grid, Download, ZoomIn, ZoomOut, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import JSZip from "jszip";
import { canAccessFeature } from "@/lib/permissions";

interface ModerationMediaItem {
  id: string;
  uploader: string;
  wish: string;
  url: string;
  type: "image" | "video";
  aiFlag: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  eventId: string;
}

export default function ModerationGridPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ModerationMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostPlan, setHostPlan] = useState<string>("trial");

  // Event Selection State
  const [events, setEvents] = useState<{id: string; title: string; code: string}[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  // Layout, Filter & Lightbox Zoom State
  const [layoutMode, setLayoutMode] = useState<"grid" | "masonry">("grid");
  const [selectedMedia, setSelectedMedia] = useState<ModerationMediaItem | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  const [sortOrderFilter, setSortOrderFilter] = useState<"newest" | "oldest" | "today">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUploads = () => {
    fetch("/api/media?status=all")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.media) {
          const mapped = data.media.map((m: any) => ({
            id: m._id,
            uploader: m.uploaderName || "Guest",
            wish: m.wishMessage || "",
            url: m.mediaUrl,
            type: m.mediaType || "image",
            aiFlag: false,
            status: m.status || "approved",
            createdAt: m.createdAt || new Date().toISOString(),
            eventId: m.eventId,
          }));
          setItems(mapped);
        }
      })
      .catch((err) => console.warn("Failed to load moderation uploads:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setHostPlan(data.user.userPlan || "trial");
        }
      })
      .catch(() => {});

    // Load host's events for the event selector
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.events) {
          setEvents(data.events.map((e: any) => ({ id: e._id, title: e.title, code: e.code })));
          if (data.events.length === 1) {
            setSelectedEventId(data.events[0]._id);
          }
        }
      })
      .catch(() => {});
    fetchUploads();
  }, []);

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm("Permanently delete this photo/video from your event and free up storage?")) return;
    setItems((prev) => prev.filter((item) => item.id !== mediaId));

    try {
      const res = await fetch(`/api/media?mediaId=${mediaId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Photo deleted permanently. Storage updated.", "success");
      } else {
        fetchUploads();
        showToast(data.error || "Failed to delete photo", "error");
      }
    } catch {
      fetchUploads();
    }
  };

  const handleUpdateStatus = async (mediaId: string, status: "approved" | "rejected") => {
    setItems((prev) => prev.map((item) => (item.id === mediaId ? { ...item, status } : item)));

    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Memory ${status === "approved" ? "approved for live stream" : "rejected"}`, "success");
      } else {
        fetchUploads();
      }
    } catch (err) {
      fetchUploads();
    }
  };

  const handleApproveAll = async () => {
    const pending = items.filter((i) => i.status === "pending");
    setItems((prev) => prev.map((item) => ({ ...item, status: "approved" })));

    for (const item of pending) {
      await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id, status: "approved" }),
      }).catch(() => {});
    }
    showToast("All pending guest memories approved!", "success");
  };

  // Filtered List Computation
  const filteredItems = items
    .filter((item) => {
      // 0. Event Filter
      if (selectedEventId !== "all" && item.eventId !== selectedEventId) {
        // Find the event code for this ID to also match old records which used code instead of ID
        const event = events.find(e => e.id === selectedEventId);
        if (item.eventId !== event?.code) {
          return false;
        }
      }

      // 1. Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // 2. Media Type Filter
      if (mediaTypeFilter === "image" && item.type !== "image") return false;
      if (mediaTypeFilter === "video" && item.type !== "video") return false;

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.uploader.toLowerCase().includes(q);
        const matchWish = item.wish.toLowerCase().includes(q);
        if (!matchName && !matchWish) return false;
      }

      // 4. Date Filter (Today Only)
      if (sortOrderFilter === "today") {
        const today = new Date().toDateString();
        const created = new Date(item.createdAt).toDateString();
        if (today !== created) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrderFilter === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const pendingItems = items.filter((i) => i.status === "pending");
  const wishbookEventId = selectedEventId !== "all" ? selectedEventId : (events[0]?.code || events[0]?.id || "");

  const handleBulkDownloadZip = async () => {
    if (filteredItems.length === 0) {
      showToast("No media items available for bulk download", "info");
      return;
    }

    setDownloadingZip(true);
    showToast(`Preparing ZIP archive for ${filteredItems.length} item(s)...`, "info");

    try {
      const zip = new JSZip();
      const folder = zip.folder("ScanUtsav_Event_Archive");

      for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i];
        try {
          const res = await fetch(item.url);
          const blob = await res.blob();
          const ext = item.type === "video" ? "mp4" : "jpg";
          const safeName = `${i + 1}_${item.uploader.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
          folder?.file(safeName, blob);
        } catch {
          console.warn(`Failed to fetch media ${item.id} for zip`);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `ScanUtsav_Album_Archive_${Date.now()}.zip`;
      link.click();
      showToast("ZIP Archive Downloaded Successfully!", "success");
    } catch (err: any) {
      console.error("ZIP Generation Error:", err);
      showToast("Failed to create ZIP package", "error");
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Moderation Desk</span>
            <h1 className="text-3xl font-black text-slate-900 font-display">Live Guest Upload Queue</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canAccessFeature(hostPlan, "zip-download") ? (
            <Button
              variant="glass"
              size="sm"
              disabled={downloadingZip}
              onClick={handleBulkDownloadZip}
              className="border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold shadow-sm"
            >
              <FileArchive className="w-4 h-4 text-purple-600" />
              <span>{downloadingZip ? "Zipping..." : `Bulk Download ZIP (${filteredItems.length})`}</span>
            </Button>
          ) : (
            <Link href="/dashboard/billing">
              <Button variant="glass" size="sm" className="border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold shadow-sm opacity-60">
                <FileArchive className="w-4 h-4 text-purple-600" />
                <span>Upgrade for ZIP Archive</span>
              </Button>
            </Link>
          )}

          <a href={wishbookEventId ? `/api/export/wishbook?eventId=${wishbookEventId}` : "#"} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold shadow-sm">
              <span>📖 Print Guest Wishbook</span>
            </Button>
          </a>

          {canAccessFeature(hostPlan, "moderation-desk") && pendingItems.length > 0 && (
            <Button variant="primary" size="sm" onClick={handleApproveAll} className="bg-[#F2810C] hover:bg-[#D97706] text-white font-bold shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve All Pending ({pendingItems.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Event Selector + Multi-Filter Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Event Selector */}
        {events.length > 1 && (
          <select
            value={selectedEventId}
            onChange={(e: any) => setSelectedEventId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F2810C] min-w-[160px]"
          >
            <option value="all">All Events</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.title}</option>
            ))}
          </select>
        )}
        {/* Search Bar */}
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

        {/* Filter Pills & Dropdown */}
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

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {canAccessFeature(hostPlan, "moderation-desk") ? (
              <>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === "pending" ? "bg-[#F2810C] text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Pending ({pendingItems.length})
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === "approved" ? "bg-[#F2810C] text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setStatusFilter("rejected")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === "rejected" ? "bg-rose-600 text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Rejected
                </button>
              </>
            ) : (
              <button
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all bg-[#F2810C] text-white shadow-sm font-black"
              >
                All Uploads (Trial)
              </button>
            )}
            {canAccessFeature(hostPlan, "moderation-desk") && (
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === "all" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                All
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMediaTypeFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${mediaTypeFilter === "all" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-600"}`}
            >
              All
            </button>
            <button
              onClick={() => setMediaTypeFilter("image")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${mediaTypeFilter === "image" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-600"}`}
            >
              <ImageIcon className="w-3 h-3" /> Photos
            </button>
            <button
              onClick={() => setMediaTypeFilter("video")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${mediaTypeFilter === "video" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-600"}`}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-slate-200 bg-white shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 font-display">No Uploads Match Your Filter</h3>
          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
            {searchQuery || mediaTypeFilter !== "all" || sortOrderFilter === "today"
              ? "Try adjusting your search query or media type filters above."
              : "No pending guest uploads right now. New guest memories will stream here in real-time."}
          </p>
        </div>
      ) : (
        <div className={layoutMode === "masonry" ? "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {filteredItems.map((item) => (
            <div key={item.id} className={`glass-card rounded-2xl overflow-hidden border border-slate-200 space-y-3 p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow ${layoutMode === "masonry" ? "break-inside-avoid mb-6" : ""}`}>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                {item.type === "video" ? (
                  <video src={item.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="Upload" className="w-full h-full object-cover" />
                )}

                {item.status === "approved" && (
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    Approved
                  </span>
                )}

                {item.status === "rejected" && (
                  <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    Rejected
                  </span>
                )}

                {item.aiFlag && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <ShieldAlert className="w-3 h-3" /> AI Flagged
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.uploader}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {item.wish && <p className="text-[11px] text-slate-600 italic mt-0.5">"{item.wish}"</p>}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleDeleteMedia(item.id)}
                  title="Delete permanently to free storage"
                  className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-700 border border-slate-300 transition-all col-span-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {item.status === "approved" ? (
                  <button
                    onClick={() => handleUpdateStatus(item.id, "rejected")}
                    className="col-span-2 py-2 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Move to Rejected
                  </button>
                ) : item.status === "rejected" ? (
                  <button
                    onClick={() => handleUpdateStatus(item.id, "approved")}
                    className="col-span-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Re-Approve Photo
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(item.id, "rejected")}
                      className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all bg-rose-50 text-rose-800 hover:bg-rose-100 border-rose-200"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, "approved")}
                      className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
