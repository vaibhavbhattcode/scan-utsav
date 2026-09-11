import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import OTPVerification from "@/models/OTPVerification";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    // Verify OTP
    const otpRecord = await OTPVerification.findOne({ email, type: "reset" });
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      return NextResponse.json({ error: "Incorrect verification code" }, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { passwordHash } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the used OTP
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
