import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { requireAuth } from "@/lib/apiAuth";
import { createCouponSchema } from "@/lib/validators";

export async function GET(req: Request) {
  // Enforce Super Admin authorization for listing coupons
  const auth = requireAuth(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Enforce Super Admin authorization for creating coupons
  const auth = requireAuth(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const body = await req.json();

    const validation = createCouponSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { code, discountPercent, validUntil, maxUses } = validation.data;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      maxUses: maxUses || 100,
      currentUses: 0,
      active: true,
    });

    return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}
