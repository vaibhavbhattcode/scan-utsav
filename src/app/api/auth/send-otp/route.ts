import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import OTPVerification from "@/models/OTPVerification";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: "Email and type are required" }, { status: 400 });
    }

    await connectDB();

    // Verify user exists if this is a password reset
    if (type === "reset") {
      const user = await User.findOne({ email });
      if (!user) {
        // Return success even if user doesn't exist to prevent email enumeration attacks
        return NextResponse.json({ success: true, message: "If an account exists, an OTP was sent." });
      }
      if (user.authProvider === "google") {
        return NextResponse.json({ error: "This account was created with Google. Please use Google Sign-In." }, { status: 400 });
      }
    }

    const code = generateCode();
    // Valid for 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60000);

    // Delete existing OTPs for this email and type
    await OTPVerification.deleteMany({ email, type });

    await OTPVerification.create({
      email,
      code,
      type,
      expiresAt,
    });

    // Simulated Email Sending
    console.log(`\n==============================================`);
    console.log(`📧 [SIMULATED EMAIL TO: ${email}]`);
    console.log(`🔒 Your ScanUtsav ${type} OTP is: ${code}`);
    console.log(`⏱️ This code will expire in 10 minutes.`);
    console.log(`==============================================\n`);

    return NextResponse.json({ success: true, message: "OTP sent successfully (Check server console)" });
  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
