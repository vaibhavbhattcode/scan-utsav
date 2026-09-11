import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import AddonPurchase from "@/models/AddonPurchase";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const type = searchParams.get("type") || "all";

    let payments: any[] = [];

    if (type === "all" || type === "subscription") {
      const subs = await Subscription.find().sort({ createdAt: -1 }).limit(limit).lean();
      subs.forEach(s => payments.push({ ...s, paymentType: "subscription" }));
    }

    if (type === "all" || type === "addon") {
      const addons = await AddonPurchase.find().sort({ createdAt: -1 }).limit(limit).lean();
      addons.forEach(a => payments.push({ ...a, paymentType: "addon" }));
    }

    // Sort combined
    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Slice to limit
    payments = payments.slice(0, limit);

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
