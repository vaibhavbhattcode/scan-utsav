import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { headers } from "next/headers";

type Props = {
  params: { code: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.code.toUpperCase();

  try {
    await connectDB();
    const event: any = await Event.findOne({ code, isActive: true }).lean();

    if (!event) {
      return {
        title: "Event Not Found | ScanUtsav",
        description: "This event does not exist or has been disabled.",
      };
    }

    const title = `${event.title} - Live Memory Stream | ScanUtsav`;
    const description = `Join ${event.title} and instantly share your photos and videos on the live memory stream. No app download required!`;
    const imageUrl = event.coverImage || "https://scanutsav.com/images/royal-wedding.webp";
    
    // Attempt to get the current URL for canonical links
    const headersList = headers();
    const host = headersList.get("host") || "scanutsav.com";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const currentUrl = `${protocol}://${host}/e/${code}`;

    return {
      title,
      description,
      alternates: {
        canonical: currentUrl,
      },
      openGraph: {
        title,
        description,
        url: currentUrl,
        siteName: "ScanUtsav",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${event.title} Cover Image`,
          },
        ],
        locale: "en_IN",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "ScanUtsav Event",
      description: "Live Event Memory Stream",
    };
  }
}

export default function EventLayout({ children }: Props) {
  return <>{children}</>;
}
