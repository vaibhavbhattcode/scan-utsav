"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Shield, Check, Lock, Search, Filter, Ban, ShieldCheck, RefreshCw, Download, Sparkles, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const ADDON_CATALOG = [
  { id: "ai_highlight", name: "AI Highlight Video", amountINR: 299, desc: "Auto-generated 60s reel of top moments" },
  { id: "ai_face", name: "AI Face Recognition", amountINR: 499, desc: "Let guests find all their photos instantly" },
  { id: "white_label", name: "White-label Branding", amountINR: 999, desc: "Remove all ScanUtsav logos" },
  { id: "custom_web", name: "Custom Event Website", amountINR: 499, desc: "Dedicated page for your event memories" },
  { id: "custom_qr", name: "Custom QR Stand Design", amountINR: 149, desc: "Professionally designed print files" },
  { id: "extended_retention", name: "Extended Retention", amountINR: 299, desc: "Keep memories alive for 6 extra months" },
  { id: "guest_book", name: "Guest Book PDF", amountINR: 199, desc: "Download all wishes in a printable book" },
  { id: "premium_support", name: "Premium Support", amountINR: 299, desc: "Dedicated 24/7 WhatsApp assistance" },
];

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "host" | "guest";
  subscriptionPlan: string;
  storageUsedMB?: number;
  isBlocked?: boolean;
  blockedIp?: string;
  createdAt?: string;
  authProvider?: string;
  googleId?: string;
}

export default function UserRBACManager() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);

  // Add-ons Modal State
  const [addonsUser, setAddonsUser] = useState<UserRecord | null>(null);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [processingAddon, setProcessingAddon] = useState<string | null>(null);

  // Fetch live users from API/DB
  const fetchUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}&role=${selectedRole}&plan=${selectedPlan}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users || []);
        } else {
          showToast(data.error || "Failed to load users", "error");
        }
      })
      .catch(() => showToast("Error connecting to users service", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedPlan]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleUserBlock = async (user: UserRecord) => {
    const nextStatus = !user.isBlocked;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          isBlocked: nextStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`User ${user.email} is now ${nextStatus ? "BLOCKED 🚫" : "UNBLOCKED ✅"}`, "info");
        fetchUsers();
      } else {
        showToast(data.error || "Failed to update block status", "error");
      }
    } catch (err) {
      showToast("Error updating user block status", "error");
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Role updated to ${newRole.toUpperCase()}`, "success");
        fetchUsers();
      } else {
        showToast(data.error || "Role update failed", "error");
      }
    } catch (err) {
      showToast("Error updating user role", "error");
    }
  };

  const updatePlan = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscriptionPlan: newPlan }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Subscription plan updated to ${newPlan.toUpperCase()}`, "success");
        fetchUsers();
      } else {
        showToast(data.error || "Plan update failed", "error");
      }
    } catch (err) {
      showToast("Error updating subscription plan", "error");
    }
  };

  const openAddonsModal = async (user: UserRecord) => {
    setAddonsUser(user);
    setEventsLoading(true);
    try {
      const res = await fetch(`/api/events?hostId=${user._id}`);
      const data = await res.json();
      if (data.success) {
        setUserEvents(data.events || []);
      } else {
        showToast(data.error || "Failed to load events", "error");
      }
    } catch {
      showToast("Error fetching events", "error");
    } finally {
      setEventsLoading(false);
    }
  };

  const grantAddon = async (eventId: string, addonId: string) => {
    setProcessingAddon(`${eventId}-${addonId}`);
    try {
      const res = await fetch("/api/admin/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, addonId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        // Refresh events to show updated purchasedAddons
        if (addonsUser) openAddonsModal(addonsUser);
      } else {
        showToast(data.error || "Failed to grant add-on", "error");
      }
    } catch {
      showToast("Error granting add-on", "error");
    } finally {
      setProcessingAddon(null);
    }
  };

  const exportUsersCSV = () => {
    if (users.length === 0) {
      showToast("No user records to export", "info");
      return;
    }
    const headers = ["Name", "Email", "Role", "Subscription Plan", "Security Status"];
    const rows = users.map(u => [
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      u.subscriptionPlan,
      u.isBlocked ? "BLOCKED" : "ACTIVE"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ScanUtsav_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                ADMIN SECURITY CONTROL
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mt-1">
                User Management & IP Blocking Desk
              </h1>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportUsersCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name/email..."
                  className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="host">Host</option>
                <option value="guest">Guest</option>
              </select>

              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
              >
                <option value="all">All Plans</option>
                <option value="trial">Free Trial</option>
                <option value="lite">Lite</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="ultimate">Ultimate</option>
                <option value="creator">Creator Agency</option>
                <option value="studio">Studio Agency</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <button
                type="button"
                onClick={fetchUsers}
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </form>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold uppercase tracking-wider w-1/4">User Profile</th>
                  <th className="p-4 font-bold uppercase tracking-wider w-1/5">Access Level</th>
                  <th className="p-4 font-bold uppercase tracking-wider w-1/5">Plan & Auth</th>
                  <th className="p-4 font-bold uppercase tracking-wider w-1/6">Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Loading user accounts...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No user accounts found matching your filters.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{u.email}</div>
                        {u.createdAt && (
                          <div className="text-[10px] text-slate-400 mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-white ${
                            u.role === "super_admin" ? "text-amber-900 border-amber-300 bg-amber-50" :
                            u.role === "host" ? "text-amber-700 border-amber-300 bg-amber-50" :
                            "text-slate-600 border-slate-200"
                          }`}
                        >
                          <option value="host">HOST</option>
                          <option value="super_admin">SUPER ADMIN</option>
                          <option value="guest">GUEST</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.subscriptionPlan}
                          onChange={(e) => updatePlan(u._id, e.target.value)}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#F2810C]"
                        >
                          <option value="trial">Free Trial</option>
                          <option value="lite">Lite</option>
                          <option value="standard">Standard</option>
                          <option value="premium">Premium</option>
                          <option value="ultimate">Ultimate</option>
                          <option value="creator">Creator Agency</option>
                          <option value="studio">Studio Agency</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <div className="mt-2 text-[10px] font-bold uppercase flex items-center gap-1">
                          {u.authProvider === "google" ? (
                            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Google Auth</span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Email Auth</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                            <Ban className="w-3 h-3" /> BLOCKED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openAddonsModal(u)}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-black transition-all bg-[#F2810C] hover:bg-[#D97706] text-white border border-[#D97706] inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Add-ons
                        </button>
                        <button
                          onClick={() => toggleUserBlock(u)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all inline-flex items-center gap-1 ${
                            u.isBlocked
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600"
                              : "bg-rose-600 hover:bg-rose-700 text-white border border-rose-600"
                          }`}
                        >
                          {u.isBlocked ? "Unblock Account" : "Block User"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Add-ons Manager Modal */}
      {addonsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F2810C]" /> Manage Add-ons
                </h3>
                <p className="text-sm text-slate-500 mt-1">Granting features to {addonsUser.email}</p>
              </div>
              <button
                onClick={() => setAddonsUser(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {eventsLoading ? (
                <div className="text-center py-12 text-slate-500 font-medium animate-pulse">
                  Loading user events...
                </div>
              ) : userEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-medium">
                  This user has not created any events yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {userEvents.map((event) => {
                    const purchasedIds = event.purchasedAddons?.map((a: any) => a.addonId) || [];
                    return (
                      <div key={event._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-slate-900 text-base">{event.title}</h4>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase">
                            {event.code}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ADDON_CATALOG.map((addon) => {
                            const isPurchased = purchasedIds.includes(addon.id);
                            return (
                              <div
                                key={addon.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border ${
                                  isPurchased ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
                                }`}
                              >
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{addon.name}</div>
                                  <div className="text-[10px] text-slate-500">{addon.desc}</div>
                                </div>
                                {isPurchased ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                                    <CheckCircle2 className="w-3 h-3" /> GRANTED
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => grantAddon(event._id, addon.id)}
                                    disabled={processingAddon === `${event._id}-${addon.id}`}
                                    className="px-3 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-[#F2810C] hover:text-white hover:border-[#F2810C] text-slate-700 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
                                  >
                                    {processingAddon === `${event._id}-${addon.id}` ? "Granting..." : "Grant"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
