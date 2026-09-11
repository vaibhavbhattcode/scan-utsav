import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PlatformNotification from "@/models/PlatformNotification";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const notifications = await PlatformNotification.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    await connectDB();
    
    const notification = await PlatformNotification.create({
      title: body.title,
      message: body.message,
      type: body.type || "info",
      isActive: true,
      targetAudience: body.targetAudience || "all"
    });
    
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
