import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Parse .env manually if process.env values are missing
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const val = valueParts.join("=").trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL;
const INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/scanutsav";

if (!INITIAL_ADMIN_EMAIL || !INITIAL_ADMIN_PASSWORD) {
  console.error("FATAL ERROR: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD missing in environment variables.");
  process.exit(1);
}

// User Schema inline for script isolation
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["super_admin", "host", "guest"], default: "super_admin" },
  subscriptionPlan: { type: String, default: "enterprise" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD!, salt);

    const result = await User.findOneAndUpdate(
      { email: INITIAL_ADMIN_EMAIL },
      {
        name: "Super Admin",
        email: INITIAL_ADMIN_EMAIL,
        passwordHash,
        role: "super_admin",
        subscriptionPlan: "enterprise",
      },
      { upsert: true, new: true }
    );

    console.log("✅ Super Admin user seeded successfully!");
    console.log("   Email:", result.email);
    console.log("   Role :", result.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding super admin:", error);
    process.exit(1);
  }
}

seedAdmin();
