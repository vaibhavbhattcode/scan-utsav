import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SupportTicket from "@/models/SupportTicket";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
