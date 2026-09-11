export function canAccessFeature(
  planId: string,
  feature: "zip-download" | "moderation-desk" | "face-search" | "live-tv" | "custom-branding"
): boolean {
  const planLevels: Record<string, number> = {
    trial: 0,
    lite: 1,
    standard: 2,
    premium: 3,
    ultimate: 4,
    creator: 4,
    studio: 4,
    enterprise: 4,
  };
  const level = planLevels[planId] ?? 0;

  switch (feature) {
    case "moderation-desk":
    case "zip-download":
      return level >= 2; // Standard and above
    case "face-search":
    case "live-tv":
      return level >= 3; // Premium and above
    case "custom-branding":
      return level >= 4; // Ultimate and Agencies
    default:
      return false;
  }
}
