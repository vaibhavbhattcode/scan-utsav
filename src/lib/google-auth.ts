import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateTokens } from "@/lib/auth";

export async function authenticateGoogleUser(token: string) {
  await connectDB();

  try {
    // Verify Google ID token via Google TokenInfo API
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!res.ok) {
      throw new Error("Invalid Google token");
    }

    const payload = await res.json();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      throw new Error("Google account email not provided");
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name || "Google User",
        role: "host",
        authProvider: "google",
        googleId,
      });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || "host",
      name: user.name || "User",
    };

    const tokens = generateTokens(tokenPayload);
    return { user: tokenPayload, tokens };

  } catch (error: any) {
    console.error("Google auth error:", error);
    throw error;
  }
}
