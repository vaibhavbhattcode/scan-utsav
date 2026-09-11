import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateTokens } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security";

export async function authenticateGoogleUser(token: string, clientIp = "unknown") {
  const rate = checkRateLimit(clientIp, "auth_google", 10, 60_000);
  if (!rate.allowed) {
    throw new Error("Too many Google auth attempts. Please wait a minute.");
  }

  if (!token || typeof token !== "string") {
    throw new Error("Google token is required");
  }

  // Never accept mock / demo tokens
  if (token.startsWith("mock_") || token.includes("scanutsav_2026")) {
    throw new Error("Invalid Google token");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Google Sign-In is not configured (GOOGLE_CLIENT_ID missing)");
  }

  await connectDB();

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    throw new Error("Invalid or expired Google token");
  }

  const payload = await res.json();
  const aud = payload.aud || payload.azp;
  if (aud !== clientId) {
    throw new Error("Google token audience mismatch");
  }
  if (payload.email_verified === "false" || payload.email_verified === false) {
    throw new Error("Google email is not verified");
  }

  const email = payload.email;
  const name = payload.name || "Google User";
  const googleId = payload.sub;

  if (!email) {
    throw new Error("Google account email not provided");
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name,
      role: "host",
      authProvider: "google",
      googleId,
      subscriptionPlan: "trial",
    });
  } else if (user.isBlocked) {
    throw new Error("This account has been blocked. Contact support.");
  } else if (!user.googleId && googleId) {
    user.googleId = googleId;
    user.authProvider = user.authProvider || "google";
    await user.save();
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role || "host",
    name: user.name || "User",
  };

  const tokens = generateTokens(tokenPayload);
  return { user: tokenPayload, tokens };
}
