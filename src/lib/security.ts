import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

/**
 * IP-based Rate Limiter (sliding window reset)
 * @param ip Client IP Address
 * @param key Route Identifier
 * @param maxRequests Maximum requests allowed per window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  ip: string,
  key: string = "global",
  maxRequests: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const mapKey = `${ip}:${key}`;
  const now = Date.now();
  const record = rateLimitMap.get(mapKey);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(mapKey, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
