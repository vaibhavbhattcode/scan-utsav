import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { sendContactNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, category = "host", message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message required" }, { status: 400 });
    }

    // Persist inquiry in AuditLog
    await AuditLog.create({
      requestId: "req_contact_" + Date.now(),
      installationId: "inst_contact",
      userEmail: email,
      role: "guest",
      action: "CONTACT_INQUIRY_SUBMITTED",
      ipAddress: "127.0.0.1",
      details: `[${category.toUpperCase()}] ${name}: ${message.slice(0, 100)}`,
    });

    // Send email: notify admin + acknowledgment to user
    const emailResult = await sendContactNotificationEmail({ name, email, category, message });
    console.log("Contact emails sent:", emailResult);

    return NextResponse.json({ success: true, message: "Inquiry received! We'll reply within 2 hours." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit inquiry" }, { status: 500 });
  }
}
