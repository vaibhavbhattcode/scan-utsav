import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Media from "@/models/Media";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    
    // 1. Find all events owned by this user
    const events = await Event.find({ hostId: params.userId });
    const eventIds = events.map(e => e._id.toString());
    
    // 2. Delete all media belonging to these events
    // In production, you would also wipe these from Cloudinary via API
    await Media.deleteMany({ eventId: { $in: eventIds } });

    // 3. Reset user's storage consumption
    const user = await User.findByIdAndUpdate(params.userId, { storageUsedMB: 0 }, { new: true });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
