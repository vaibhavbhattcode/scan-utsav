import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";
import { exportEventToGoogleDrive } from "@/lib/google-drive";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const auth = requireAuth(req, ["host", "super_admin"]);
  if (auth.response || !auth.user) {
    return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const dbUser = await User.findById(auth.user.userId);
    const userPlan = dbUser?.subscriptionPlan || "royal";

    const mediaList = await Media.find({ eventId });

    const exportResult = await exportEventToGoogleDrive(
      event._id.toString(),
      event.title,
      mediaList.map((m) => ({ mediaUrl: m.mediaUrl, uploaderName: m.uploaderName })),
      userPlan
    );

    if (!exportResult.success) {
      return NextResponse.json({ error: exportResult.error }, { status: 403 });
    }

    writeAuditLog({
      action: "google_drive_export",
      userEmail: auth.user.email,
      role: auth.user.role,
      status: 200,
      details: `Exported ${exportResult.exportedCount} media items to Google Drive for event ${eventId}`,
    });

    return NextResponse.json({
      success: true,
      folderUrl: exportResult.folderUrl,
      exportedCount: exportResult.exportedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Google Drive Export failed" }, { status: 500 });
  }
}
