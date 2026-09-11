import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PlatformNotification from "@/models/PlatformNotification";

export async function GET() {
  try {
    await connectDB();
    const broadcasts = await PlatformNotification.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
    return NextResponse.json({ success: true, broadcasts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
