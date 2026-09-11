import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { CsrfFetchInterceptor } from "@/components/CsrfFetchInterceptor";
import { generateOrganizationSchema, generateWebSiteSchema, generatePlatformSchema } from "@/lib/seo";
import { MainLayoutWrapper } from "@/components/MainLayoutWrapper";
import { SystemGatekeeper } from "@/components/SystemGatekeeper";
import { GoogleAuthProviderWrapper } from "@/components/GoogleAuthProviderWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScanUtsav — #1 QR Code Wedding & Festival Photo Sharing Platform India",
  description: "Collect uncompressed 4K guest photos, HD videos & audio wishes live on venue TV screens. The ultimate QR code event memory app for Weddings, Navratri Garba, Sangeet, Haldi & Corporate Events in India.",
  keywords: "QR code photo sharing, wedding guest photo app, live wedding photo stream venue TV, event QR code standee, Indian wedding QR photo album, Navratri Garba photo sharing, Ganesh Utsav memory wall, Sangeet QR photo upload, Diwali event photo gallery, festival QR guestbook, ScanUtsav",
  authors: [{ name: "ScanUtsav Technologies" }],
  metadataBase: new URL("https://scanutsav.com"),
  alternates: {
    canonical: "https://scanutsav.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "ScanUtsav — Scan Once. Relive Forever | QR Event Photo Sharing",
    description: "Instant QR-based photo and video memory collection for Indian Weddings, Sangeet, Navratri Garba, Diwali Utsav & Corporate Fests.",
    url: "https://scanutsav.com",
    siteName: "ScanUtsav",
    images: [
      {
        url: "/images/royal-wedding.webp",
        width: 1200,
        height: 630,
        alt: "ScanUtsav Live QR Event Memory Wall",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/images/logo-icon.webp", type: "image/webp" },
    ],
    shortcut: "/favicon.svg",
    apple: "/images/logo-icon.webp",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanUtsav — #1 QR Event Memory & Live Photo Stream Platform",
    description: "Instant QR-based photo & video album for Indian weddings, Garba, Diwali & celebrations.",
    images: ["/images/royal-wedding.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF9F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const platformSchema = generatePlatformSchema();

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(platformSchema) }}
        />
      </head>
      <body className="bg-[#FAF9F6] text-slate-900 antialiased selection:bg-amber-500 selection:text-white">
        <GoogleAuthProviderWrapper>
          <SystemGatekeeper>
            <ToastProvider>
              <CsrfFetchInterceptor />
            <Navbar />
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
            <Footer />
            </ToastProvider>
          </SystemGatekeeper>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
