"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Plus, Tv, Share2, ArrowUpRight, X, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { StorageQuotaMeter } from "@/components/dashboard/StorageQuotaMeter";

interface HostEventItem {
  id: string;
  title: string;
  code: string;
  eventType: string;
  mediaCount: number;
  status: "Live" | "Upcoming" | "Ended";
  coverImage: string;
  isUploadDisabled?: boolean;
  isPasswordProtected?: boolean;
  autoApproveMedia?: boolean;
}

export default function HostEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<HostEventItem[]>([]);
  const [stats, setStats] = useState({ usedMB: 0, userPlan: "starter", eventLimit: 3, totalEvents: 0 });
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Create Event Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [autoApproveMedia, setAutoApproveMedia] = useState(true);
  const [creating, setCreating] = useState(false);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (showCreateModal || editingEventId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCreateModal, editingEventId]);

  // Load events and stats from MongoDB API on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((res) => res.json()),
      fetch("/api/dashboard/stats").then((res) => res.json()),
    ])
      .then(([eventsData, statsData]) => {
        if (eventsData.success && eventsData.events) {
          const mapped = eventsData.events.map((e: any) => ({
            id: e._id,
            title: e.title,
            code: e.code,
            eventType: e.eventType || "wedding",
            mediaCount: e.mediaCount || 0,
            status: "Live" as const,
            coverImage: e.coverImage || "",
            isUploadDisabled: Boolean(e.isUploadDisabled),
            isPasswordProtected: Boolean(e.isPasswordProtected),
            autoApproveMedia: e.autoApproveMedia !== false,
          }));
          setEvents(mapped);
        }
        if (statsData.success && statsData.stats) {
          setStats({
            usedMB: statsData.stats.usedMB || 0,
            userPlan: statsData.stats.userPlan || "starter",
            eventLimit: statsData.stats.eventLimit || 3,
            totalEvents: statsData.stats.totalEvents || 0,
          });
        }
      })
      .catch((err) => console.warn("Events load warning:", err))
      .finally(() => setLoadingEvents(false));
  }, []);

  const copyGuestLink = (code: string) => {
    const url = `${window.location.origin}/e/${code}`;
    navigator.clipboard.writeText(url);
    showToast("Guest album link copied to clipboard!", "success");
  };

  const handleToggleUploads = async (evt: HostEventItem) => {
    const nextState = !evt.isUploadDisabled;
    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: evt.id, isUploadDisabled: nextState }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update upload status");
      setEvents((prev) =>
        prev.map((e) => (e.id === evt.id ? { ...e, isUploadDisabled: nextState } : e))
      );
      showToast(
        nextState
          ? `Uploads paused for "${evt.title}". Guests can view photos but cannot upload.`
          : `Uploads resumed for "${evt.title}". Guests can now upload photos & videos.`,
        nextState ? "info" : "success"
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update event", "error");
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Delete event "${title}" and all its media records?`)) return;
    try {
      const res = await fetch(`/api/events?eventId=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setStats((s) => ({ ...s, totalEvents: Math.max(0, s.totalEvents - 1) }));
      showToast("Event deleted", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete event", "error");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setEventTitle(title);
    if (!eventCode || eventCode === eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setEventCode(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventCode) {
      showToast("Event title and custom URL code are required", "error");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        title: eventTitle,
        code: eventCode.toLowerCase().trim(),
        eventType,
        isPasswordProtected,
        password: isPasswordProtected && password ? password : undefined,
        autoApproveMedia,
      };

      const url = "/api/events";
      const method = editingEventId ? "PATCH" : "POST";
      if (editingEventId) {
        (payload as any).eventId = editingEventId;
      } else {
        (payload as any).coverImage = "https://images.unsplash.com/photo-1519741497674-611481863552?w=500";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (editingEventId ? "Event update failed" : "Event creation failed"));
      }

      if (editingEventId) {
        setEvents(events.map(ev => ev.id === editingEventId ? { ...ev, title: data.event.title, code: data.event.code, isPasswordProtected: data.event.isPasswordProtected, autoApproveMedia: data.event.autoApproveMedia } : ev));
        showToast(`Event "${eventTitle}" updated successfully!`, "success");
      } else {
        const newEvt: HostEventItem = {
          id: data.event._id || `evt_${Date.now()}`,
          title: data.event.title,
          code: data.event.code,
          eventType: data.event.eventType || "wedding",
          mediaCount: 0,
          status: "Live",
          coverImage: data.event.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=500",
          isPasswordProtected: data.event.isPasswordProtected,
          autoApproveMedia: data.event.autoApproveMedia,
        };
        setEvents([newEvt, ...events]);
        setStats((s) => ({ ...s, totalEvents: s.totalEvents + 1 }));
        showToast(`Event "${eventTitle}" created successfully! QR code ready.`, "success");
      }
      
      handleCloseModal();
    } catch (err: any) {
      showToast(err.message || "Failed to save event", "error");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (evt: HostEventItem) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventCode(evt.code);
    setEventType(evt.eventType || "wedding");
    setIsPasswordProtected(!!evt.isPasswordProtected);
    setAutoApproveMedia(evt.autoApproveMedia !== false);
    setPassword("");
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingEventId(null);
    setEventTitle("");
    setEventCode("");
    setPassword("");
    setIsPasswordProtected(false);
    setAutoApproveMedia(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-14 sm:pt-16 pb-12 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2810C]">Host Dashboard</span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">Event Management Desk</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {stats.totalEvents}/{stats.eventLimit} events on your <span className="font-bold text-slate-700">{stats.userPlan}</span> plan
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            if (stats.totalEvents >= stats.eventLimit) {
              showToast(`Your ${stats.userPlan} plan allows ${stats.eventLimit} events. Upgrade in Billing.`, "error");
              return;
            }
            setShowCreateModal(true);
          }}
          className="shrink-0 shadow-md bg-[#F2810C] hover:bg-[#D97706] text-white border border-[#F2810C] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </Button>
      </div>

      {/* Storage Quota Progress Meter */}
      <StorageQuotaMeter usedMB={stats.usedMB} plan={stats.userPlan} />

      {/* Events Grid */}
      {loadingEvents ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 bg-slate-200 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-[#F2810C] mx-auto flex items-center justify-center border border-amber-300">
            <QrCode className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 font-display">No Events Created Yet</h3>
            <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
              Create your first celebration event to generate live QR standees, guest upload links, and 4K TV streams.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="bg-[#F2810C] hover:bg-[#D97706] text-white font-extrabold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Event</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div key={evt.id} className="glass-card rounded-3xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200">
                <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                  {evt.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg font-display">{evt.title}</h3>
                <p className="text-xs text-slate-600 font-medium">Code: <span className="text-[#F2810C] font-mono font-bold">{evt.code}</span></p>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl text-xs border border-slate-200">
                <span className="text-slate-600 font-medium">Memories Captured</span>
                <span className="font-bold text-amber-800 text-sm">{evt.mediaCount} Photos</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="glass" size="sm" onClick={() => copyGuestLink(evt.code)} className="w-full bg-slate-100 text-slate-800 border border-slate-300 font-bold">
                  <Share2 className="w-3.5 h-3.5" /> Link
                </Button>
                <Link href="/dashboard/uploads" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-slate-800 border-slate-300 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Moderation Desk
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href={`/e/${evt.code}/slideshow`} target="_blank" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-slate-800 border-slate-300 font-bold">
                    <Tv className="w-3.5 h-3.5 text-[#F2810C]" /> TV Stream
                  </Button>
                </Link>
                <Link href={`/e/${evt.code}`} target="_blank" className="block w-full">
                  <Button variant="primary" size="sm" className="w-full bg-[#F2810C] hover:bg-[#D97706] text-white font-bold">
                    <span>Memory Wall</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => handleToggleUploads(evt)}
                className={`w-full text-xs font-extrabold py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  evt.isUploadDisabled
                    ? "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200"
                    : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                {evt.isUploadDisabled ? "⏸️ Uploads Paused (Tap to Resume)" : "✅ Uploads Active (Tap to Pause)"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(evt)}
                  className="w-1/2 text-[11px] font-bold text-slate-600 hover:text-slate-800 py-1.5 bg-slate-100 rounded-lg"
                >
                  Edit Event
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                  className="w-1/2 text-[11px] font-bold text-rose-600 hover:text-rose-700 py-1.5 bg-rose-50 rounded-lg"
                >
                  Delete Event
                </button>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {(showCreateModal || editingEventId) && (
        <div className="fixed inset-0 z-[9999] !mt-0 !top-0 !left-0 !right-0 !bottom-0 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans my-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-[#F2810C] border border-amber-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">{editingEventId ? "Edit Celebration Event" : "Create Celebration Event"}</h3>
                  <p className="text-xs text-slate-500 font-medium">Generate live QR album and guest memory link.</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya & Vikram's Sangeet"
                  value={eventTitle}
                  onChange={handleTitleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#F2810C] font-semibold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Custom URL Code (QR Album Link)</label>
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden px-3 py-2 text-slate-600 font-mono">
                  <span className="text-slate-400 select-none">scanutsav.com/e/</span>
                  <input
                    type="text"
                    placeholder="ananya-sangeet-2026"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    required
                    className="flex-1 bg-transparent text-slate-900 focus:outline-none font-bold font-mono pl-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Event Category</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#F2810C] font-semibold"
                  >
                    <option value="wedding">Wedding / Sangeet</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="ganesh-chaturthi">Festival / Utsav</option>
                    <option value="corporate">Corporate Event</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Auto-Approve Uploads</label>
                  <button
                    type="button"
                    onClick={() => setAutoApproveMedia(!autoApproveMedia)}
                    className={`w-full p-2.5 rounded-xl border font-bold flex items-center justify-between transition-colors ${autoApproveMedia ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-700 border-slate-300"}`}
                  >
                    <span>{autoApproveMedia ? "Auto Approve (ON)" : "Manual Moderation"}</span>
                    <CheckCircle2 className={`w-4 h-4 ${autoApproveMedia ? "text-emerald-600" : "text-slate-400"}`} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPasswordProtected}
                    onChange={(e) => setIsPasswordProtected(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 accent-[#F2810C]"
                  />
                  <span className="text-slate-800 font-bold">Protect Event Album with Passcode</span>
                </label>

                {isPasswordProtected && (
                  <input
                    type="password"
                    placeholder="Enter 4-Digit Passcode (e.g. 1234)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={isPasswordProtected}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#F2810C] font-mono font-bold tracking-widest"
                  />
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="glass"
                  size="md"
                  onClick={handleCloseModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={creating}
                  className="bg-[#F2810C] hover:bg-[#D97706] text-white font-extrabold shadow-md"
                >
                  {creating ? "Saving..." : (editingEventId ? "Save Changes" : "Create Event & QR")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
