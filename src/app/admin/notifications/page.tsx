"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Bell, Plus, Trash2, Megaphone, CheckCircle2, AlertTriangle, Info, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: "", message: "", type: "info", targetAudience: "all" });

  const fetchNotifs = () => {
    fetch("/api/admin/notifications")
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.notifications);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleCreate = async () => {
    if (!newNotif.title || !newNotif.message) {
      showToast("Title and message are required", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotif)
      });
      if (res.ok) {
        showToast("Broadcast sent!", "success");
        setNewNotif({ title: "", message: "", type: "info", targetAudience: "all" });
        fetchNotifs();
      }
    } catch (error) {
      showToast("Failed to create broadcast", "error");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) fetchNotifs();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Broadcast deleted", "success");
        fetchNotifs();
      }
    } catch (error) {
      showToast("Failed to delete", "error");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
              Platform Broadcasts <Megaphone className="w-6 h-6 text-indigo-500" />
            </h1>
            <p className="text-sm text-slate-500 font-medium">Push announcements to Hosts and Agencies.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-slate-400" /> New Broadcast
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
              <input 
                type="text" 
                value={newNotif.title}
                onChange={e => setNewNotif({...newNotif, title: e.target.value})}
                placeholder="e.g. Scheduled Maintenance"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
              <textarea 
                value={newNotif.message}
                onChange={e => setNewNotif({...newNotif, message: e.target.value})}
                placeholder="Detailed announcement text..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                <select 
                  value={newNotif.type}
                  onChange={e => setNewNotif({...newNotif, type: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audience</label>
                <select 
                  value={newNotif.targetAudience}
                  onChange={e => setNewNotif({...newNotif, targetAudience: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">Everyone</option>
                  <option value="hosts">Hosts Only</option>
                  <option value="agencies">Agencies Only</option>
                </select>
              </div>
            </div>

            <Button onClick={handleCreate} disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
              {creating ? "Broadcasting..." : "Send Broadcast"}
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading broadcasts...</div>
          ) : notifications.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Active Broadcasts</h3>
              <p className="text-slate-500 mt-1">Create an announcement to push it to your users.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div key={notif._id} className={`bg-white rounded-2xl border ${notif.isActive ? 'border-indigo-200 shadow-sm' : 'border-slate-200 opacity-60'} p-5 flex gap-4 transition-opacity`}>
                <div className="shrink-0 mt-1">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{notif.title}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(notif._id, notif.isActive)} className="text-slate-400 hover:text-indigo-600 transition-colors" title={notif.isActive ? "Deactivate" : "Activate"}>
                        {notif.isActive ? <ToggleRight className="w-6 h-6 text-indigo-500" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button onClick={() => handleDelete(notif._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs font-bold text-slate-400 uppercase">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">Target: {notif.targetAudience}</span>
                    <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}