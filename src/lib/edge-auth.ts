import { jwtVerify } from "jose";

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "d8f4e1a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1";
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
