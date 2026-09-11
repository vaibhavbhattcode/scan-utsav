import { jwtVerify } from "jose";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export interface EdgeTokenPayload {
  userId: string;
  email: string;
  role: "super_admin" | "host" | "guest";
  name: string;
}

export async function verifyAccessTokenEdge(token: string): Promise<EdgeTokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as EdgeTokenPayload;
  } catch (error) {
    return null;
  }
}
