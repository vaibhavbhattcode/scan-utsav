import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: Request) {
  const auth = requireAuth(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const plan = searchParams.get("plan");
    const search = searchParams.get("search");

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    let filter: any = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (plan && plan !== "all") {
      filter.subscriptionPlan = plan;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit) || 1;

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      users,
      page,
      limit,
      totalPages,
      totalUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = requireAuth(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { userId, role, subscriptionPlan, isBlocked, blockedIp } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (auth.user?.role !== "super_admin") {
      return NextResponse.json({ error: "Only super_admin can modify user status or roles" }, { status: 403 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;
    if (typeof isBlocked === "boolean") updateData.isBlocked = isBlocked;
    if (typeof blockedIp === "string") updateData.blockedIp = blockedIp;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    writeAuditLog({
      action: isBlocked !== undefined ? (isBlocked ? "user_blocked" : "user_unblocked") : "user_updated",
      userEmail: auth.user.email,
      role: auth.user.role,
      status: 200,
      details: `Updated user ${userId}: blocked=${isBlocked}, role=${role}, plan=${subscriptionPlan}, ip=${blockedIp}`,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
