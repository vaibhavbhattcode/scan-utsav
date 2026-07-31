import { TokenPayload } from "./auth";

export type Role = "super_admin" | "host" | "guest";

export const PERMISSIONS = {
  MANAGE_SYSTEM: ["super_admin"],
  MANAGE_CMS: ["super_admin"],
  MANAGE_PRICING: ["super_admin"],
  VIEW_AUDIT_LOGS: ["super_admin"],
  CREATE_EVENT: ["super_admin", "host"],
  MODERATE_UPLOADS: ["super_admin", "host"],
  DOWNLOAD_ARCHIVE: ["super_admin", "host"],
  UPLOAD_MEDIA: ["super_admin", "host", "guest"],
  VIEW_GALLERY: ["super_admin", "host", "guest"],
};

export function hasPermission(user: TokenPayload | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!user) return false;
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(user.role);
}
