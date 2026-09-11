import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Subscription from "@/models/Subscription";
import { requireAuthFresh } from "@/lib/apiAuth";

function generateCSV(data: any[], fields: string[]) {
  const header = fields.join(",");
  const rows = data.map(row => {
    return fields.map(fieldName => {
      let value = row[fieldName];
      if (value === null || value === undefined) value = "";
      if (typeof value === "string") {
        // Escape quotes and wrap in quotes
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });
  return [header, ...rows].join("\n");
}

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    let csvData = "";
    let filename = "";

    switch (type) {
      case "users":
        const users = await User.find().lean();
        csvData = generateCSV(users, ["_id", "name", "email", "role", "storageUsedMB", "createdAt"]);
        filename = "users_export.csv";
        break;
      case "events":
        const events = await Event.find().lean();
        csvData = generateCSV(events, ["_id", "title", "code", "hostId", "eventType", "createdAt"]);
        filename = "events_export.csv";
        break;
      case "financials":
        const subscriptions = await Subscription.find().populate("userId", "name email").lean();
        const formattedSubs = subscriptions.map((s: any) => ({
          _id: s._id,
          userName: s.userId?.name || "Unknown",
          userEmail: s.userId?.email || "Unknown",
          planId: s.planId,
          status: s.status,
          amountPaid: s.razorpayPaymentId ? "Paid" : "Pending",
          createdAt: s.createdAt
        }));
        csvData = generateCSV(formattedSubs, ["_id", "userName", "userEmail", "planId", "status", "amountPaid", "createdAt"]);
        filename = "financials_export.csv";
        break;
      case "storage":
        const storageUsers = await User.find({ storageUsedMB: { $gt: 0 } }).sort({ storageUsedMB: -1 }).lean();
        csvData = generateCSV(storageUsers, ["_id", "name", "email", "storageUsedMB"]);
        filename = "storage_export.csv";
        break;
      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
