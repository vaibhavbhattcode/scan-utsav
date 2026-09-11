"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Cpu, Activity, Zap, Play, Square, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AIProcessingPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    status: "offline",
    queueLength: 0,
    processedToday: 0,
    avgProcessingTime: "--"
  });

  const fetchMetrics = () => {
    fetch("/api/admin/ai")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.metrics) {
          setMetrics(data.metrics);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
    // Poll every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
              AI Processing Engine <Cpu className="w-6 h-6 text-blue-500" />
            </h1>
            <p className="text-sm text-slate-500 font-medium">Manage the Python face-matching worker queues.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-700">
            <Settings2 className="w-4 h-4 mr-2" /> Configure
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Play className="w-4 h-4 mr-2" /> Start Workers
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-sm font-bold">Worker Status</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 capitalize flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            {metrics.status}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-sm font-bold">Queue Length</span>
            <Square className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.queueLength}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-sm font-bold">Processed Today</span>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.processedToday} <span className="text-sm font-medium text-slate-400">images</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-sm font-bold">Avg. Speed</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.avgProcessingTime} <span className="text-sm font-medium text-slate-400">/ face</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
        <Cpu className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="font-medium text-slate-700">The AI Processing Queue is currently idle.</p>
        <p className="text-sm mt-2">New uploads will be processed here automatically.</p>
      </div>
    </div>
  );
}