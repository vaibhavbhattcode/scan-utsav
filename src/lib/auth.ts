import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not configured");
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: "super_admin" | "host" | "guest";
  name: string;
}

export function generateTokens(payload: TokenPayload) {
  const secret = getJwtSecret();
  const refreshSecret = getJwtRefreshSecret();
  const accessToken = jwt.sign(payload, secret, { expiresIn: "2h" });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const refreshSecret = getJwtRefreshSecret();
    return jwt.verify(token, refreshSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function generateGuestEventToken(eventCode: string): string {
  const secret = getJwtSecret();
  return jwt.sign({ eventCode: eventCode.toLowerCase(), role: "guest" }, secret, { expiresIn: "24h" });
}

export function verifyGuestEventToken(token: string, eventCode: string): boolean {
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret) as { eventCode?: string; role?: string };
    return payload?.eventCode?.toLowerCase() === eventCode.toLowerCase();
  } catch {
    return false;
  }
}
