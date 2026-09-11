import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    // Get top storage consumers
    const users = await User.find({ storageUsedMB: { $gt: 0 } })
      .sort({ storageUsedMB: -1 })
      .limit(100)
      .select("name email storageUsedMB subscriptionPlan role");

    return NextResponse.json({ success: true, consumers: users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
