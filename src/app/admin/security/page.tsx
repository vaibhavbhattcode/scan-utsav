"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldAlert, Key, Globe, Plus, Trash2, Smartphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function SecurityPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enforce2FA: false,
    ipWhitelist: [] as string[]
  });
  const [newIp, setNewIp] = useState("");

  const fetchSettings = () => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings({
            enforce2FA: data.settings.enforce2FA || false,
            ipWhitelist: data.settings.ipWhitelist || []
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (updatedSettings: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        showToast("Security settings updated", "success");
        setSettings(updatedSettings);
      }
    } catch (error) {
      showToast("Failed to save security settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggle2FA = () => {
    handleSave({ ...settings, enforce2FA: !settings.enforce2FA });
  };

  const addIp = () => {
    if (!newIp) return;
    const updated = { ...settings, ipWhitelist: [...settings.ipWhitelist, newIp] };
    handleSave(updated);
    setNewIp("");
  };

  const removeIp = (ipToRemove: string) => {
    const updated = { ...settings, ipWhitelist: settings.ipWhitelist.filter(ip => ip !== ipToRemove) };
    handleSave(updated);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading security settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
              Security Center <ShieldAlert className="w-6 h-6 text-red-500" />
            </h1>
            <p className="text-sm text-slate-500 font-medium">Manage 2FA, API access, and IP whitelisting.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Security */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Key className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900">Authentication</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Enforce 2FA <Smartphone className="w-4 h-4 text-slate-400" />
              </p>
              <p className="text-xs text-slate-500 mt-1">Require Two-Factor Auth for all Studio/Enterprise agency accounts.</p>
            </div>
            <div 
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.enforce2FA ? 'bg-indigo-500' : 'bg-slate-300'} ${saving ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={toggle2FA}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${settings.enforce2FA ? 'left-6' : 'left-0.5'}`}></div>
            </div>
          </div>
        </div>

        {/* Network Security */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Globe className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Network Security</h2>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Admin Panel IP Whitelist</label>
            <p className="text-xs text-slate-500 mb-3">If empty, access is allowed from anywhere. Add IPs to restrict access to the Admin Dashboard.</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="e.g. 192.168.1.1" 
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
              <Button onClick={addIp} disabled={saving || !newIp} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {settings.ipWhitelist.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No IPs whitelisted. Open access.
                </div>
              ) : (
                settings.ipWhitelist.map(ip => (
                  <div key={ip} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="text-sm font-mono text-slate-700">{ip}</span>
                    <Button variant="glass" size="sm" className="text-red-500 hover:bg-red-50 h-8 px-2" onClick={() => removeIp(ip)} disabled={saving}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}