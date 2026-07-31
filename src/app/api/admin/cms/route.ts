import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CMS from "@/models/CMS";
import { requireAuth } from "@/lib/apiAuth";

const DEFAULT_CMS_DATA = {
  heroTitle: "Scan Once. Relive Forever.",
  heroSubtitle: "India's most premium QR-based Event Memory Platform. Collect uncompressed 4K photos, HD videos, and audio wishes from every guest in real-time.",
  heroTagline: "Zero Downloads Needed • AI Moderated • Live TV Slideshow",
  announcementBanner: "🎉 ScanUtsav 3.0 Live: 30+ Festival Templates & Audio Wishes Activated!",
  stats: {
    memoriesCaptured: "12,500,000+",
    eventsHosted: "45,000+",
    uptimePercentage: "99.99%",
    citiesCovered: "120+"
  },
  features: [
    { title: "Instant QR Scanner", description: "Guests point camera and upload within 2 seconds. Zero app downloads required.", icon: "QrCode", tag: "All Events" },
    { title: "Live Venue TV Slideshow", description: "Broadcast live photos directly on venue TV screens and projectors automatically.", icon: "Tv", tag: "Best for Weddings" },
    { title: "AI Duplicate & Moderation", description: "Smart AI filters low-blur, duplicate images, and objectionable content before publishing.", icon: "Sparkles", tag: "AI Powered" },
    { title: "Printable QR Studio", description: "Design custom framed posters, table standees, and welcome banners in high-res PDF.", icon: "Printer", tag: "Print Ready" },
    { title: "Full Resolution ZIP Export", description: "Download original uncompressed RAW/4K photos and 60fps videos with one click.", icon: "Download", tag: "Pro Archive" },
    { title: "Bank-Grade Encryption", description: "Private invite-only access, SSL encryption, and watermarked guest protections.", icon: "ShieldCheck", tag: "DPDP Ready" }
  ],
  pricingPlans: [
    { id: "free-starter", name: "Free Utsav", priceINR: 0, popular: false, maxStorageGB: 1, features: ["Up to 50 Guests", "Basic Gallery Wall", "Standard QR Generator", "7 Days Storage"] },
    { id: "royal-utsav", name: "Royal Utsav", priceINR: 2499, popular: true, maxStorageGB: 25, features: ["Unlimited Guests", "Live TV Slideshow Mode", "Custom QR Poster Studio", "Full HD ZIP Download", "AI Duplicate Filter", "30 Days Storage"] },
    { id: "enterprise-grand", name: "Grand Utsav", priceINR: 6999, popular: false, maxStorageGB: 100, features: ["Unlimited Guests & Events", "AI Face Recognition Ready", "Dedicated Cloud Folder", "WhatsApp Invite Integration", "Custom Domain Support", "Lifetime Storage Backup"] }
  ],
  navbarLinks: [
    { label: "Features", href: "/features" },
    { label: "Solutions", href: "/solutions" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" }
  ],
  footerColumns: [
    {
      title: "Solutions",
      links: [
        { label: "Weddings & Sangeet", href: "/solutions#wedding" },
        { label: "Corporate Summits", href: "/solutions#corporate" },
        { label: "Birthdays & Anniversaries", href: "/solutions#birthday" },
        { label: "Cultural Festivals", href: "/solutions#festival" }
      ]
    },
    {
      title: "Platform",
      links: [
        { label: "QR Studio", href: "/features" },
        { label: "Live TV Slideshow", href: "/how-it-works" },
        { label: "Pricing Plans", href: "/pricing" },
        { label: "Public Showcase", href: "/gallery" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Support", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" }
      ]
    }
  ],
  socialLinks: [
    { platform: "Instagram", url: "https://instagram.com/scanutsav" },
    { platform: "YouTube", url: "https://youtube.com/scanutsav" },
    { platform: "Twitter", url: "https://twitter.com/scanutsav" }
  ],
  testimonials: [
    {
      name: "Ananya & Vikram Sethi",
      role: "Wedding Hosts, Udaipur",
      quote: "ScanUtsav made our wedding unforgettable! We received 400+ candid photos from guests before the official photographer even packed his bags.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      eventTypeTag: "Royal Wedding"
    },
    {
      name: "Rajesh Sharma",
      role: "Ganesh Utsav Committee Secretary, Mumbai",
      quote: "Over 5,000 devotees scanned the QR standees at our Pandal. The Live TV stream running on 4 large screens created magic!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      eventTypeTag: "Ganesh Chaturthi"
    }
  ],
  galleryShowcase: [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      caption: "Sangeet Night Performance",
      eventTypeTag: "Wedding"
    },
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      caption: "Maha Aarti Procession",
      eventTypeTag: "Ganesh Utsav"
    }
  ],
  faqItems: [
    {
      question: "Do guests need to download an app to upload photos?",
      answer: "No! Guests simply open their phone camera, scan the QR code, and upload photos or videos directly via their web browser in seconds.",
      category: "General"
    },
    {
      question: "Can I moderate photos before they show on the Live TV Slideshow?",
      answer: "Yes. You can enable Host Moderation mode to approve or reject uploads in real-time from your Host Dashboard.",
      category: "Features"
    }
  ],
  themeOverrides: {
    ink: "#14100D",
    marigold: "#F2810C",
    maroon: "#7A1E2B",
    gold: "#C9A24B",
    cream: "#F5EDE0",
    emerald: "#1F8A6F"
  },
  eventTypeThemes: {
    wedding: { accentColor: "#7A1E2B", secondaryColor: "#C9A24B", motif: "rangoli-mandala", displayFont: "serif" },
    "ganesh-chaturthi": { accentColor: "#F2810C", secondaryColor: "#7A1E2B", motif: "diya-flame", displayFont: "sans" },
    navratri: { accentColor: "#8B5CF6", secondaryColor: "#C9A24B", motif: "garba-circle", displayFont: "sans" },
    janmashtami: { accentColor: "#0284C7", secondaryColor: "#C9A24B", motif: "peacock-feather", displayFont: "serif" },
    birthday: { accentColor: "#EC4899", secondaryColor: "#F59E0B", motif: "sparkles", displayFont: "sans" },
    corporate: { accentColor: "#475569", secondaryColor: "#C9A24B", motif: "geometric-clean", displayFont: "sans" }
  }
};

export async function GET() {
  try {
    await connectDB();
    let cmsData = await CMS.findOne();
    if (!cmsData) {
      cmsData = await CMS.create(DEFAULT_CMS_DATA);
    }
    return NextResponse.json({ success: true, cms: cmsData });
  } catch (error: any) {
    return NextResponse.json({ success: true, cms: DEFAULT_CMS_DATA });
  }
}

export async function POST(req: Request) {
  // Enforce Super Admin authorization
  const auth = requireAuth(req, ["super_admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const body = await req.json();
    let cmsData = await CMS.findOne();
    if (cmsData) {
      cmsData = await CMS.findByIdAndUpdate(cmsData._id, { ...body, updatedAt: new Date() }, { new: true });
    } else {
      cmsData = await CMS.create({ ...DEFAULT_CMS_DATA, ...body });
    }
    return NextResponse.json({ success: true, cms: cmsData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update CMS" }, { status: 500 });
  }
}
