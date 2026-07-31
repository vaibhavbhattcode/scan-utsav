import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "d8f4e1a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1";
}

function getJwtRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET || "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4";
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
