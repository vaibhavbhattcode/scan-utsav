export interface EventTemplate {
  id: string;
  name: string;
  category: "wedding" | "festival" | "corporate" | "party" | "educational" | "commercial";
  themeColor: string;
  accentColor: string;
  bgGradient: string;
  iconName: string;
  tagline: string;
  coverImage: string;
  qrPosterStyle: "mandap" | "dandiya" | "royal" | "corporate" | "festive" | "minimal";
  badgeText: string;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  // 1. WEDDING & CEREMONIES
  {
    id: "royal-wedding",
    name: "Royal Indian Wedding",
    category: "wedding",
    themeColor: "#ff5429",
    accentColor: "#fbbf24",
    bgGradient: "from-amber-950/40 via-[#06080e] to-slate-950",
    iconName: "Heart",
    tagline: "Relive Every Royal Moment of Our Special Mandap & Ceremony!",
    coverImage: "/images/royal-wedding.webp",
    qrPosterStyle: "mandap",
    badgeText: "Most Popular",
  },
  {
    id: "sangeet-night",
    name: "Sangeet & Dance Night",
    category: "wedding",
    themeColor: "#ec4899",
    accentColor: "#8b5cf6",
    bgGradient: "from-pink-950/40 via-[#06080e] to-purple-950/40",
    iconName: "Music",
    tagline: "Capture Bollywood Dance Moves, Stage Performances & Celebration Energy!",
    coverImage: "/images/royal-wedding.webp",
    qrPosterStyle: "royal",
    badgeText: "High Energy",
  },
  {
    id: "mehendi-ceremony",
    name: "Mehendi Ceremony",
    category: "wedding",
    themeColor: "#10b981",
    accentColor: "#f59e0b",
    bgGradient: "from-emerald-950/40 via-[#06080e] to-amber-950/40",
    iconName: "Sparkles",
    tagline: "Share Intricate Henna Designs, Floral Jewelry & Festive Laughs!",
    coverImage: "/images/royal-wedding.webp",
    qrPosterStyle: "mandap",
    badgeText: "Traditional",
  },
  {
    id: "haldi-ceremony",
    name: "Haldi Utsav",
    category: "wedding",
    themeColor: "#f59e0b",
    accentColor: "#ea580c",
    bgGradient: "from-amber-950/50 via-[#06080e] to-orange-950/40",
    iconName: "Sun",
    tagline: "Golden Turmeric Blessings, Marigold Floral Shower & Vibrant Haldi Moments!",
    coverImage: "/images/royal-wedding.webp",
    qrPosterStyle: "festive",
    badgeText: "Golden Vibes",
  },
  {
    id: "engagement-ceremony",
    name: "Ring Ceremony & Engagement",
    category: "wedding",
    themeColor: "#6366f1",
    accentColor: "#fbbf24",
    bgGradient: "from-indigo-950/40 via-[#06080e] to-slate-950",
    iconName: "Gem",
    tagline: "Two Hearts Joined in Commitment. Share Your Love & Blessings!",
    coverImage: "/images/royal-wedding.webp",
    qrPosterStyle: "royal",
    badgeText: "Elegant",
  },
  {
    id: "reception-gala",
    name: "Grand Reception Gala",
    category: "wedding",
    themeColor: "#e11d48",
    accentColor: "#f59e0b",
    bgGradient: "from-rose-950/40 via-[#06080e] to-slate-950",
    iconName: "PartyPopper",
    tagline: "A Night of Royal Grandeur, Fine Dining & Timeless Family Portraits!",
    coverImage: "/images/royal-wedding.webp",
    qrPosterStyle: "mandap",
    badgeText: "Luxury",
  },

  // 2. INDIAN FESTIVALS & RELIGIOUS UTSAVS
  {
    id: "ganesh-chaturthi",
    name: "Maha Ganesh Chaturthi Utsav",
    category: "festival",
    themeColor: "#ff5429",
    accentColor: "#f59e0b",
    bgGradient: "from-orange-950/50 via-[#06080e] to-amber-950/50",
    iconName: "Flame",
    tagline: "Ganpati Bappa Morya! Share Pandal Darshan, Modak Offerings & Evening Aarti!",
    coverImage: "/images/ganesh-chaturthi.webp",
    qrPosterStyle: "festive",
    badgeText: "Bappa Utsav",
  },
  {
    id: "navratri-garba",
    name: "Navratri Garba & Dandiya Raas",
    category: "festival",
    themeColor: "#8b5cf6",
    accentColor: "#ec4899",
    bgGradient: "from-purple-950/50 via-[#06080e] to-pink-950/50",
    iconName: "Sparkles",
    tagline: "Chalo Garba! Share Vibrant Chaniya Choli, Kedia Costumes & Fast Raas Steps!",
    coverImage: "/images/navratri-garba.webp",
    qrPosterStyle: "dandiya",
    badgeText: "Garba Night",
  },

  // 3. CORPORATE & COMMERCIAL
  {
    id: "corporate-summit",
    name: "Corporate Annual Summit",
    category: "corporate",
    themeColor: "#3b82f6",
    accentColor: "#64748b",
    bgGradient: "from-slate-900 via-[#06080e] to-blue-950/40",
    iconName: "Briefcase",
    tagline: "Keynote Speeches, Leadership Awards & Networking Highlights!",
    coverImage: "/images/corporate-summit.webp",
    qrPosterStyle: "corporate",
    badgeText: "Enterprise",
  },

  // 4. PARTIES & EDUCATIONAL
  {
    id: "birthday-bash",
    name: "Birthday Celebration Utsav",
    category: "party",
    themeColor: "#f43f5e",
    accentColor: "#facc15",
    bgGradient: "from-rose-950/40 via-[#06080e] to-amber-950/40",
    iconName: "Cake",
    tagline: "Cheers to Another Year! Share Warm Wishes & Cake Cutting Snaps!",
    coverImage: "/images/birthday-party.webp",
    qrPosterStyle: "festive",
    badgeText: "Celebration",
  }
];

export function getTemplateById(id: string): EventTemplate {
  return EVENT_TEMPLATES.find((t) => t.id === id) || EVENT_TEMPLATES[0];
}
