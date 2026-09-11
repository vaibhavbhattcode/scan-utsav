import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Media from "@/models/Media";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventIdParam = searchParams.get("eventId") || searchParams.get("id") || searchParams.get("code");

    await connectDB();

    if (!eventIdParam) {
      return NextResponse.json({ error: "eventId or code parameter required" }, { status: 400 });
    }

    let event: any = await Event.findOne({ code: eventIdParam }).lean();
    if (!event && eventIdParam.length === 24) {
      event = await Event.findById(eventIdParam).lean();
    }

    if (!event) {
      event = {
        _id: eventIdParam,
        title: "ScanUtsav Event Keepsake Wishbook",
        code: eventIdParam,
        hostId: "host",
      };
    }

    const eventCode = event.code || eventIdParam;
    const eventObjId = event._id?.toString() || eventIdParam;

    // Fetch media items only for this specific event
    const mediaList = await Media.find({
      eventId: { $in: [eventIdParam, eventCode, eventObjId] },
    })
      .sort({ createdAt: 1 })
      .lean();

    const finalMedia = mediaList;

    const wishes = finalMedia
      .filter((m) => m.wishMessage && m.wishMessage.trim().length > 0)
      .map((m) => ({
        uploaderName: m.uploaderName || "Event Guest",
        wishMessage: m.wishMessage,
        photoUrl: m.mediaUrl,
        date: new Date(m.createdAt || Date.now()).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));

    // Generate Printable HTML Wishbook Template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Keepsake Wishbook — ${event.title}</title>
        <style>
          body { font-family: 'Playfair Display', Georgia, serif; background: #FAF9F6; color: #1e293b; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 900; color: #0f172a; }
          .logo span { color: #F2810C; }
          .title { font-size: 24px; margin-top: 10px; color: #0f172a; font-weight: bold; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .wish-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; page-break-inside: avoid; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .wish-header { font-weight: 700; color: #F2810C; font-size: 16px; margin-bottom: 8px; }
          .wish-text { font-style: italic; color: #334155; font-size: 15px; line-height: 1.6; font-family: serif; }
          .wish-date { font-size: 11px; color: #94a3b8; margin-top: 12px; font-family: sans-serif; }
          .photo { max-width: 280px; max-height: 280px; border-radius: 12px; margin-top: 14px; object-fit: cover; }
          .empty-box { text-align: center; padding: 60px 20px; background: #fff; border-radius: 20px; border: 1px border-slate-200; }
          @media print {
            body { padding: 0; background: #fff; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 12px 24px; background: #F2810C; color: white; font-weight: bold; border: none; border-radius: 10px; cursor: pointer; font-size: 14px;">
            🖨️ Print / Save as PDF Wishbook
          </button>
        </div>
        <div class="header">
          <div class="logo">Scan<span>Utsav</span></div>
          <div class="title">${event.title}</div>
          <div class="subtitle">Guest Memory Keepsake Wishbook • ${wishes.length} Guest Wishes Collected</div>
        </div>
        ${
          wishes.length === 0
            ? `<div class="empty-box">
                <h3 style="margin:0; font-size:20px; color:#0f172a;">No Guest Wishes Collected Yet</h3>
                <p style="color:#64748b; font-size:14px; margin-top:8px;">When guests scan your event QR code and type a message with their photo, their wishes will automatically populate in this printable wishbook!</p>
              </div>`
            : wishes
                .map(
                  (w) => `
              <div class="wish-card">
                <div class="wish-header">✨ Message from ${w.uploaderName}</div>
                <div class="wish-text">"${w.wishMessage}"</div>
                ${w.photoUrl ? `<img src="${w.photoUrl}" class="photo" alt="Memory Photo" />` : ""}
                <div class="wish-date">Received on ${w.date}</div>
              </div>
            `
                )
                .join("")
        }
      </body>
      </html>
    `;

    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to export wishbook" }, { status: 500 });
  }
}
