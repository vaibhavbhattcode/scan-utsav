export type PosterFormat = "poster-a4" | "table-card" | "instagram-story" | "whatsapp-square";

export interface PosterTemplateConfig {
  id: string;
  name: string;
  eventType: "wedding" | "ganesh-chaturthi" | "navratri" | "janmashtami" | "birthday" | "corporate" | "other";
  description: string;
  previewThumbnailUrl: string;
  colors: {
    primary: string;
    secondary: string;
    textOnPrimary: string;
    accent: string;
  };
  backgroundMotif: "botanical-paisley" | "modak-lineart" | "garba-mirrorwork" | "peacock-feather" | "confetti-badge" | "platinum-hairline";
  supportedFormats: PosterFormat[];
}

export const POSTER_TEMPLATES: PosterTemplateConfig[] = [
  {
    id: "wedding-royal",
    name: "Royal Royal Wedding Medallion",
    eventType: "wedding",
    description: "Deep maroon & gold foil palette with wax-seal medallion QR frame and paisley border.",
    previewThumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300",
    colors: {
      primary: "#7A1E2B",
      secondary: "#C9A24B",
      textOnPrimary: "#F5EDE0",
      accent: "#D4AA3B",
    },
    backgroundMotif: "botanical-paisley",
    supportedFormats: ["poster-a4", "table-card", "instagram-story", "whatsapp-square"],
  },
  {
    id: "ganesh-marigold",
    name: "Maha Ganesh Chaturthi Pandal",
    eventType: "ganesh-chaturthi",
    description: "Rich marigold & deep crimson with modak line-art motif and bold pandal display type.",
    previewThumbnailUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300",
    colors: {
      primary: "#F2810C",
      secondary: "#7A1E2B",
      textOnPrimary: "#FFFFFF",
      accent: "#FFD9A8",
    },
    backgroundMotif: "modak-lineart",
    supportedFormats: ["poster-a4", "table-card", "instagram-story", "whatsapp-square"],
  },
  {
    id: "navratri-garba",
    name: "Navratri Dandiya Mirrorwork",
    eventType: "navratri",
    description: "Vibrant royal purple & gold with garba mirror-work dots and dandiya divider lines.",
    previewThumbnailUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300",
    colors: {
      primary: "#8B5CF6",
      secondary: "#C9A24B",
      textOnPrimary: "#FFFFFF",
      accent: "#FEF08A",
    },
    backgroundMotif: "garba-mirrorwork",
    supportedFormats: ["poster-a4", "table-card", "instagram-story", "whatsapp-square"],
  },
  {
    id: "janmashtami-peacock",
    name: "Janmashtami Morpankh Grace",
    eventType: "janmashtami",
    description: "Peacock blue & gold with morpankh feather flourishes and flute-inspired dividers.",
    previewThumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    colors: {
      primary: "#0284C7",
      secondary: "#C9A24B",
      textOnPrimary: "#FFFFFF",
      accent: "#BAE6FD",
    },
    backgroundMotif: "peacock-feather",
    supportedFormats: ["poster-a4", "table-card", "instagram-story", "whatsapp-square"],
  },
  {
    id: "birthday-festive",
    name: "Confetti Celebration Badge",
    eventType: "birthday",
    description: "Playful bright palette with confetti scatter background and friendly badge QR layout.",
    previewThumbnailUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300",
    colors: {
      primary: "#EC4899",
      secondary: "#F59E0B",
      textOnPrimary: "#FFFFFF",
      accent: "#FDE68A",
    },
    backgroundMotif: "confetti-badge",
    supportedFormats: ["poster-a4", "table-card", "instagram-story", "whatsapp-square"],
  },
  {
    id: "corporate-sleek",
    name: "Platinum Summit Executive",
    eventType: "corporate",
    description: "Sleek platinum ink & gold hairline accents with prominent company logo slot.",
    previewThumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300",
    colors: {
      primary: "#14100D",
      secondary: "#C9A24B",
      textOnPrimary: "#F5EDE0",
      accent: "#94A3B8",
    },
    backgroundMotif: "platinum-hairline",
    supportedFormats: ["poster-a4", "table-card", "instagram-story", "whatsapp-square"],
  },
];

export function getDefaultTemplateForEventType(eventType: string): PosterTemplateConfig {
  const match = POSTER_TEMPLATES.find((t) => t.eventType === eventType);
  return match || POSTER_TEMPLATES[0]; // fallback to Royal Wedding template
}

export function getTemplateById(id: string): PosterTemplateConfig {
  const match = POSTER_TEMPLATES.find((t) => t.id === id);
  return match || POSTER_TEMPLATES[0];
}
