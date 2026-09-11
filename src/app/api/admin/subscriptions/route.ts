import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const subs = await Subscription.find().sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, subscriptions: subs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
