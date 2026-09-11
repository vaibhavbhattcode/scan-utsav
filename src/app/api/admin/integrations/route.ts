import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuthFresh } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuthFresh(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();

    // Check environment variables for live integrations
    const razorpayActive = !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
    const awsActive = !!process.env.AWS_REGION && !!process.env.AWS_ACCESS_KEY_ID;
    const googleActive = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const cloudinaryActive = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    return NextResponse.json({
      success: true,
      integrations: {
        razorpay: razorpayActive,
        aws: awsActive,
        google: googleActive,
        cloudinary: cloudinaryActive
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}
