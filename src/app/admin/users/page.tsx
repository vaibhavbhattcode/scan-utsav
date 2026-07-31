"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Shield, Check, Lock, Search, Filter, Ban, ShieldCheck, RefreshCw, Download } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

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
}

export default function UserRBACManager() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);

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
                <option value="free">Free Utsav</option>
                <option value="royal">Royal Utsav</option>
                <option value="grand">Grand Enterprise</option>
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
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Subscription Plan</th>
                  <th className="p-4">Security Status</th>
                  <th className="p-4 text-right">Actions</th>
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
                      <td className="p-4 font-bold text-slate-900 uppercase">{u.subscriptionPlan}</td>
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
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => toggleUserBlock(u)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
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
    </div>
  );
}
