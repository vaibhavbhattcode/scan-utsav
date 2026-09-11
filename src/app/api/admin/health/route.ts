import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { requireAuthFresh } from "@/lib/apiAuth";
import { cloudinary } from "@/lib/cloudinary";
import os from "os";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  const results = {
    mongodb: { status: "degraded", ping: "0ms" },
    cloudinary: { status: "degraded", ping: "0ms" },
    redis: { status: "operational", ping: "N/A (Disabled)" } // Simplified for this environment
  };

  try {
    // 1. Check MongoDB
    const mongoStart = Date.now();
    await connectDB();
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const pingRes = await mongoose.connection.db.admin().ping();
      if (pingRes?.ok === 1) {
        results.mongodb = { status: "operational", ping: `${Date.now() - mongoStart}ms` };
      }
    }

    // 2. Check Cloudinary
    const cldStart = Date.now();
    try {
      // Just check if we can ping the API
      const cldRes = await cloudinary.api.ping();
      if (cldRes.status === "ok") {
        results.cloudinary = { status: "operational", ping: `${Date.now() - cldStart}ms` };
      }
    } catch (e) {
      results.cloudinary = { status: "degraded", ping: "timeout" };
    }

    // 3. Node.js Process Stats
    const memoryUsage = process.memoryUsage();
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    const cpuUsagePercent = Math.min(100, Math.round((loadAvg[0] / cpuCount) * 100));
    
    const uptimeSecs = os.uptime();
    const days = Math.floor(uptimeSecs / 86400);
    const hours = Math.floor((uptimeSecs % 86400) / 3600);

    const stats = {
      cpuUsagePercent,
      processRssMB: Math.round(memoryUsage.rss / 1024 / 1024),
      uptime: `${days}d ${hours}h`
    };

    return NextResponse.json({ success: true, systems: results, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
