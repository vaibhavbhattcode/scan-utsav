import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const status = searchParams.get("status") || "all";

    const filter: any = {};
    if (status !== "all") {
      filter.status = status;
    }

    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
