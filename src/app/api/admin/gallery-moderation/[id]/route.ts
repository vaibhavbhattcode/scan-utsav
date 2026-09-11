import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { action } = await req.json(); // "approve" | "reject"
    
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const media = await Media.findByIdAndUpdate(params.id, { status: newStatus }, { new: true });
    
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    // In a full implementation, we'd also delete from Cloudinary here.
    // Assuming delete from MongoDB is sufficient for MVP
    const media = await Media.findByIdAndDelete(params.id);
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }
    
    // We would need to update User's storage used here ideally.
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
