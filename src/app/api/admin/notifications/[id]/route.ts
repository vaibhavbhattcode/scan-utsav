import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PlatformNotification from "@/models/PlatformNotification";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    await connectDB();
    
    const notification = await PlatformNotification.findByIdAndUpdate(
      params.id,
      { isActive: body.isActive },
      { new: true }
    );
    
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    await PlatformNotification.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
