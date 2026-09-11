"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Settings, Save, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    defaultStorageQuotaGB: 2,
    forcePasswordProtection: false,
    maintenanceMode: false,
    superAdminRecoveryEmail: "admin@scanutsav.com"
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast("Global settings updated successfully", "success");
      }
    } catch (error) {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            Global Settings <Settings className="w-6 h-6 text-slate-700" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Manage platform-wide configuration and security defaults.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 max-w-3xl">
        <div className="space-y-8">
          
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Platform Defaults</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Default Storage Quota (GB)</label>
                <input 
                  type="number" 
                  value={settings.defaultStorageQuotaGB}
                  onChange={(e) => setSettings({ ...settings, defaultStorageQuotaGB: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#F2810C] outline-none" 
                />
                <p className="text-xs text-slate-500 mt-1">Default limit for new free-tier hosts.</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Force Password Protection</p>
                  <p className="text-xs text-slate-500">Require all new events to have a 4-digit PIN.</p>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.forcePasswordProtection ? 'bg-[#F2810C]' : 'bg-slate-300'}`}
                  onClick={() => setSettings({ ...settings, forcePasswordProtection: !settings.forcePasswordProtection })}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${settings.forcePasswordProtection ? 'left-6' : 'left-0.5'}`}></div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Security & Maintenance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">Disables all public uploads and shows a maintenance screen.</p>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-300'}`}
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${settings.maintenanceMode ? 'left-6' : 'left-0.5'}`}></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Super Admin Recovery Email</label>
                <input 
                  type="email" 
                  value={settings.superAdminRecoveryEmail} 
                  onChange={(e) => setSettings({ ...settings, superAdminRecoveryEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#F2810C] outline-none" 
                />
              </div>
            </div>
          </section>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <Button className="bg-[#F2810C] hover:bg-[#d6720b] text-white px-8" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Configuration</>}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}