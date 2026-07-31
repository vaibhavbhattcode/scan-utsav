import mongoose, { Schema, Document } from "mongoose";

export interface ICMS extends Document {
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  announcementBanner: string;
  stats: {
    memoriesCaptured: string;
    eventsHosted: string;
    uptimePercentage: string;
    citiesCovered: string;
  };
  features: Array<{
    title: string;
    description: string;
    icon: string;
    tag?: string;
  }>;
  pricingPlans: Array<{
    id: string;
    name: string;
    priceINR: number;
    popular: boolean;
    maxStorageGB: number;
    features: string[];
  }>;
  navbarLinks: Array<{
    label: string;
    href: string;
  }>;
  footerColumns: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
    avatar: string;
    eventTypeTag: string;
  }>;
  galleryShowcase: Array<{
    url: string;
    caption: string;
    eventTypeTag: string;
    isVideo?: boolean;
  }>;
  faqItems: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
  themeOverrides: {
    ink?: string;
    marigold?: string;
    maroon?: string;
    gold?: string;
    cream?: string;
    emerald?: string;
  };
  eventTypeThemes: Record<string, {
    accentColor: string;
    secondaryColor: string;
    motif: string;
    displayFont: string;
  }>;
  updatedAt: Date;
}

const CMSSchema: Schema = new Schema(
  {
    heroTitle: { type: String, default: "Scan Once. Relive Forever." },
    heroSubtitle: { type: String, default: "India's most premium QR-based Event Memory Platform for Weddings & Celebrations." },
    heroTagline: { type: String, default: "Zero Downloads Needed • AI Moderated • Live TV Slideshow" },
    announcementBanner: { type: String, default: "🎉 ScanUtsav 3.0 Live: 30+ Festival Templates & Audio Wishes Activated!" },
    stats: {
      memoriesCaptured: { type: String, default: "12,500,000+" },
      eventsHosted: { type: String, default: "45,000+" },
      uptimePercentage: { type: String, default: "99.99%" },
      citiesCovered: { type: String, default: "120+" }
    },
    features: [
      {
        title: String,
        description: String,
        icon: String,
        tag: String
      }
    ],
    pricingPlans: [
      {
        id: String,
        name: String,
        priceINR: Number,
        popular: Boolean,
        maxStorageGB: Number,
        features: [String]
      }
    ],
    navbarLinks: [
      {
        label: String,
        href: String
      }
    ],
    footerColumns: [
      {
        title: String,
        links: [{ label: String, href: String }]
      }
    ],
    socialLinks: [
      {
        platform: String,
        url: String
      }
    ],
    testimonials: [
      {
        name: String,
        role: String,
        quote: String,
        avatar: String,
        eventTypeTag: String
      }
    ],
    galleryShowcase: [
      {
        url: String,
        caption: String,
        eventTypeTag: String,
        isVideo: Boolean
      }
    ],
    faqItems: [
      {
        question: String,
        answer: String,
        category: String
      }
    ],
    themeOverrides: {
      ink: { type: String, default: "#14100D" },
      marigold: { type: String, default: "#F2810C" },
      maroon: { type: String, default: "#7A1E2B" },
      gold: { type: String, default: "#C9A24B" },
      cream: { type: String, default: "#F5EDE0" },
      emerald: { type: String, default: "#1F8A6F" }
    },
    eventTypeThemes: {
      type: Map,
      of: new Schema({
        accentColor: String,
        secondaryColor: String,
        motif: String,
        displayFont: String
      }),
      default: {
        wedding: { accentColor: "#7A1E2B", secondaryColor: "#C9A24B", motif: "rangoli-mandala", displayFont: "serif" },
        "ganesh-chaturthi": { accentColor: "#F2810C", secondaryColor: "#7A1E2B", motif: "diya-flame", displayFont: "sans" },
        navratri: { accentColor: "#8B5CF6", secondaryColor: "#C9A24B", motif: "garba-circle", displayFont: "sans" },
        janmashtami: { accentColor: "#0284C7", secondaryColor: "#C9A24B", motif: "peacock-feather", displayFont: "serif" },
        birthday: { accentColor: "#EC4899", secondaryColor: "#F59E0B", motif: "sparkles", displayFont: "sans" },
        corporate: { accentColor: "#475569", secondaryColor: "#C9A24B", motif: "geometric-clean", displayFont: "sans" },
      }
    }
  },
  { timestamps: true }
);

export default mongoose.models.CMS || mongoose.model<ICMS>("CMS", CMSSchema);
