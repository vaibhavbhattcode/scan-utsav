import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    
    // In a real AI worker queue, you'd query Redis or RabbitMQ here.
    // For this implementation, we approximate it by looking at media statuses.
    
    // Count pending media
    const queueLength = await Media.countDocuments({ status: "pending" });
    
    // Count processed media today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const processedToday = await Media.countDocuments({ 
      status: { $in: ["approved", "rejected"] },
      updatedAt: { $gte: startOfDay }
    });

    const metrics = {
      status: queueLength > 500 ? "busy" : "online",
      queueLength,
      processedToday,
      avgProcessingTime: "1.2s" // Mocked average
    };

    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
