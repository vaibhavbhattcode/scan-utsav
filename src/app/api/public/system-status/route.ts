import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GlobalSettings from "@/models/GlobalSettings";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectDB();
    const settings: any = await GlobalSettings.findOne().lean();
    if (!settings) {
      return NextResponse.json({ success: true, maintenanceMode: false });
    }

    // Check if the current user is a super_admin. 
    // If they are, we always tell the client maintenance is false so they aren't blocked.
    let isSuperAdmin = false;
    const token = cookies().get("scanutsav_token")?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_for_development_only_12345") as any;
        if (decoded.role === "super_admin") {
          isSuperAdmin = true;
        }
      } catch (err) {
        // invalid token, ignore
      }
    }

    return NextResponse.json({ 
      success: true, 
      maintenanceMode: isSuperAdmin ? false : !!settings.maintenanceMode,
      // We don't expose IP whitelist here for security reasons, it will be checked server-side
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
