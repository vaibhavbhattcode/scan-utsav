import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
