/**
 * Memory DB Fallback Store for ScanUtsav
 * Activates seamlessly when MongoDB local service (port 27017) is unreachable.
 * Enables zero-downtime registration, login, event management, and guest uploads.
 */

export interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  subscriptionPlan: string;
  createdAt: Date;
}

export interface MemoryEvent {
  _id: string;
  hostId: string;
  title: string;
  code: string;
  templateId: string;
  isPasswordProtected: boolean;
  eventPassword?: string;
  autoApproveMedia: boolean;
  externalDriveUrl?: string;
  createdAt: Date;
}

export interface MemoryMedia {
  _id: string;
  eventId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  uploaderName: string;
  wishMessage: string;
  fileSizeBytes: number;
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
}

// Global Memory Collections — Development fallback only.
// WARNING: All data is lost on server restart. Never rely on this in production.
if (!(global as any)._scanutsav_memory_db) {
  (global as any)._scanutsav_memory_db = {
    users: [] as MemoryUser[],
    events: [] as MemoryEvent[],
    media: [] as MemoryMedia[],
  };
}

export const memoryDB = (global as any)._scanutsav_memory_db as {
  users: MemoryUser[];
  events: MemoryEvent[];
  media: MemoryMedia[];
};

export function findMemoryUserByEmail(email: string): MemoryUser | undefined {
  return memoryDB.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createMemoryUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
  subscriptionPlan?: string;
}): MemoryUser {
  const newUser: MemoryUser = {
    _id: `mem_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: userData.name,
    email: userData.email.toLowerCase(),
    passwordHash: userData.passwordHash,
    role: userData.role || "host",
    subscriptionPlan: userData.subscriptionPlan || "trial",
    createdAt: new Date(),
  };
  memoryDB.users.push(newUser);
  return newUser;
}

export function findMemoryEventByCode(code: string): MemoryEvent | undefined {
  return memoryDB.events.find((e) => e.code.toLowerCase() === code.toLowerCase());
}

export function createMemoryEvent(eventData: Partial<MemoryEvent>): MemoryEvent {
  const newEvent: MemoryEvent = {
    _id: `mem_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    hostId: eventData.hostId || "mem_host_default",
    title: eventData.title || "My Utsav Celebration",
    code: (eventData.code || `utsav-${Math.random().toString(36).substring(2, 6)}`).toLowerCase(),
    templateId: eventData.templateId || "royal-wedding",
    isPasswordProtected: Boolean(eventData.isPasswordProtected),
    eventPassword: eventData.eventPassword,
    autoApproveMedia: eventData.autoApproveMedia !== false,
    externalDriveUrl: eventData.externalDriveUrl,
    createdAt: new Date(),
  };
  memoryDB.events.push(newEvent);
  return newEvent;
}

export function createMemoryMedia(mediaData: Partial<MemoryMedia>): MemoryMedia {
  const newMedia: MemoryMedia = {
    _id: `mem_med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventId: mediaData.eventId || "unknown-event",
    mediaUrl: mediaData.mediaUrl || "/images/royal-wedding.webp",
    mediaType: mediaData.mediaType || "image",
    uploaderName: mediaData.uploaderName || "Guest",
    wishMessage: mediaData.wishMessage || "",
    fileSizeBytes: mediaData.fileSizeBytes || 0,
    status: mediaData.status || "approved",
    createdAt: new Date(),
  };
  memoryDB.media.unshift(newMedia);
  return newMedia;
}
