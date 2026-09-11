import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GlobalSettings from "@/models/GlobalSettings";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const body = await req.json();
    
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create(body);
    } else {
      settings = await GlobalSettings.findOneAndUpdate({}, body, { new: true });
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
