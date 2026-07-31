import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createEventSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters"),
  code: z.string().min(3, "Event code must be at least 3 characters").regex(/^[a-z0-9-]+$/i, "Code must be alphanumeric with hyphens"),
  eventType: z.string().default("wedding"),
  hostName: z.string().optional(),
  eventDate: z.string().optional(),
  venueName: z.string().optional(),
  isPasswordProtected: z.boolean().optional(),
  password: z.string().optional(),
});

export const uploadMediaSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  mediaUrl: z.string().url("Invalid media URL"),
  mediaType: z.enum(["image", "video"]).default("image"),
  uploaderName: z.string().optional(),
  wishMessage: z.string().optional(),
});

export const createCouponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters"),
  discountPercent: z.number().min(1).max(100),
  validUntil: z.string().optional(),
  maxUses: z.number().optional(),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  role: z.enum(["super_admin", "host", "guest"]).optional(),
  subscriptionPlan: z.enum(["free", "starter", "royal", "enterprise"]).optional(),
});
