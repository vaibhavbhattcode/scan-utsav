import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "ScanUtsav - Scan Once. Relive Forever | Premium Event Memory Platform",
  description: "India's most premium QR-based Event Memory Platform. Guests scan QR code to instantly share uncompressed 4K photos, HD videos, and wishes into a live event wall & TV slideshow.",
  keywords: "QR photo sharing, wedding guest photo app, live event gallery, event QR code, wedding slideshow, event memory album India, Ganesh Utsav photo wall, Garba photo sharing",
  authors: [{ name: "ScanUtsav Technologies" }],
  openGraph: {
    title: "ScanUtsav - Scan Once. Relive Forever",
    description: "Instant QR-based photo and video memory collection for Weddings, Corporates & Festivals across India.",
    url: "https://scanutsav.com",
    siteName: "ScanUtsav",
    images: [
      {
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
        width: 1200,
        height: 630,
        alt: "ScanUtsav Live Memory Wall",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanUtsav - Scan Once. Relive Forever",
    description: "Instant QR-based photo & video album for weddings, festivals & events.",
    images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"],
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
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#FAF9F6] text-slate-900 antialiased selection:bg-amber-500 selection:text-white">
        <ToastProvider>
          <Navbar />
          <main className="min-h-screen pt-20 sm:pt-24 bg-[#FAF9F6]">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
